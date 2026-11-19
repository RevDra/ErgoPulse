// ─── Math / signal processing utilities ───

/** Exponential Moving Average filter */
export class EMAFilter {
  private value: number | null = null;
  constructor(private alpha: number = 0.15) {}

  update(raw: number): number {
    if (this.value === null) {
      this.value = raw;
    } else {
      this.value = this.alpha * raw + (1 - this.alpha) * this.value;
    }
    return this.value;
  }

  get current(): number {
    return this.value ?? 0;
  }

  reset() {
    this.value = null;
  }
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/** Convert radians to degrees */
export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Calculate angle between two 2D points relative to horizontal */
export function angleBetween(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return toDeg(Math.atan2(y2 - y1, x2 - x1));
}

/** Euclidean distance between two 2D points */
export function dist2D(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/** Rolling window average */
export class RollingWindow {
  private values: number[] = [];
  constructor(private windowSize: number = 60) {}

  push(value: number) {
    this.values.push(value);
    if (this.values.length > this.windowSize) {
      this.values.shift();
    }
  }

  get average(): number {
    if (this.values.length === 0) return 0;
    return this.values.reduce((a, b) => a + b, 0) / this.values.length;
  }

  get count(): number {
    return this.values.length;
  }

  get sum(): number {
    return this.values.reduce((a, b) => a + b, 0);
  }

  reset() {
    this.values = [];
  }
}

/** Simple blink detector — detects transitions from open→closed→open */
export class BlinkDetector {
  private wasOpen = true;
  private blinkTimestamps: number[] = [];
  private readonly windowMs = 60000; // 1-minute window

  /** Call each frame with eye openness score (0–1). Returns blinks/min. */
  update(openness: number, timestamp: number): number {
    const isOpen = openness > 0.4;

    if (this.wasOpen && !isOpen) {
      // Eye just closed — start of blink
    } else if (!this.wasOpen && isOpen) {
      // Eye just opened — end of blink, count it
      this.blinkTimestamps.push(timestamp);
    }
    this.wasOpen = isOpen;

    // Prune old blinks
    const cutoff = timestamp - this.windowMs;
    this.blinkTimestamps = this.blinkTimestamps.filter((t) => t > cutoff);

    // Calculate rate
    const elapsed = Math.min(
      this.windowMs,
      this.blinkTimestamps.length > 1
        ? timestamp - this.blinkTimestamps[0]
        : this.windowMs
    );
    if (elapsed < 5000) return 15; // Not enough data yet, return normal
    return (this.blinkTimestamps.length / elapsed) * 60000;
  }

  reset() {
    this.wasOpen = true;
    this.blinkTimestamps = [];
  }
}

/** Format seconds to MM:SS */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
