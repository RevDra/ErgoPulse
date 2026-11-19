// ─── Calibration flow component ───
import React, { useState, useEffect, useCallback } from 'react';
import { Crosshair, CheckCircle, AlertCircle } from 'lucide-react';
import type { CalibrationData, VisionState } from '../types';

interface CalibrationFlowProps {
  visionState: VisionState;
  calibrationData: CalibrationData | null;
  onCalibrate: () => void;
}

export const CalibrationFlow: React.FC<CalibrationFlowProps> = ({
  visionState,
  calibrationData,
  onCalibrate,
}) => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [justCalibrated, setJustCalibrated] = useState(false);

  const startCalibration = useCallback(() => {
    if (!visionState.hasFace || !visionState.hasPose) return;
    setIsCalibrating(true);
    setCountdown(3);
  }, [visionState]);

  useEffect(() => {
    if (!isCalibrating || countdown <= 0) return;

    const timer = setTimeout(() => {
      if (countdown === 1) {
        // Perform calibration
        onCalibrate();
        setIsCalibrating(false);
        setJustCalibrated(true);
        setTimeout(() => setJustCalibrated(false), 3000);
      }
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isCalibrating, countdown, onCalibrate]);

  const canCalibrate = visionState.isRunning && visionState.hasFace && visionState.hasPose;

  return (
    <div className="glass-card-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-sage-400" />
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Calibration
          </h3>
        </div>
        {calibrationData && (
          <div className="flex items-center gap-1 text-sage-400">
            <CheckCircle className="w-3 h-3" />
            <span className="text-[10px]">Set</span>
          </div>
        )}
      </div>

      {isCalibrating ? (
        <div className="text-center py-2">
          <div className="text-3xl font-bold text-sage-400 mb-1">{countdown}</div>
          <p className="text-xs text-slate-400">
            Hold your ideal posture…
          </p>
        </div>
      ) : justCalibrated ? (
        <div className="text-center py-2">
          <CheckCircle className="w-6 h-6 text-sage-400 mx-auto mb-1" />
          <p className="text-xs text-sage-400 font-medium">
            Baseline captured!
          </p>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-slate-500 mb-3">
            Sit in your ideal posture, then click to set your baseline.
          </p>
          <button
            onClick={startCalibration}
            disabled={!canCalibrate}
            className="w-full px-3 py-2 rounded-lg text-xs font-medium transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed
                       bg-sage-500/20 text-sage-300 hover:bg-sage-500/30 border border-sage-500/30"
          >
            {!canCalibrate ? (
              <span className="flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                Start camera first
              </span>
            ) : (
              'Set My Baseline Posture (3s)'
            )}
          </button>
        </>
      )}
    </div>
  );
};
