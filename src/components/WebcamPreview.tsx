// ─── Webcam preview with landmark overlay ───
import React from 'react';
import { Camera, CameraOff, Layers, Eye, EyeOff } from 'lucide-react';
import type { VisionState } from '../types';

interface WebcamPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  visionState: VisionState;
  showOverlay: boolean;
  onToggleOverlay: () => void;
  compact?: boolean;
}

export const WebcamPreview: React.FC<WebcamPreviewProps> = ({
  videoRef,
  canvasRef,
  visionState,
  showOverlay,
  onToggleOverlay,
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

      {/* Loading / error states */}
      {visionState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-sage-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading AI models…</p>
            <p className="text-xs text-slate-500 mt-1">
              Downloading FaceLandmarker & PoseLandmarker
            </p>
          </div>
        </div>
      )}

      {visionState.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
          <div className="text-center">
            <CameraOff className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-400 mb-1">Camera Error</p>
            <p className="text-xs text-slate-400 max-w-xs">{visionState.error}</p>
          </div>
        </div>
      )}

      {!visionState.isRunning && !visionState.isLoading && !visionState.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Camera off</p>
          </div>
        </div>
      )}
    </div>
  );
};
