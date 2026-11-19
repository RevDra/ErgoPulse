// ─── Wellbeing timeline & alert management hook ───
import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  PostureMetrics,
  EyeMetrics,
  FatigueMetrics,
  WellbeingSnapshot,
  AlertType,
} from '../types';
import { playChime } from '../utils/audio';

const TIMELINE_DURATION = 15 * 60 * 1000; // 15 minutes
const SNAPSHOT_INTERVAL = 5000; // Every 5 seconds
const MAX_SNAPSHOTS = TIMELINE_DURATION / SNAPSHOT_INTERVAL;
const ALERT_PERSIST_MS = 5000; // Bad posture must persist 5s before alert
const BREAK_INTERVAL = 20 * 60 * 1000; // 20 minutes

interface UseWellbeingReturn {
  timeline: WellbeingSnapshot[];
  activeAlert: AlertType;
  sessionDuration: number;
  timeSinceBreak: number;
  breakDue: boolean;
  triggerBreak: () => void;
  dismissBreak: () => void;
  sessionStartTime: number | null;
  startSession: () => void;
}

export function useWellbeingMetrics(
  posture: PostureMetrics,
  eyes: EyeMetrics,
  fatigue: FatigueMetrics,
  isRunning: boolean
): UseWellbeingReturn {
  const [timeline, setTimeline] = useState<WellbeingSnapshot[]>([]);
  const [activeAlert, setActiveAlert] = useState<AlertType>('none');
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [timeSinceBreak, setTimeSinceBreak] = useState(0);
  const [breakDue, setBreakDue] = useState(false);

  const lastBreakRef = useRef<number>(Date.now());
  const alertStartRef = useRef<{ type: AlertType; since: number }>({
    type: 'none',
    since: 0,
  });
  const alertPlayedRef = useRef(false);

  const startSession = useCallback(() => {
    setSessionStartTime(Date.now());
    lastBreakRef.current = Date.now();
    setTimeline([]);
    setBreakDue(false);
  }, []);

  const triggerBreak = useCallback(() => {
    setBreakDue(true);
    playChime('gentle');
  }, []);

  const dismissBreak = useCallback(() => {
    setBreakDue(false);
    lastBreakRef.current = Date.now();
    alertPlayedRef.current = false;
  }, []);

  // Snapshot timer
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setTimeline((prev) => {
        const next = [
          ...prev,
          {
            timestamp: now,
            postureScore: posture.postureScore,
            blinkRate: eyes.blinkRate,
            fatigueScore: fatigue.fatigueScore,
            relativeDistance: posture.relativeDistance,
          },
        ];
        return next.slice(-MAX_SNAPSHOTS);
      });
    }, SNAPSHOT_INTERVAL);

    return () => clearInterval(interval);
  }, [isRunning, posture, eyes, fatigue]);

  // Session duration & break timer
  useEffect(() => {
    if (!isRunning || !sessionStartTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setSessionDuration(now - sessionStartTime);
      const sinceBreak = now - lastBreakRef.current;
      setTimeSinceBreak(sinceBreak);

      if (sinceBreak >= BREAK_INTERVAL && !breakDue) {
        setBreakDue(true);
        playChime('alert');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, sessionStartTime, breakDue]);

  // Alert management with 5-second persistence check
  useEffect(() => {
    if (!isRunning) {
      setActiveAlert('none');
      return;
    }

    let currentIssue: AlertType = 'none';
    if (posture.isSlouching || posture.tooClose) {
      currentIssue = 'posture';
    } else if (eyes.lowBlinkRate) {
      currentIssue = 'eyestrain';
    } else if (fatigue.fatigueScore > 60) {
      currentIssue = 'fatigue';
    }

    const now = Date.now();

    if (currentIssue === 'none') {
      alertStartRef.current = { type: 'none', since: 0 };
      alertPlayedRef.current = false;
      setActiveAlert('none');
    } else if (alertStartRef.current.type !== currentIssue) {
      alertStartRef.current = { type: currentIssue, since: now };
      alertPlayedRef.current = false;
    } else if (now - alertStartRef.current.since >= ALERT_PERSIST_MS) {
      setActiveAlert(currentIssue);
      if (!alertPlayedRef.current) {
        playChime('alert');
        alertPlayedRef.current = true;
      }
    }
  }, [isRunning, posture, eyes, fatigue]);

  return {
    timeline,
    activeAlert,
    sessionDuration,
    timeSinceBreak,
    breakDue,
    triggerBreak,
    dismissBreak,
    sessionStartTime,
    startSession,
  };
}
