// ─── Web Audio API ambient chime generator ───

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Play a gentle ambient chime */
export function playChime(type: 'gentle' | 'alert' | 'success' = 'gentle') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const freqMap = {
      gentle: [523.25, 659.25, 783.99], // C5, E5, G5
      alert: [440, 554.37, 659.25],      // A4, C#5, E5
      success: [523.25, 659.25, 783.99, 1046.5], // C5, E5, G5, C6
    };

    const frequencies = freqMap[type];
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);

      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0, now + i * 0.15);
      noteGain.gain.linearRampToValueAtTime(0.06, now + i * 0.15 + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 2);

      osc.connect(noteGain);
      noteGain.connect(gainNode);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 2.5);
    });
  } catch {
    // Silently fail if audio is not available
  }
}

/** Play a soft tick for stretch validation */
export function playTick() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // Silently fail
  }
}
