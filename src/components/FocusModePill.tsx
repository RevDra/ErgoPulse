// ─── Compact floating status pill (Focus Mode) ───
import React from 'react';
import { Minimize2, Maximize2, Activity, Eye, Brain } from 'lucide-react';
import type { PostureMetrics, EyeMetrics, FatigueMetrics } from '../types';

interface FocusModePillProps {
  isActive: boolean;
  posture: PostureMetrics;
  eyes: EyeMetrics;
  fatigue: FatigueMetrics;
  sessionDuration: number;
  onToggle: () => void;
}

export const FocusModePill: React.FC<FocusModePillProps> = ({
  isActive,
  posture,
  eyes,
  fatigue,
  sessionDuration,
  onToggle,
}) => {
  if (!isActive) return null;

  const postureStatus =
    posture.postureScore >= 70
      ? 'text-sage-400'
      : posture.postureScore >= 40
        ? 'text-amber-400'
        : 'text-red-400';

  const eyeStatus = eyes.lowBlinkRate ? 'text-amber-400' : 'text-sage-400';

  const fatigueStatus =
    fatigue.fatigueScore < 30
      ? 'text-sage-400'
      : fatigue.fatigueScore < 60
        ? 'text-amber-400'
        : 'text-red-400';

  const hours = Math.floor(sessionDuration / 3600000);
  const mins = Math.floor((sessionDuration % 3600000) / 60000);
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-slide-up">
      <div
        className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl
                    border border-slate-700/50 shadow-2xl shadow-black/40 cursor-pointer
                    hover:bg-slate-800/90 transition-all"
        onClick={onToggle}
      >
        {/* Logo */}
        <span className="text-sm font-bold text-sage-400">EP</span>

        <div className="w-px h-5 bg-slate-700" />

        {/* Metrics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Activity className={`w-3.5 h-3.5 ${postureStatus}`} />
            <span className={`text-xs font-mono ${postureStatus}`}>
              {posture.postureScore}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className={`w-3.5 h-3.5 ${eyeStatus}`} />
            <span className={`text-xs font-mono ${eyeStatus}`}>
              {Math.round(eyes.blinkRate)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Brain className={`w-3.5 h-3.5 ${fatigueStatus}`} />
            <span className={`text-xs font-mono ${fatigueStatus}`}>
              {fatigue.fatigueScore}
            </span>
          </div>
        </div>

        <div className="w-px h-5 bg-slate-700" />

        <span className="text-[11px] text-slate-500 font-mono">{timeStr}</span>

        <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
      </div>
    </div>
  );
};
