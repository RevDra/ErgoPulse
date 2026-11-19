// ─── Compact Session Summary & Wellbeing Recap Card ───
import React from 'react';
import {
  Award,
  Clock,
  Activity,
  Eye,
  CheckCircle2,
  Sparkles,
  Share2,
} from 'lucide-react';
import type { WellbeingSnapshot, PostureMetrics, EyeMetrics } from '../types';
import { formatTime } from '../utils/math';

interface SessionSummaryCardProps {
  sessionDuration: number;
  timeline: WellbeingSnapshot[];
  currentPosture: PostureMetrics;
  currentEyes: EyeMetrics;
  completedStretches: number;
  isRunning: boolean;
}

export const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({
  sessionDuration,
  timeline,
  currentPosture,
  currentEyes,
  completedStretches,
  isRunning,
}) => {
  // Compute session averages if timeline has data, else use current
  const avgPosture =
    timeline.length > 0
      ? Math.round(
          timeline.reduce((acc, curr) => acc + curr.postureScore, 0) /
            timeline.length
        )
      : currentPosture.postureScore;

  const avgBlinks =
    timeline.length > 0
      ? Math.round(
          (timeline.reduce((acc, curr) => acc + curr.blinkRate, 0) /
            timeline.length) *
            10
        ) / 10
      : Math.round(currentEyes.blinkRate * 10) / 10;

  // Wellbeing score grade
  const wellbeingGrade =
    avgPosture >= 85
      ? { grade: 'A+', label: 'Excellent Alignment', color: 'text-sage-400', border: 'border-sage-500/30' }
      : avgPosture >= 70
      ? { grade: 'B', label: 'Good Ergonomics', color: 'text-emerald-400', border: 'border-emerald-500/30' }
      : avgPosture >= 50
      ? { grade: 'C', label: 'Needs Improvement', color: 'text-amber-400', border: 'border-amber-500/30' }
      : { grade: 'D', label: 'High Fatigue / Slouch', color: 'text-red-400', border: 'border-red-500/30' };

  return (
    <div className="glass-card-sm p-4 border border-slate-700/60 bg-gradient-to-br from-slate-900/80 to-slate-900/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-sage-400" />
          <h3 className="text-xs font-medium text-slate-300 uppercase tracking-wider">
            Session Wellbeing Recap
          </h3>
        </div>
        {isRunning && (
          <span className="flex items-center gap-1.5 text-[10px] text-sage-400 px-2 py-0.5 rounded-full bg-sage-500/10 border border-sage-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
            Active Session
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        {/* Focus Duration */}
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Focus Time</span>
          </div>
          <div className="text-base font-semibold text-slate-200 font-mono">
            {formatTime(sessionDuration / 1000)}
          </div>
        </div>

        {/* Avg Posture */}
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
            <Activity className="w-3 h-3 text-sage-400" />
            <span>Avg Posture</span>
          </div>
          <div className="text-base font-semibold text-sage-300 font-mono">
            {avgPosture}
            <span className="text-[10px] text-slate-500 font-normal ml-0.5">/100</span>
          </div>
        </div>

        {/* Blink Health */}
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
            <Eye className="w-3 h-3 text-blue-400" />
            <span>Blink Rate</span>
          </div>
          <div className="text-base font-semibold text-blue-300 font-mono">
            {avgBlinks}
            <span className="text-[10px] text-slate-500 font-normal ml-0.5">bpm</span>
          </div>
        </div>

        {/* Stretches Completed */}
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Stretches</span>
          </div>
          <div className="text-base font-semibold text-amber-300 font-mono">
            {completedStretches}
            <span className="text-[10px] text-slate-500 font-normal ml-0.5">reps</span>
          </div>
        </div>
      </div>

      <div className={`p-2.5 rounded-xl bg-slate-900/90 border ${wellbeingGrade.border} flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <span className={`text-xl font-bold font-mono ${wellbeingGrade.color}`}>
            {wellbeingGrade.grade}
          </span>
          <div>
            <div className={`text-xs font-semibold ${wellbeingGrade.color}`}>
              {wellbeingGrade.label}
            </div>
            <div className="text-[10px] text-slate-400">
              {timeline.length > 5
                ? `Calculated from ${timeline.length} continuous telemetry checkpoints`
                : 'Begin session & calibration to track real-time wellness rating'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-sage-400" />
          <span className="hidden sm:inline">100% On-Device</span>
        </div>
      </div>
    </div>
  );
};
