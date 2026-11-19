// ─── Stretch mode overlay with progress rings ───
import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  X,
  CheckCircle,
} from 'lucide-react';
import type { StretchExercise } from '../types';

interface StretchOverlayProps {
  isActive: boolean;
  currentExercise: StretchExercise | null;
  exerciseIndex: number;
  totalExercises: number;
  holdProgress: number;
  isHoldingCorrectly: boolean;
  timeRemaining: number;
  completedCount: number;
  onStop: () => void;
}

const directionIcons = {
  left: ArrowLeft,
  right: ArrowRight,
  up: ArrowUp,
  down: ArrowDown,
};

export const StretchOverlay: React.FC<StretchOverlayProps> = ({
  isActive,
  currentExercise,
  exerciseIndex,
  totalExercises,
  holdProgress,
  isHoldingCorrectly,
  timeRemaining,
  completedCount,
  onStop,
}) => {
  if (!isActive || !currentExercise) return null;

  const DirIcon = directionIcons[currentExercise.targetDirection];
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference * (1 - holdProgress);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="text-center max-w-md mx-4">
        {/* Close */}
        <button
          onClick={onStop}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Exercise counter */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: totalExercises }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i < completedCount
                  ? 'bg-sage-400'
                  : i === exerciseIndex
                    ? 'bg-sage-400 scale-125'
                    : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Progress ring */}
        <div className="relative w-40 h-40 mx-auto mb-6">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#1e293b"
              strokeWidth="4"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isHoldingCorrectly ? '#7d9b7d' : '#475569'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-200"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <DirIcon
              className={`w-10 h-10 mb-1 transition-colors ${
                isHoldingCorrectly
                  ? 'text-sage-400 stretch-pulse'
                  : 'text-slate-500'
              }`}
            />
            <span className="text-lg font-bold text-slate-200 tabular-nums">
              {timeRemaining}s
            </span>
          </div>
        </div>

        {/* Instruction */}
        <h2 className="text-xl font-semibold text-slate-100 mb-2">
          {currentExercise.name}
        </h2>
        <p
          className={`text-sm transition-colors ${
            isHoldingCorrectly ? 'text-sage-400' : 'text-slate-400'
          }`}
        >
          {isHoldingCorrectly ? (
            <span className="flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Perfect! Hold it…
            </span>
          ) : (
            currentExercise.instruction
          )}
        </p>

        {/* Overall progress bar */}
        <div className="mt-8 w-full max-w-xs mx-auto">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Exercise {exerciseIndex + 1} / {totalExercises}</span>
            <span>{Math.round((completedCount / totalExercises) * 100)}%</span>
          </div>
          <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-sage-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalExercises) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
