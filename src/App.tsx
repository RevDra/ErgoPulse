// ─── ErgoPulse — Main Application ───
import React, { useState, useCallback } from 'react';
import {
  Power,
  PowerOff,
  Minimize2,
  Maximize2,
  Zap,
  Clock,
  Timer,
  Heart,
  Sparkles,
  Github,
} from 'lucide-react';

import { useErgonomicsVision } from './hooks/useErgonomicsVision';
import { useWellbeingMetrics } from './hooks/useWellbeingMetrics';
import { useStretchMode } from './hooks/useStretchMode';

import { VignetteOverlay } from './components/VignetteOverlay';
import { WebcamPreview } from './components/WebcamPreview';
import { MetricCard } from './components/MetricCard';
import { CalibrationFlow } from './components/CalibrationFlow';
import { TimelineChart } from './components/TimelineChart';
import { BreakPrompt } from './components/BreakPrompt';
import { StretchOverlay } from './components/StretchOverlay';
import { FocusModePill } from './components/FocusModePill';
import { PrivacyBadge } from './components/PrivacyBadge';
import { formatTime } from './utils/math';

export default function App() {
  const [focusMode, setFocusMode] = useState(false);

  // Core vision engine
  const {
    videoRef,
    canvasRef,
    visionState,
    posture,
    eyes,
    fatigue,
    calibrationData,
    headTilt,
    startCamera,
    stopCamera,
    calibrate,
    showOverlay,
    setShowOverlay,
  } = useErgonomicsVision();

  // Wellbeing timeline & alerts
  const wellbeing = useWellbeingMetrics(
    posture,
    eyes,
    fatigue,
    visionState.isRunning
  );

  // Stretch mode
  const stretch = useStretchMode(headTilt);

  // Handlers
  const handleStart = useCallback(async () => {
    await startCamera();
    wellbeing.startSession();
  }, [startCamera, wellbeing]);

  const handleStop = useCallback(() => {
    stopCamera();
  }, [stopCamera]);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((f) => !f);
  }, []);

  // ── Determine metric statuses ──
  const postureStatus: 'good' | 'warn' | 'bad' =
    posture.postureScore >= 70 ? 'good' : posture.postureScore >= 40 ? 'warn' : 'bad';
  const blinkStatus: 'good' | 'warn' | 'bad' = eyes.lowBlinkRate
    ? 'warn'
    : 'good';
  const distanceStatus: 'good' | 'warn' | 'bad' = posture.tooClose
    ? 'bad'
    : posture.relativeDistance > 1.15
      ? 'warn'
      : 'good';
  const fatigueStatus: 'good' | 'warn' | 'bad' =
    fatigue.fatigueScore < 30 ? 'good' : fatigue.fatigueScore < 60 ? 'warn' : 'bad';

  return (
    <>
      {/* Vignette alerts */}
      <VignetteOverlay alertType={wellbeing.activeAlert} />

      {/* Break prompt */}
      <BreakPrompt
        isVisible={wellbeing.breakDue}
        timeSinceBreak={wellbeing.timeSinceBreak}
        onDismiss={wellbeing.dismissBreak}
        onStartStretch={stretch.startStretch}
      />

      {/* Stretch overlay */}
      <StretchOverlay
        isActive={stretch.isStretching}
        currentExercise={stretch.currentExercise}
        exerciseIndex={stretch.exerciseIndex}
        totalExercises={stretch.totalExercises}
        holdProgress={stretch.holdProgress}
        isHoldingCorrectly={stretch.isHoldingCorrectly}
        timeRemaining={stretch.timeRemaining}
        completedCount={stretch.completedCount}
        onStop={stretch.stopStretch}
      />

      {/* Focus Mode Pill */}
      <FocusModePill
        isActive={focusMode && visionState.isRunning}
        posture={posture}
        eyes={eyes}
        fatigue={fatigue}
        sessionDuration={wellbeing.sessionDuration}
        onToggle={toggleFocusMode}
      />

      {/* Main Dashboard — hidden in focus mode */}
      {!focusMode && (
        <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
          {/* ── Header ── */}
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-500 to-sage-700 flex items-center justify-center shadow-lg shadow-sage-500/20">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  ErgoPulse
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-sage-500/15 text-sage-400 border border-sage-500/25">
                    v1.0
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  AI Ergonomics & Anti-Burnout Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <PrivacyBadge />

              {/* Session timer */}
              {visionState.isRunning && wellbeing.sessionStartTime && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-300 font-mono">
                    {formatTime(wellbeing.sessionDuration / 1000)}
                  </span>
                </div>
              )}

              {/* Focus mode toggle */}
              {visionState.isRunning && (
                <button
                  onClick={toggleFocusMode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                             bg-slate-800 hover:bg-slate-700 border border-slate-700
                             transition-colors text-xs text-slate-300"
                >
                  <Minimize2 className="w-3 h-3" />
                  Focus Mode
                </button>
              )}

              {/* Power button */}
              <button
                onClick={visionState.isRunning ? handleStop : handleStart}
                disabled={visionState.isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed
                           ${
                             visionState.isRunning
                               ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30'
                               : 'bg-sage-500/20 text-sage-300 hover:bg-sage-500/30 border border-sage-500/30'
                           }`}
              >
                {visionState.isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Loading…
                  </>
                ) : visionState.isRunning ? (
                  <>
                    <PowerOff className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4" />
                    Start Monitoring
                  </>
                )}
              </button>
            </div>
          </header>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left column: Webcam + Calibration */}
            <div className="lg:col-span-5 space-y-5">
              <WebcamPreview
                videoRef={videoRef}
                canvasRef={canvasRef}
                visionState={visionState}
                showOverlay={showOverlay}
                onToggleOverlay={() => setShowOverlay(!showOverlay)}
              />

              <CalibrationFlow
                visionState={visionState}
                calibrationData={calibrationData}
                onCalibrate={calibrate}
              />

              {/* Demo Controls */}
              <div className="glass-card-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Hackathon Demo Controls
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={wellbeing.triggerBreak}
                    className="px-3 py-2 rounded-lg text-xs font-medium
                               bg-amber-500/10 text-amber-400 hover:bg-amber-500/20
                               border border-amber-500/20 transition-colors"
                  >
                    <Timer className="w-3 h-3 inline mr-1.5" />
                    Simulate 20m Break
                  </button>
                  <button
                    onClick={stretch.startStretch}
                    disabled={!visionState.isRunning}
                    className="px-3 py-2 rounded-lg text-xs font-medium
                               bg-blue-500/10 text-blue-400 hover:bg-blue-500/20
                               border border-blue-500/20 transition-colors
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-3 h-3 inline mr-1.5" />
                    Start Stretch
                  </button>
                </div>
              </div>
            </div>

            {/* Right column: Metrics + Chart */}
            <div className="lg:col-span-7 space-y-5">
              {/* Metric cards grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  label="Posture"
                  value={posture.postureScore}
                  unit="/100"
                  status={postureStatus}
                  icon="posture"
                  subtitle={
                    posture.isSlouching
                      ? 'Slouching detected'
                      : posture.postureScore >= 80
                        ? 'Looking great!'
                        : 'Room to improve'
                  }
                />
                <MetricCard
                  label="Blink Rate"
                  value={Math.round(eyes.blinkRate)}
                  unit="bpm"
                  status={blinkStatus}
                  icon="eye"
                  subtitle={
                    eyes.lowBlinkRate
                      ? '⚠ Below 10 — eye strain risk'
                      : 'Normal range'
                  }
                />
                <MetricCard
                  label="Distance"
                  value={
                    !calibrationData
                      ? '—'
                      : posture.tooClose
                        ? 'Too Close'
                        : 'Good'
                  }
                  status={distanceStatus}
                  icon="distance"
                  subtitle={
                    calibrationData
                      ? `${Math.round(posture.relativeDistance * 100)}% of baseline`
                      : 'Calibrate to enable'
                  }
                />
                <MetricCard
                  label="Fatigue"
                  value={fatigue.fatigueScore}
                  unit="/100"
                  status={fatigueStatus}
                  icon="fatigue"
                  subtitle={
                    fatigue.isYawning
                      ? 'Yawning detected'
                      : fatigue.fatigueScore < 30
                        ? 'Feeling fresh'
                        : 'Consider a break'
                  }
                />
              </div>

              {/* Alert banner */}
              {wellbeing.activeAlert !== 'none' && (
                <div
                  className={`glass-card-sm p-3 animate-fade-in ${
                    wellbeing.activeAlert === 'posture'
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : wellbeing.activeAlert === 'eyestrain'
                        ? 'bg-blue-500/5 border-blue-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <p
                    className={`text-xs font-medium ${
                      wellbeing.activeAlert === 'posture'
                        ? 'text-amber-400'
                        : wellbeing.activeAlert === 'eyestrain'
                          ? 'text-blue-400'
                          : 'text-red-400'
                    }`}
                  >
                    {wellbeing.activeAlert === 'posture'
                      ? '🧘 Posture alert — Straighten up and move back from screen'
                      : wellbeing.activeAlert === 'eyestrain'
                        ? '👁 Eye strain risk — Your blink rate is low, look away briefly'
                        : '😓 Fatigue rising — Consider taking a short break'}
                  </p>
                </div>
              )}

              {/* Timeline chart */}
              <TimelineChart data={wellbeing.timeline} />

              {/* Detailed metrics panel */}
              <div className="glass-card-sm p-4">
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                  Live Telemetry
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                  <TelemetryRow
                    label="Forward Head Angle"
                    value={`${posture.forwardHeadAngle}°`}
                  />
                  <TelemetryRow
                    label="Shoulder Tilt"
                    value={`${posture.shoulderTilt}°`}
                  />
                  <TelemetryRow
                    label="Relative Distance"
                    value={`${posture.relativeDistance}x`}
                  />
                  <TelemetryRow
                    label="Left Eye"
                    value={`${(eyes.leftEyeOpenness * 100).toFixed(0)}%`}
                  />
                  <TelemetryRow
                    label="Right Eye"
                    value={`${(eyes.rightEyeOpenness * 100).toFixed(0)}%`}
                  />
                  <TelemetryRow
                    label="Brow Furrowing"
                    value={`${(fatigue.browFurrowing * 100).toFixed(0)}%`}
                  />
                  <TelemetryRow
                    label="Yawn Count"
                    value={`${fatigue.yawnFrequency}`}
                  />
                  <TelemetryRow label="FPS" value={`${visionState.fps}`} />
                  <TelemetryRow
                    label="Break Timer"
                    value={formatTime(wellbeing.timeSinceBreak / 1000)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className="mt-8 pt-4 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-600">
              Built for the "Build for Better Wellbeing" Hackathon • 100% client-side • Zero data transmitted
            </p>
            <div className="flex items-center gap-4">
              <PrivacyBadge compact />
              <a
                href="https://github.com/RevDra/SOLURA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                Source
              </a>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}

// Small telemetry row
function TelemetryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className="text-[11px] text-slate-300 font-mono">{value}</span>
    </div>
  );
}
