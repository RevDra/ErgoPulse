// ─── Webcam preview with landmark overlay & graceful permission fallback ───
import React from 'react';
import { Camera, CameraOff, Eye, EyeOff, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';
import type { VisionState } from '../types';

interface WebcamPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  visionState: VisionState;
  showOverlay: boolean;
  onToggleOverlay: () => void;
  onRetry?: () => void;
  onOpenGuide?: () => void;
  compact?: boolean;
}

export const WebcamPreview: React.FC<WebcamPreviewProps> = ({
  videoRef,
  canvasRef,
  visionState,
  showOverlay,
  onToggleOverlay,
  onRetry,
  onOpenGuide,
  compact = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900 border border-slate-700/50 ${
        compact ? 'w-full aspect-video' : 'w-full aspect-[4/3]'
      }`}
    >
      {/* Video feed */}
      <video
        ref={videoRef as React.RefObject<HTMLVideoElement>}
        className="webcam-mirror w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Landmark overlay canvas */}
      <canvas ref={canvasRef as React.RefObject<HTMLCanvasElement>} className="landmark-canvas" />

      {/* Status indicators */}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        {visionState.isRunning && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-white/80 font-mono">
              {visionState.fps} FPS
            </span>
          </div>
        )}
        {visionState.hasFace && (
          <div className="px-2 py-1 rounded-full bg-sage-500/20 backdrop-blur-sm">
            <span className="text-[10px] text-sage-300">Face ✓</span>
          </div>
        )}
        {visionState.hasPose && (
          <div className="px-2 py-1 rounded-full bg-sage-500/20 backdrop-blur-sm">
            <span className="text-[10px] text-sage-300">Pose ✓</span>
          </div>
        )}
      </div>

      {/* Overlay toggle */}
      {visionState.isRunning && (
        <button
          onClick={onToggleOverlay}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm
                     hover:bg-black/60 transition-colors"
          title={showOverlay ? 'Hide skeleton' : 'Show skeleton'}
        >
          {showOverlay ? (
            <Eye className="w-3.5 h-3.5 text-sage-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
      )}

      {/* Loading states */}
      {visionState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/85 backdrop-blur-sm">
          <div className="text-center p-4">
            <div className="w-9 h-9 border-2 border-sage-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">Loading AI vision engine…</p>
            <p className="text-xs text-slate-500 mt-1">
              Initializing WebAssembly & MediaPipe Landmarkers locally
            </p>
          </div>
        </div>
      )}

      {/* Graceful Camera Error / Permission Fallback Recovery Card */}
      {visionState.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-6">
          <div className="text-center max-w-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <CameraOff className="w-6 h-6" />
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Camera Access Blocked or Unavailable</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {visionState.error}
              </p>
            </div>

            <div className="text-left rounded-lg bg-slate-900 p-3 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>How to enable webcam in your browser:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Look for the camera / lock icon in your browser URL bar.</li>
                <li>Set Camera permissions to <strong>"Allow"</strong> for this site.</li>
                <li>Make sure no other software (Zoom, Teams) is monopolizing the camera.</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3.5 py-1.5 rounded-lg bg-sage-500/20 text-sage-300 hover:bg-sage-500/30 border border-sage-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Camera
                </button>
              )}
              {onOpenGuide && (
                <button
                  onClick={onOpenGuide}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  View Guide
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Camera Off state */}
      {!visionState.isRunning && !visionState.isLoading && !visionState.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-3">
              <Camera className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">Camera is Inactive</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Click <strong>"Start Monitoring"</strong> in the top header to begin 100% on-device ergonomic tracking.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
