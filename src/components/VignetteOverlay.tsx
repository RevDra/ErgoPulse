// ─── Vignette alert overlay component ───
import React from 'react';
import type { AlertType } from '../types';

interface VignetteOverlayProps {
  alertType: AlertType;
}

export const VignetteOverlay: React.FC<VignetteOverlayProps> = ({ alertType }) => {
  if (alertType === 'none') return null;

  const classMap: Record<string, string> = {
    posture: 'vignette-amber',
    eyestrain: 'vignette-blue',
    fatigue: 'vignette-red',
  };

  return (
    <div
      className={`vignette-overlay ${classMap[alertType] ?? ''}`}
      style={{ opacity: 1 }}
    />
  );
};
