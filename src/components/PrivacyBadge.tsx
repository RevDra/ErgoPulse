// ─── Privacy badge component ───
import React from 'react';
import { ShieldCheck, Wifi, WifiOff } from 'lucide-react';

interface PrivacyBadgeProps {
  compact?: boolean;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-sage-500/10 border border-sage-500/20">
        <ShieldCheck className="w-3 h-3 text-sage-400" />
        <span className="text-[10px] text-sage-400 font-medium">Local Only</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-sage-500/8 border border-sage-500/20 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-sage-400" />
        <span className="text-xs text-sage-300 font-medium">
          100% Local Inference
        </span>
      </div>
      <div className="w-px h-4 bg-slate-700" />
      <div className="flex items-center gap-1.5">
        <WifiOff className="w-3.5 h-3.5 text-sage-500" />
        <span className="text-xs text-slate-400">
          No Video Leaves Your Device
        </span>
      </div>
    </div>
  );
};
