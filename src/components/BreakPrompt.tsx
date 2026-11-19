// ─── Break prompt & 20-20-20 rule component ───
import React from 'react';
import { Coffee, Timer, X, Eye } from 'lucide-react';
import { formatTime } from '../utils/math';

interface BreakPromptProps {
  isVisible: boolean;
  timeSinceBreak: number;
  onDismiss: () => void;
  onStartStretch: () => void;
}

export const BreakPrompt: React.FC<BreakPromptProps> = ({
  isVisible,
  timeSinceBreak,
  onDismiss,
  onStartStretch,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-card max-w-sm w-full mx-4 p-6 animate-slide-up">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-sage-500/15 flex items-center justify-center mx-auto mb-4">
          <Coffee className="w-7 h-7 text-sage-400" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-center text-slate-100 mb-1">
          Time for a Break
        </h2>
        <p className="text-sm text-slate-400 text-center mb-5">
          You've been working for{' '}
          <span className="text-sage-400 font-medium">
            {formatTime(timeSinceBreak / 1000)}
          </span>
          . Give your eyes and body a rest.
        </p>

        {/* 20-20-20 Rule */}
        <div className="glass-card-sm p-3 mb-4 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-blue-400">
              20-20-20 Eye Rule
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Look at something <strong className="text-slate-300">20 feet away</strong>{' '}
            for <strong className="text-slate-300">20 seconds</strong> every{' '}
            <strong className="text-slate-300">20 minutes</strong>.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                       bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              onDismiss();
              onStartStretch();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                       bg-sage-500/20 text-sage-300 hover:bg-sage-500/30
                       border border-sage-500/30 transition-colors"
          >
            Start Stretch (60s)
          </button>
        </div>
      </div>
    </div>
  );
};
