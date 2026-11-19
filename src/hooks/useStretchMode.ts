// ─── Stretch mode hook for guided neck/shoulder exercises ───
import { useState, useRef, useCallback, useEffect } from 'react';
import type { StretchExercise } from '../types';
import { playTick, playChime } from '../utils/audio';

const STRETCH_EXERCISES: StretchExercise[] = [
  {
    name: 'Left Neck Tilt',
    instruction: 'Slowly tilt your head to the LEFT',
    targetDirection: 'left',
    durationMs: 8000,
  },
  {
    name: 'Right Neck Tilt',
    instruction: 'Slowly tilt your head to the RIGHT',
    targetDirection: 'right',
    durationMs: 8000,
  },
  {
    name: 'Look Up',
    instruction: 'Slowly look UP toward the ceiling',
    targetDirection: 'up',
    durationMs: 8000,
  },
  {
    name: 'Look Down (Chin Tuck)',
    instruction: 'Slowly tuck your chin DOWN',
    targetDirection: 'down',
    durationMs: 8000,
  },
  {
    name: 'Left Neck Tilt (Rep 2)',
    instruction: 'Tilt head LEFT again — nice and slow',
    targetDirection: 'left',
    durationMs: 8000,
  },
  {
    name: 'Right Neck Tilt (Rep 2)',
    instruction: 'Tilt head RIGHT again — hold it',
    targetDirection: 'right',
    durationMs: 8000,
  },
];

interface UseStretchReturn {
  isStretching: boolean;
  currentExercise: StretchExercise | null;
  exerciseIndex: number;
  totalExercises: number;
  holdProgress: number; // 0–1
  isHoldingCorrectly: boolean;
  totalProgress: number; // 0–1 for entire routine
  timeRemaining: number; // seconds for current exercise
  startStretch: () => void;
  stopStretch: () => void;
  completedCount: number;
}

export function useStretchMode(
  headTilt: { pitch: number; yaw: number; roll: number }
): UseStretchReturn {
  const [isStretching, setIsStretching] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHoldingCorrectly, setIsHoldingCorrectly] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const holdStartRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  const currentExercise = isStretching ? STRETCH_EXERCISES[exerciseIndex] || null : null;
  const totalExercises = STRETCH_EXERCISES.length;
  const totalProgress = isStretching ? exerciseIndex / totalExercises : 0;

  const checkDirection = useCallback(
    (direction: string): boolean => {
      const threshold = 3;
      switch (direction) {
        case 'left':
          return headTilt.yaw < -threshold;
        case 'right':
          return headTilt.yaw > threshold;
        case 'up':
          return headTilt.pitch < -threshold;
        case 'down':
          return headTilt.pitch > threshold;
        default:
          return false;
      }
    },
    [headTilt]
  );

  const startStretch = useCallback(() => {
    setIsStretching(true);
    setExerciseIndex(0);
    setHoldProgress(0);
    setCompletedCount(0);
    holdStartRef.current = null;
    playChime('gentle');
  }, []);

  const stopStretch = useCallback(() => {
    setIsStretching(false);
    setExerciseIndex(0);
    setHoldProgress(0);
    holdStartRef.current = null;
  }, []);

  // Exercise progression loop
  useEffect(() => {
    if (!isStretching || !currentExercise) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const correct = checkDirection(currentExercise.targetDirection);
      setIsHoldingCorrectly(correct);

      if (correct) {
        if (!holdStartRef.current) {
          holdStartRef.current = now;
        }
        const elapsed = now - holdStartRef.current;
        const progress = Math.min(elapsed / currentExercise.durationMs, 1);
        setHoldProgress(progress);
        setTimeRemaining(
          Math.max(0, Math.ceil((currentExercise.durationMs - elapsed) / 1000))
        );

        // Tick feedback every 2 seconds
        if (now - lastTickRef.current > 2000) {
          playTick();
          lastTickRef.current = now;
        }

        if (progress >= 1) {
          // Exercise complete
          playChime('success');
          setCompletedCount((c) => c + 1);
          if (exerciseIndex < totalExercises - 1) {
            setExerciseIndex((i) => i + 1);
            setHoldProgress(0);
            holdStartRef.current = null;
          } else {
            // All done
            setIsStretching(false);
            playChime('success');
          }
        }
      } else {
        // Reset hold if not in correct position
        if (holdStartRef.current && now - holdStartRef.current > 500) {
          // Grace period — allow small breaks
        }
        setTimeRemaining(Math.ceil(currentExercise.durationMs / 1000));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isStretching, currentExercise, exerciseIndex, totalExercises, checkDirection]);

  return {
    isStretching,
    currentExercise,
    exerciseIndex,
    totalExercises,
    holdProgress,
    isHoldingCorrectly,
    totalProgress,
    timeRemaining,
    startStretch,
    stopStretch,
    completedCount,
  };
}
