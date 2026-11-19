// ─── Core Computer Vision Hook using MediaPipe Tasks-Vision ───
import { useRef, useState, useCallback, useEffect } from 'react';
import {
  FaceLandmarker,
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
  type FaceLandmarkerResult,
  type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import type {
  PostureMetrics,
  EyeMetrics,
  FatigueMetrics,
  CalibrationData,
  VisionState,
} from '../types';
import {
  EMAFilter,
  BlinkDetector,
  RollingWindow,
  clamp,
  dist2D,
  angleBetween,
} from '../utils/math';

// MediaPipe landmark indices
const NOSE_TIP = 1;
const LEFT_EYE_TOP = 159;
const LEFT_EYE_BOTTOM = 145;
const RIGHT_EYE_TOP = 386;
const RIGHT_EYE_BOTTOM = 374;
const LEFT_IRIS_CENTER = 468;
const RIGHT_IRIS_CENTER = 473;

// Pose landmark indices
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const NOSE_POSE = 0;

interface UseErgonomicsVisionReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  visionState: VisionState;
  posture: PostureMetrics;
  eyes: EyeMetrics;
  fatigue: FatigueMetrics;
  calibrationData: CalibrationData | null;
  headTilt: { pitch: number; yaw: number; roll: number };
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  calibrate: () => void;
  showOverlay: boolean;
  setShowOverlay: (show: boolean) => void;
}

export function useErgonomicsVision(): UseErgonomicsVisionReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef({ frames: 0, lastCheck: 0, fps: 0 });

  // EMA filters for smooth metrics
  const filtersRef = useRef({
    postureScore: new EMAFilter(0.12),
    forwardHead: new EMAFilter(0.15),
    shoulderTilt: new EMAFilter(0.15),
    distance: new EMAFilter(0.1),
    leftEye: new EMAFilter(0.2),
    rightEye: new EMAFilter(0.2),
    browFurrowing: new EMAFilter(0.1),
    fatigue: new EMAFilter(0.08),
  });
  const blinkDetectorRef = useRef(new BlinkDetector());
  const yawnWindowRef = useRef(new RollingWindow(300)); // 5 min at ~1fps sampling

  const [showOverlay, setShowOverlay] = useState(true);
  const [visionState, setVisionState] = useState<VisionState>({
    isLoading: false,
    isRunning: false,
    error: null,
    fps: 0,
    hasFace: false,
    hasPose: false,
  });

  const [posture, setPosture] = useState<PostureMetrics>({
    postureScore: 100,
    forwardHeadAngle: 0,
    shoulderTilt: 0,
    relativeDistance: 1,
    tooClose: false,
    isSlouching: false,
  });

  const [eyes, setEyes] = useState<EyeMetrics>({
    blinkRate: 15,
    lowBlinkRate: false,
    leftEyeOpenness: 1,
    rightEyeOpenness: 1,
  });

  const [fatigue, setFatigue] = useState<FatigueMetrics>({
    fatigueScore: 0,
    yawnFrequency: 0,
    browFurrowing: 0,
    isYawning: false,
  });

  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const calibrationRef = useRef<CalibrationData | null>(null);
  const [headTilt, setHeadTilt] = useState({ pitch: 0, yaw: 0, roll: 0 });

  // Initialize MediaPipe models
  const initModels = useCallback(async () => {
    setVisionState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const [faceLandmarker, poseLandmarker] = await Promise.all([
        FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        }),
        PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        }),
      ]);

      faceLandmarkerRef.current = faceLandmarker;
      poseLandmarkerRef.current = poseLandmarker;
      setVisionState((s) => ({ ...s, isLoading: false }));
    } catch (err) {
      console.error('Failed to load MediaPipe models:', err);
      setVisionState((s) => ({
        ...s,
        isLoading: false,
        error: `Failed to load AI models: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }));
    }
  }, []);

  // Process a single frame
  const processFrame = useCallback(
    (timestamp: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // FPS counting
      const fpsC = fpsCounterRef.current;
      fpsC.frames++;
      if (timestamp - fpsC.lastCheck >= 1000) {
        fpsC.fps = fpsC.frames;
        fpsC.frames = 0;
        fpsC.lastCheck = timestamp;
        setVisionState((s) => ({ ...s, fps: fpsC.fps }));
      }

      // Skip duplicate frames
      if (timestamp === lastFrameTimeRef.current) {
        rafRef.current = requestAnimationFrame(processFrame);
        return;
      }
      lastFrameTimeRef.current = timestamp;

      const filters = filtersRef.current;
      let faceResult: FaceLandmarkerResult | null = null;
      let poseResult: PoseLandmarkerResult | null = null;

      try {
        if (faceLandmarkerRef.current) {
          faceResult = faceLandmarkerRef.current.detectForVideo(video, timestamp);
        }
        if (poseLandmarkerRef.current) {
          poseResult = poseLandmarkerRef.current.detectForVideo(video, timestamp);
        }
      } catch {
        rafRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const hasFace = !!(faceResult?.faceLandmarks?.length);
      const hasPose = !!(poseResult?.landmarks?.length);

      setVisionState((s) => ({
        ...s,
        hasFace,
        hasPose,
        isRunning: true,
      }));

      // ── Draw overlay ──
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (showOverlay) {
          const drawUtils = new DrawingUtils(ctx);

          if (hasFace && faceResult?.faceLandmarks?.[0]) {
            drawUtils.drawConnectors(
              faceResult.faceLandmarks[0],
              FaceLandmarker.FACE_LANDMARKS_TESSELATION,
              { color: '#7d9b7d30', lineWidth: 0.5 }
            );
            drawUtils.drawConnectors(
              faceResult.faceLandmarks[0],
              FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
              { color: '#7d9b7d80', lineWidth: 1.5 }
            );
            drawUtils.drawConnectors(
              faceResult.faceLandmarks[0],
              FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
              { color: '#5c7f5cCC', lineWidth: 1.5 }
            );
            drawUtils.drawConnectors(
              faceResult.faceLandmarks[0],
              FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
              { color: '#5c7f5cCC', lineWidth: 1.5 }
            );
            drawUtils.drawConnectors(
              faceResult.faceLandmarks[0],
              FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
              { color: '#a9bea9', lineWidth: 1 }
            );
            drawUtils.drawConnectors(
              faceResult.faceLandmarks[0],
              FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
              { color: '#a9bea9', lineWidth: 1 }
            );
          }

          if (hasPose && poseResult?.landmarks?.[0]) {
            drawUtils.drawLandmarks(poseResult.landmarks[0].slice(0, 25), {
              radius: 3,
              color: '#7d9b7d',
              fillColor: '#5c7f5c80',
            });
            drawUtils.drawConnectors(
              poseResult.landmarks[0],
              PoseLandmarker.POSE_CONNECTIONS,
              { color: '#7d9b7dA0', lineWidth: 2 }
            );
          }
        }
      }

      // ── Compute posture metrics ──
      if (hasPose && hasFace && poseResult?.landmarks?.[0] && faceResult?.faceLandmarks?.[0]) {
        const poseLm = poseResult.landmarks[0];
        const faceLm = faceResult.faceLandmarks[0];

        // Shoulder midpoint
        const lShoulder = poseLm[LEFT_SHOULDER];
        const rShoulder = poseLm[RIGHT_SHOULDER];
        const shoulderMidY = (lShoulder.y + rShoulder.y) / 2;
        const shoulderWidth = dist2D(lShoulder.x, lShoulder.y, rShoulder.x, rShoulder.y);

        // Nose position from pose
        const noseP = poseLm[NOSE_POSE];

        // Forward head: nose Y relative to shoulder midpoint Y
        const noseShoulderDrop = shoulderMidY - noseP.y;

        // Shoulder tilt
        const shoulderAngle = Math.abs(
          angleBetween(lShoulder.x, lShoulder.y, rShoulder.x, rShoulder.y)
        );

        // Screen distance via face area / IPD
        const faceBB = faceResult.faceLandmarks[0];
        const leftIris = faceBB[LEFT_IRIS_CENTER] || faceLm[NOSE_TIP];
        const rightIris = faceBB[RIGHT_IRIS_CENTER] || faceLm[NOSE_TIP];
        const ipd = dist2D(leftIris.x, leftIris.y, rightIris.x, rightIris.y);

        // Face bounding box area approximation
        const faceXs = faceLm.map((l) => l.x);
        const faceYs = faceLm.map((l) => l.y);
        const faceW = Math.max(...faceXs) - Math.min(...faceXs);
        const faceH = Math.max(...faceYs) - Math.min(...faceYs);
        const faceArea = faceW * faceH;

        const cal = calibrationRef.current;
        let relDist = 1;
        let isSlouching = false;
        let forwardAngle = 0;

        if (cal) {
          relDist = filters.distance.update(
            cal.baselineFaceArea > 0 ? Math.sqrt(faceArea / cal.baselineFaceArea) : 1
          );
          const dropDiff = noseShoulderDrop - cal.baselineNoseShoulderDrop;
          forwardAngle = filters.forwardHead.update(dropDiff * 200); // Scale to degrees-ish
          isSlouching = forwardAngle < -10 || Math.abs(shoulderAngle) > 8;
        } else {
          relDist = filters.distance.update(1);
          forwardAngle = filters.forwardHead.update(0);
        }

        const tiltSmooth = filters.shoulderTilt.update(shoulderAngle);
        const tooClose = relDist > 1.3;

        // Composite posture score
        let score = 100;
        score -= Math.abs(forwardAngle) * 1.5; // Penalize forward head
        score -= Math.abs(tiltSmooth) * 2; // Penalize shoulder tilt
        if (tooClose) score -= (relDist - 1.3) * 50;
        if (isSlouching) score -= 15;
        score = clamp(filters.postureScore.update(score), 0, 100);

        setPosture({
          postureScore: Math.round(score),
          forwardHeadAngle: Math.round(forwardAngle * 10) / 10,
          shoulderTilt: Math.round(tiltSmooth * 10) / 10,
          relativeDistance: Math.round(relDist * 100) / 100,
          tooClose,
          isSlouching,
        });

        // ── Head tilt for stretch mode ──
        const noseFace = faceLm[NOSE_TIP];
        const faceCenter = {
          x: (Math.max(...faceXs) + Math.min(...faceXs)) / 2,
          y: (Math.max(...faceYs) + Math.min(...faceYs)) / 2,
        };
        setHeadTilt({
          pitch: (noseFace.y - faceCenter.y) * 100,
          yaw: (noseFace.x - faceCenter.x) * 100,
          roll: shoulderAngle,
        });
      }

      // ── Eye metrics ──
      if (hasFace && faceResult?.faceLandmarks?.[0]) {
        const faceLm = faceResult.faceLandmarks[0];

        // Eye openness from landmark distances
        const leftOpen = dist2D(
          faceLm[LEFT_EYE_TOP].x, faceLm[LEFT_EYE_TOP].y,
          faceLm[LEFT_EYE_BOTTOM].x, faceLm[LEFT_EYE_BOTTOM].y
        );
        const rightOpen = dist2D(
          faceLm[RIGHT_EYE_TOP].x, faceLm[RIGHT_EYE_TOP].y,
          faceLm[RIGHT_EYE_BOTTOM].x, faceLm[RIGHT_EYE_BOTTOM].y
        );

        const leftSmooth = filters.leftEye.update(leftOpen * 50);
        const rightSmooth = filters.rightEye.update(rightOpen * 50);
        const avgOpenness = (leftSmooth + rightSmooth) / 2;

        const blinkRate = blinkDetectorRef.current.update(avgOpenness, timestamp);

        setEyes({
          blinkRate: Math.round(blinkRate * 10) / 10,
          lowBlinkRate: blinkRate < 10,
          leftEyeOpenness: leftSmooth,
          rightEyeOpenness: rightSmooth,
        });

        // ── Fatigue metrics from blendshapes ──
        const blendshapes = faceResult.faceBlendshapes?.[0]?.categories;
        if (blendshapes) {
          const getBS = (name: string) =>
            blendshapes.find((b) => b.categoryName === name)?.score ?? 0;

          const browDown = (getBS('browDownLeft') + getBS('browDownRight')) / 2;
          const jawOpen = getBS('jawOpen');
          const isYawning = jawOpen > 0.5;

          yawnWindowRef.current.push(isYawning ? 1 : 0);
          const browSmooth = filters.browFurrowing.update(browDown);

          // Fatigue composite
          let fatigueScore = 0;
          fatigueScore += (1 - clamp(blinkRate / 15, 0, 1)) * 30; // Low blink adds fatigue
          fatigueScore += yawnWindowRef.current.average * 40; // Yawn frequency
          fatigueScore += browSmooth * 30; // Brow furrowing
          fatigueScore = clamp(filters.fatigue.update(fatigueScore), 0, 100);

          setFatigue({
            fatigueScore: Math.round(fatigueScore),
            yawnFrequency: Math.round(yawnWindowRef.current.sum),
            browFurrowing: Math.round(browSmooth * 100) / 100,
            isYawning,
          });
        }
      }

      rafRef.current = requestAnimationFrame(processFrame);
    },
    [showOverlay]
  );

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setVisionState((s) => ({ ...s, isLoading: true, error: null }));

      await initModels();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        rafRef.current = requestAnimationFrame(processFrame);
        setVisionState((s) => ({ ...s, isRunning: true, isLoading: false }));
      }
    } catch (err) {
      console.error('Camera error:', err);
      setVisionState((s) => ({
        ...s,
        isLoading: false,
        error:
          err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access and try again.'
            : `Camera error: ${err instanceof Error ? err.message : 'Unknown'}`,
      }));
    }
  }, [initModels, processFrame]);

  // Stop camera
  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setVisionState({
      isLoading: false,
      isRunning: false,
      error: null,
      fps: 0,
      hasFace: false,
      hasPose: false,
    });
  }, []);

  // Calibrate
  const calibrate = useCallback(() => {
    // We'll grab current raw values and use them as baseline
    // This needs at least face + pose to be detected
    const video = videoRef.current;
    if (!video || !faceLandmarkerRef.current || !poseLandmarkerRef.current) return;

    // Run detection once
    const now = performance.now();
    const faceResult = faceLandmarkerRef.current.detectForVideo(video, now);
    const poseResult = poseLandmarkerRef.current.detectForVideo(video, now + 1);

    if (
      !faceResult?.faceLandmarks?.[0] ||
      !poseResult?.landmarks?.[0]
    ) {
      return;
    }

    const poseLm = poseResult.landmarks[0];
    const faceLm = faceResult.faceLandmarks[0];

    const lShoulder = poseLm[LEFT_SHOULDER];
    const rShoulder = poseLm[RIGHT_SHOULDER];
    const shoulderMidY = (lShoulder.y + rShoulder.y) / 2;
    const shoulderWidth = dist2D(lShoulder.x, lShoulder.y, rShoulder.x, rShoulder.y);
    const noseP = poseLm[NOSE_POSE];
    const noseShoulderDrop = shoulderMidY - noseP.y;

    const leftIris = faceLm[LEFT_IRIS_CENTER] || faceLm[NOSE_TIP];
    const rightIris = faceLm[RIGHT_IRIS_CENTER] || faceLm[NOSE_TIP];
    const ipd = dist2D(leftIris.x, leftIris.y, rightIris.x, rightIris.y);

    const faceXs = faceLm.map((l) => l.x);
    const faceYs = faceLm.map((l) => l.y);
    const faceW = Math.max(...faceXs) - Math.min(...faceXs);
    const faceH = Math.max(...faceYs) - Math.min(...faceYs);

    const data: CalibrationData = {
      baselineNoseShoulderDrop: noseShoulderDrop,
      baselineShoulderWidth: shoulderWidth,
      baselineIPD: ipd,
      baselineFaceArea: faceW * faceH,
      calibratedAt: Date.now(),
    };

    calibrationRef.current = data;
    setCalibrationData(data);

    // Reset filters after calibration
    Object.values(filtersRef.current).forEach((f) => f.reset());
    blinkDetectorRef.current.reset();
    yawnWindowRef.current.reset();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      faceLandmarkerRef.current?.close();
      poseLandmarkerRef.current?.close();
    };
  }, []);

  return {
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
  };
}
