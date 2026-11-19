# ErgoPulse — AI Ergonomics & Anti-Burnout Assistant

> 🏆 Built for the **"Build for Better Wellbeing"** Hackathon

**Privacy-first, 100% on-device AI** that monitors your posture, eye strain, and fatigue in real-time — all processing happens locally in your browser. **No video ever leaves your device.**

![ErgoPulse](https://img.shields.io/badge/Privacy-100%25%20Local%20Inference-green) ![Tech](https://img.shields.io/badge/Tech-MediaPipe%20%2B%20React%20%2B%20WebAssembly-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🧍 Real-Time Posture Monitoring
- **Forward head / slouch detection** via PoseLandmarker + FaceLandmarker
- **Screen proximity estimation** using calibrated face/IPD measurements
- **Shoulder tilt tracking** for alignment awareness
- Smooth EMA-filtered metrics (no jitter)

### 👁 Eye Strain Detection
- **Blink rate monitoring** (alerts when < 10 blinks/min)
- **Fatigue scoring** (0–100) combining blink rate, yawning, and brow furrowing
- Blendshape-powered facial expression analysis

### 🌊 Ambient Alert System
- **Non-intrusive vignette overlays** instead of pop-ups:
  - 🟡 Amber glow for posture issues
  - 🔵 Blue glow for eye strain
  - 🔴 Red glow for high fatigue
- Alerts only trigger after **5+ seconds of persistent issues**
- Gentle Web Audio API chimes

### 🧘 Break & Stretch System
- **20-20-20 Eye Rule** reminders every 20 minutes
- **Guided 60-second neck/shoulder stretch** with real-time webcam validation
- Progress rings track head movement through each exercise
- "Simulate 20m" demo button for hackathon judging

### 📊 Dashboard
- Live webcam with toggleable AR skeleton overlay
- Real-time metric cards with status indicators
- 15-minute Wellbeing Timeline chart (Recharts)
- Detailed telemetry panel
- **Focus Mode** — minimizes to a floating status pill

### 🔒 Privacy
- **Zero server communication** — all inference via WebAssembly/WebGL
- No video frames ever leave the browser
- No cookies, analytics, or tracking
- Clear "100% Local Inference" privacy badge

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Vite + React 18 + TypeScript |
| **Styling** | Tailwind CSS + custom animations |
| **CV Engine** | `@mediapipe/tasks-vision` (FaceLandmarker + PoseLandmarker) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Audio** | Web Audio API (procedural chimes) |
| **Runtime** | 100% client-side (WebAssembly + WebGL) |

## 📁 Project Structure

```
src/
├── App.tsx                    # Main application shell
├── main.tsx                   # React entry point
├── types.ts                   # TypeScript type definitions
├── hooks/
│   ├── useErgonomicsVision.ts # Core CV engine (MediaPipe)
│   ├── useWellbeingMetrics.ts # Timeline, alerts, break timer
│   └── useStretchMode.ts     # Guided stretch routine
├── components/
│   ├── WebcamPreview.tsx      # Camera feed + landmark overlay
│   ├── MetricCard.tsx         # Metric display cards
│   ├── CalibrationFlow.tsx    # Baseline posture calibration
│   ├── TimelineChart.tsx      # 15-min wellbeing chart
│   ├── BreakPrompt.tsx        # 20-20-20 break modal
│   ├── StretchOverlay.tsx     # Guided stretch UI
│   ├── VignetteOverlay.tsx    # Ambient alert vignettes
│   ├── FocusModePill.tsx      # Compact floating status
│   └── PrivacyBadge.tsx       # Privacy indicator
└── utils/
    ├── math.ts                # EMA filter, blink detector, etc.
    └── audio.ts               # Web Audio API chimes
```

## 🎮 Hackathon Demo Tips

1. **Start Monitoring** → allow camera access
2. **Calibrate** → sit in ideal posture, click "Set My Baseline Posture"
3. **Test posture alerts** → lean forward or slouch for 5+ seconds
4. **Test eye strain** → stare without blinking
5. **Simulate break** → click "Simulate 20m Break" button
6. **Try stretch mode** → follow the guided neck exercises
7. **Focus Mode** → minimize to floating pill

## 📄 License

MIT — Built with ❤️ for wellbeing
