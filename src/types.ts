// ─── Core metric types for ErgoPulse ───

export interface PostureMetrics {
  /** 0–100 score: 100 = perfect posture */
  postureScore: number;
  /** Forward head angle in degrees (positive = forward) */
  forwardHeadAngle: number;
  /** Shoulder tilt angle in degrees */
  shoulderTilt: number;
  /** Relative screen distance vs. calibrated baseline (1.0 = baseline) */
  relativeDistance: number;
  /** Whether user is too close to screen */
  tooClose: boolean;
  /** Whether user is slouching */
  isSlouching: boolean;
}

export interface EyeMetrics {
  /** Blinks per minute */
  blinkRate: number;
  /** Whether blink rate is dangerously low */
  lowBlinkRate: boolean;
  /** Left eye openness (0–1) */
  leftEyeOpenness: number;
  /** Right eye openness (0–1) */
  rightEyeOpenness: number;
}

export interface FatigueMetrics {
  /** 0–100 fatigue/stress score */
  fatigueScore: number;
  /** Yawning frequency (yawns per 5 min window) */
  yawnFrequency: number;
  /** Brow furrowing intensity (0–1) */
  browFurrowing: number;
  /** Whether currently yawning */
  isYawning: boolean;
}

export interface WellbeingSnapshot {
  timestamp: number;
  postureScore: number;
  blinkRate: number;
  fatigueScore: number;
  relativeDistance: number;
}

export interface CalibrationData {
  /** Nose-to-shoulder baseline vertical offset */
  baselineNoseShoulderDrop: number;
  /** Baseline shoulder width in normalized coords */
  baselineShoulderWidth: number;
  /** Baseline inter-pupillary distance (normalized) */
  baselineIPD: number;
  /** Baseline face bounding box area */
  baselineFaceArea: number;
  /** Timestamp of calibration */
  calibratedAt: number;
}

export interface StretchExercise {
  name: string;
  instruction: string;
  targetDirection: 'left' | 'right' | 'up' | 'down';
  durationMs: number;
}

export type AlertType = 'none' | 'posture' | 'eyestrain' | 'fatigue';

export type AppMode = 'dashboard' | 'calibrating' | 'stretch' | 'break';

export interface VisionState {
  isLoading: boolean;
  isRunning: boolean;
  error: string | null;
  fps: number;
  hasFace: boolean;
  hasPose: boolean;
}
