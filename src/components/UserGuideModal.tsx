// ─── Interactive User Guide & First-Time Onboarding Modal ───
import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Crosshair,
  Sparkles,
  Zap,
  Timer,
  Eye,
  Activity,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Flame,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerDemoBreak?: () => void;
  onTriggerStretch?: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onTriggerDemoBreak,
  onTriggerStretch,
}) => {
  const [activeTab, setActiveTab] = useState<'tour' | 'cheatsheet'>('tour');
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('ergopulse_onboarding_dismissed', 'true');
    }
    onClose();
  };

  const steps = [
    {
      step: 1,
      title: '100% Private, On-Device AI',
      subtitle: 'Zero video or image data is ever transmitted to any server.',
      icon: ShieldCheck,
      iconColor: 'text-sage-400',
      iconBg: 'bg-sage-500/15',
      badge: 'Privacy-First Architecture',
      content: (
        <div className="space-y-3 text-sm text-slate-300">
          <p>
            ErgoPulse executes Google MediaPipe (FaceLandmarker and PoseLandmarker)
            directly inside your browser using WebAssembly and WebGL acceleration.
          </p>
          <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-700/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-sage-300">
              <CheckCircle2 className="w-4 h-4 text-sage-400" />
              <span>Full Local Client-Side Processing</span>
            </div>
            <p className="text-xs text-slate-400 pl-6 leading-relaxed">
              Camera frames are evaluated in volatile memory and discarded instantly.
              No cloud endpoints, no telemetry streaming, and no video tracking cookies.
            </p>
          </div>
        </div>
      ),
    },
    {
      step: 2,
      title: '3-Second Posture Calibration',
      subtitle: 'Teach ErgoPulse what your ideal comfortable setup looks like.',
      icon: Crosshair,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15',
      badge: 'Personalized Baseline',
      content: (
        <div className="space-y-3 text-sm text-slate-300">
          <p>
            Everyone's desk, chair height, and monitor distance are different.
            Calibration ensures you get accurate warnings without false positives.
          </p>
          <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-700/50 space-y-2 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-slate-300 font-bold flex-shrink-0">
                1
              </span>
              <span>Sit naturally upright with shoulders relaxed and monitor at eye level.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-slate-300 font-bold flex-shrink-0">
                2
              </span>
              <span>
                Click <strong className="text-slate-200">"Set My Baseline Posture"</strong> on the left panel.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-slate-300 font-bold flex-shrink-0">
                3
              </span>
              <span>
                Hold steady for the 3-second countdown. Baseline nose-drop, shoulder tilt, and face area will lock in.
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      step: 3,
      title: 'Ambient Alerts & Guided Stretch',
      subtitle: 'Subtle awareness without annoying interruptions.',
      icon: Sparkles,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15',
      badge: 'Intervention Engine',
      content: (
        <div className="space-y-3 text-sm text-slate-300">
          <p>
            Instead of jarring modal notifications while you focus, ErgoPulse applies soft, glowing edge vignettes:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Amber Vignette
              </span>
              <p className="text-slate-400 text-[11px] leading-tight">
                Active when slouching, head forward, or too close to screen for &gt;5 seconds.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/25">
              <span className="font-semibold text-blue-400 flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Blue Vignette
              </span>
              <p className="text-slate-400 text-[11px] leading-tight">
                Active when blink rate drops below 10 bpm (digital eye strain risk).
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Every 20 minutes, the <strong>20-20-20 Eye Rule</strong> recommends resting your eyes, paired with an interactive 60-second webcam-verified neck stretch routine!
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-xl w-full p-6 relative border border-slate-700/80 shadow-2xl shadow-black/60 animate-slide-up overflow-hidden">
        {/* Top bar with tabs & close button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sage-500/20 border border-sage-500/30 flex items-center justify-center text-sage-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">ErgoPulse Welcome & Guide</h2>
              <p className="text-[11px] text-slate-500">Your privacy-first ergonomics companion</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('tour')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'tour'
                    ? 'bg-sage-500/20 text-sage-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tour (3-Step)
              </button>
              <button
                onClick={() => setActiveTab('cheatsheet')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'cheatsheet'
                    ? 'bg-amber-500/20 text-amber-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3 h-3 text-amber-400" />
                Demo Cheat Sheet
              </button>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Close guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: 3-Step Guided Tour */}
        {activeTab === 'tour' && (
          <div className="py-5">
            {/* Step header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {React.createElement(steps[currentStep].icon, {
                  className: `w-6 h-6 ${steps[currentStep].iconColor}`,
                })}
                <div>
                  <span className="text-[10px] font-semibold tracking-wider text-sage-400 uppercase">
                    Step {steps[currentStep].step} of {steps.length} • {steps[currentStep].badge}
                  </span>
                  <h3 className="text-base font-bold text-slate-100">
                    {steps[currentStep].title}
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4">{steps[currentStep].subtitle}</p>

            {/* Dynamic Step Body */}
            <div className="min-h-[160px]">{steps[currentStep].content}</div>

            {/* Step indicators & Next / Prev */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex gap-1.5">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStep ? 'w-6 bg-sage-400' : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium bg-sage-500/20 text-sage-300 hover:bg-sage-500/30 border border-sage-500/30 flex items-center gap-1 transition-colors"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleClose}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium bg-sage-500 text-slate-950 font-semibold hover:bg-sage-400 transition-colors"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Hackathon Judge / Demo Cheat Sheet */}
        {activeTab === 'cheatsheet' && (
          <div className="py-5 space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-200 mb-0.5">30-Second Hackathon Test Protocol</strong>
                Follow these quick cues to test all machine learning capabilities in under 1 minute.
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-sage-500/20 text-sage-300 font-mono text-[11px] font-bold">
                  TEST 1
                </span>
                <div className="flex-1">
                  <div className="font-medium text-slate-200">Start & Calibrate Posture</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Click <strong>Start Monitoring</strong> → Sit upright → Click <strong>"Set My Baseline Posture (3s)"</strong>. Observe the Posture score sync to ~95–100.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
                  TEST 2
                </span>
                <div className="flex-1">
                  <div className="font-medium text-slate-200">Test Slouch & Amber Vignette</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Slouch down or lean forward towards the screen for <strong>5 seconds</strong>. An ambient amber vignette smoothly glows at the screen edges with an audio chime!
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold">
                  TEST 3
                </span>
                <div className="flex-1">
                  <div className="font-medium text-slate-200">20-20-20 Rule & Stretch Routine</div>
                  <div className="text-slate-400 text-[11px] mt-0.5 mb-2">
                    Click <strong>"Simulate 20m Break"</strong> in the left demo panel or below to trigger the eye-break modal and live camera-verified neck stretch mode.
                  </div>
                  <div className="flex gap-2">
                    {onTriggerDemoBreak && (
                      <button
                        onClick={() => {
                          onTriggerDemoBreak();
                          handleClose();
                        }}
                        className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors text-[11px]"
                      >
                        <Timer className="w-3 h-3 inline mr-1" />
                        Trigger 20m Break
                      </button>
                    )}
                    {onTriggerStretch && (
                      <button
                        onClick={() => {
                          onTriggerStretch();
                          handleClose();
                        }}
                        className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors text-[11px]"
                      >
                        <Zap className="w-3 h-3 inline mr-1" />
                        Start Stretch Mode
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold">
                  TEST 4
                </span>
                <div className="flex-1">
                  <div className="font-medium text-slate-200">Focus Mode & AR Skeleton Overlay</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Click <strong>Focus Mode</strong> in the header to minimize the app into a sleek floating telemetry pill. Toggle the eye icon on the webcam to view real-time face/pose mesh.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer controls: Don't show again + close button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-sage-500 focus:ring-sage-500 focus:ring-offset-slate-950 w-3.5 h-3.5"
            />
            <span>Don't show this automatically on launch</span>
          </label>

          <button
            onClick={handleClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors font-medium"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
