import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, CameraOff, Shield, Minimize2, Maximize2 } from 'lucide-react';
import { webcamApi } from '../../services/api';
import type { WebcamMetrics, FatigueLevel } from '../../types';

// Declare MediaPipe globals loaded via CDN
declare global {
  interface Window {
    FaceMesh: new (config: { locateFile: (file: string) => string }) => {
      setOptions: (opts: Record<string, unknown>) => void;
      onResults: (cb: (results: { multiFaceLandmarks?: { x: number; y: number; z: number }[][] }) => void) => void;
      send: (input: { image: HTMLVideoElement }) => Promise<void>;
    };
    Camera: new (
      video: HTMLVideoElement,
      config: { onFrame: () => Promise<void>; width: number; height: number }
    ) => { start: () => void; stop: () => void };
  }
}

// ---- EAR Calculation ----
function distance(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function computeEAR(
  landmarks: { x: number; y: number; z: number }[],
  indices: number[]
): number {
  const [p1, p2, p3, p4, p5, p6] = indices.map((i) => landmarks[i]);
  const vertical1 = distance(p2, p6);
  const vertical2 = distance(p3, p5);
  const horizontal = distance(p1, p4);
  if (horizontal === 0) return 0.3;
  return (vertical1 + vertical2) / (2 * horizontal);
}

// ---- Blink Normal Score ----
function blinkNormalScore(rate: number): number {
  if (rate >= 12 && rate <= 20) return 100;
  if (rate < 12) return Math.max(0, (rate / 12) * 100);
  return Math.max(0, 100 - ((rate - 20) / 10) * 100);
}

// ---- Standard Deviation ----
function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sqDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / values.length);
}

// ---- Fatigue Level ----
function getFatigueLevel(score: number): FatigueLevel {
  if (score >= 80) return 'alert';
  if (score >= 60) return 'mild_fatigue';
  if (score >= 40) return 'moderate_fatigue';
  return 'high_fatigue';
}

const FATIGUE_COLORS: Record<FatigueLevel, string> = {
  alert: '#10b981',
  mild_fatigue: '#38bdf8',
  moderate_fatigue: '#fb7185',
  high_fatigue: '#ef4444',
};

const FATIGUE_LABELS: Record<FatigueLevel, string> = {
  alert: 'Alert',
  mild_fatigue: 'Mild Fatigue',
  moderate_fatigue: 'Moderate',
  high_fatigue: 'High Fatigue',
};

// ---- Hook ----
export function useWebcam() {
  const [isActive, setIsActive] = useState(false);
  const [latestMetrics, setLatestMetrics] = useState<WebcamMetrics | null>(null);
  const [fatigueLevel, setFatigueLevel] = useState<FatigueLevel>('alert');

  const toggle = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  return { isActive, toggle, latestMetrics, setLatestMetrics, fatigueLevel, setFatigueLevel };
}

// ---- Component ----
interface WebcamModuleProps {
  isActive: boolean;
  onToggle: () => void;
  onMetrics?: (metrics: WebcamMetrics, level: FatigueLevel) => void;
  /** If true, webcam will auto-close after first successful save to database */
  autoCloseAfterSave?: boolean;
  /** If true, skip saving to backend (demo mode) */
  isDemo?: boolean;
}

export function WebcamModule({ isActive, onToggle, onMetrics, autoCloseAfterSave = true, isDemo = false }: WebcamModuleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [minimized, setMinimized] = useState(false);
  const [calibrating, setCalibrating] = useState(true);
  const [metrics, setMetrics] = useState<WebcamMetrics | null>(null);
  const [fatigueLevel, setFatigueLevel] = useState<FatigueLevel>('alert');

  // Refs for tracking data
  const blinkTimestamps = useRef<number[]>([]);
  const earHistory = useRef<{ time: number; ear: number }[]>([]);
  const noseYHistory = useRef<number[]>([]);
  const noseYBaseline = useRef<number | null>(null);
  const gazeXHistory = useRef<number[]>([]);
  const gazeYHistory = useRef<number[]>([]);
  const sessionStart = useRef<number>(Date.now());
  const lastEmit = useRef<number>(0);
  const wasBlinking = useRef(false);
  const cameraRef = useRef<{ stop: () => void } | null>(null);
  const faceMeshRef = useRef<ReturnType<typeof window.FaceMesh> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasSavedRef = useRef(false); // Track if we've already saved to avoid double-close

  // LEFT_EYE: 33, 160, 158, 133, 153, 144
  // RIGHT_EYE: 362, 385, 387, 263, 373, 380
  const LEFT_EYE = [33, 160, 158, 133, 153, 144];
  const RIGHT_EYE = [362, 385, 387, 263, 373, 380];

  useEffect(() => {
    if (!isActive) {
      // Cleanup
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCalibrating(true);
      setMetrics(null);
      blinkTimestamps.current = [];
      earHistory.current = [];
      noseYHistory.current = [];
      noseYBaseline.current = null;
      gazeXHistory.current = [];
      gazeYHistory.current = [];
      wasBlinking.current = false;
      hasSavedRef.current = false; // Reset save flag on deactivation
      return;
    }

    // Check CDN loaded
    if (!window.FaceMesh || !window.Camera) {
      console.warn('MediaPipe not loaded. Check CDN scripts in index.html.');
      return;
    }

    sessionStart.current = Date.now();
    setCalibrating(true);

    const faceMesh = new window.FaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    faceMeshRef.current = faceMesh;

    faceMesh.onResults((results: { multiFaceLandmarks?: { x: number; y: number; z: number }[][] }) => {
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

      const landmarks = results.multiFaceLandmarks[0];
      const now = Date.now();
      const elapsed = (now - sessionStart.current) / 1000;

      // EAR
      const leftEAR = computeEAR(landmarks, LEFT_EYE);
      const rightEAR = computeEAR(landmarks, RIGHT_EYE);
      const avgEAR = (leftEAR + rightEAR) / 2;

      earHistory.current.push({ time: now, ear: avgEAR });
      // Keep only last 60s
      earHistory.current = earHistory.current.filter((e) => now - e.time < 60000);

      // Blink detection
      const isBlinking = avgEAR < 0.25;
      if (isBlinking && !wasBlinking.current) {
        blinkTimestamps.current.push(now);
      }
      wasBlinking.current = isBlinking;
      // Keep only last 60s of blinks
      blinkTimestamps.current = blinkTimestamps.current.filter((t) => now - t < 60000);

      // Nose Y (head stability) - landmark 1
      const noseY = landmarks[1].y;
      noseYHistory.current.push(noseY);
      if (noseYHistory.current.length > 300) noseYHistory.current.shift();

      // Calibration: first 30 seconds builds baseline
      if (elapsed < 30) {
        if (noseYBaseline.current === null) {
          noseYBaseline.current = noseY;
        } else {
          noseYBaseline.current = (noseYBaseline.current * 0.95) + (noseY * 0.05);
        }
      }

      if (elapsed >= 30 && calibrating) {
        setCalibrating(false);
      }

      // Gaze center
      const leftCenter = landmarks[468] || landmarks[33]; // iris center or fallback
      const rightCenter = landmarks[473] || landmarks[263];
      const gazeX = (leftCenter.x + rightCenter.x) / 2;
      const gazeY = (leftCenter.y + rightCenter.y) / 2;
      gazeXHistory.current.push(gazeX);
      gazeYHistory.current.push(gazeY);
      // Keep last 30s worth (~30fps * 30s = 900)
      if (gazeXHistory.current.length > 900) gazeXHistory.current.shift();
      if (gazeYHistory.current.length > 900) gazeYHistory.current.shift();

      // Emit every 10 seconds
      if (now - lastEmit.current >= 10000 && elapsed >= 30) {
        lastEmit.current = now;

        // Blink rate (per minute)
        const blinkCount = blinkTimestamps.current.length;
        const windowSec = Math.min(60, elapsed);
        const blinkRate = Math.round((blinkCount / windowSec) * 60);

        // PERCLOS
        const recentEar = earHistory.current.filter((e) => now - e.time < 60000);
        const closedFrames = recentEar.filter((e) => e.ear < 0.25).length;
        const perclos = recentEar.length > 0 ? Math.round((closedFrames / recentEar.length) * 100) : 0;

        // Head stability
        const headDrift = noseYBaseline.current !== null
          ? Math.abs(noseY - noseYBaseline.current)
          : 0;
        const headStability = Math.max(0, Math.round(100 - headDrift * 1000));

        // Gaze stability
        const gazeStdX = stdDev(gazeXHistory.current.slice(-300));
        const gazeStdY = stdDev(gazeYHistory.current.slice(-300));
        const gazeStdAvg = (gazeStdX + gazeStdY) / 2;
        const gazeStability = Math.max(0, Math.round(100 - gazeStdAvg * 5000));

        // Fatigue score
        const blinkScore = blinkNormalScore(blinkRate);
        const webcamFatigueScore = Math.round(
          (100 - perclos) * 0.4 + headStability * 0.3 + gazeStability * 0.2 + blinkScore * 0.1
        );

        const newMetrics: WebcamMetrics = {
          blinkRate,
          perclos,
          headStability,
          gazeStability,
          webcamFatigueScore,
        };
        const level = getFatigueLevel(webcamFatigueScore);

        setMetrics(newMetrics);
        setFatigueLevel(level);
        onMetrics?.(newMetrics, level);

        // Auto-close after first capture if enabled (regardless of API success)
        if (autoCloseAfterSave && !hasSavedRef.current) {
          hasSavedRef.current = true;
          console.log('[WebcamModule] First capture complete. Auto-closing in 2.5s...');
          // Give user time to see the metrics before closing
          setTimeout(() => {
            console.log('[WebcamModule] Auto-closing webcam now');
            onToggle();
          }, 2500);
        }

        // Send to backend (fire and forget - don't block closing on this)
        // Skip API call if in demo mode
        if (!isDemo) {
          webcamApi.saveSnapshot({
            blink_rate: blinkRate,
            perclos,
            head_stability: headStability,
            gaze_stability: gazeStability,
            webcam_fatigue_score: webcamFatigueScore,
          }).then(() => {
            console.log('[WebcamModule] Metrics saved to database');
          }).catch((err) => {
            console.warn('[WebcamModule] Failed to save metrics:', err);
          });
        } else {
          console.log('[WebcamModule] Demo mode - skipping database save');
        }
      }
    });

    const video = videoRef.current;
    if (video) {
      const cam = new window.Camera(video, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 320,
        height: 240,
      });
      cam.start();
      cameraRef.current = cam;

      // Store stream ref for cleanup
      navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } }).then((stream) => {
        streamRef.current = stream;
      }).catch(() => {});
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, autoCloseAfterSave, onToggle, isDemo]);

  if (!isActive) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.08] backdrop-blur-md text-gray-300 hover:text-white hover:border-white/30 transition-all duration-150"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
      >
        <Camera className="w-4 h-4" />
        <span className="text-sm">Enable Webcam</span>
      </button>
    );
  }

  if (minimized) {
    return (
      <div
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2 rounded-full border border-white/15 bg-white/[0.08] backdrop-blur-md cursor-pointer"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        onClick={() => setMinimized(false)}
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-gray-300">Camera Active</span>
        <Maximize2 className="w-3 h-3 text-gray-400" />
      </div>
    );
  }

  // Metric bar helper
  const MetricBar = ({ label, value, max = 100 }: { label: string; value: number; max?: number }) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#38bdf8' : pct >= 40 ? '#fb7185' : '#ef4444';
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400 w-12 text-right">{label}</span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/15 bg-black/70 backdrop-blur-xl overflow-hidden"
      style={{ width: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
    >
      {/* Video Preview */}
      <div className="relative" style={{ height: 100 }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-t-2xl"
          autoPlay
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Calibrating overlay */}
        {calibrating && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-t-2xl">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
              <span className="text-[10px] text-violet-300">Calibrating...</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute top-1.5 right-1.5 flex gap-1">
          <button
            onClick={() => setMinimized(true)}
            className="w-5 h-5 rounded bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <Minimize2 className="w-3 h-3 text-gray-300" />
          </button>
          <button
            onClick={onToggle}
            className="w-5 h-5 rounded bg-black/50 flex items-center justify-center hover:bg-red-500/50 transition-colors"
          >
            <CameraOff className="w-3 h-3 text-gray-300" />
          </button>
        </div>

        {/* Active badge */}
        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] text-green-300">Live</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-3 py-2 space-y-1.5">
        {metrics ? (
          <>
            {/* Fatigue badge */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-400">Fatigue</span>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{
                  color: FATIGUE_COLORS[fatigueLevel],
                  backgroundColor: `${FATIGUE_COLORS[fatigueLevel]}20`,
                }}
              >
                {FATIGUE_LABELS[fatigueLevel]}
              </span>
            </div>
            <MetricBar label="Blink" value={blinkNormalScore(metrics.blinkRate)} />
            <MetricBar label="PERCLOS" value={100 - metrics.perclos} />
            <MetricBar label="Head" value={metrics.headStability} />
            <MetricBar label="Gaze" value={metrics.gazeStability} />
          </>
        ) : (
          <div className="text-center py-1">
            <span className="text-[10px] text-gray-500">Collecting data...</span>
          </div>
        )}
      </div>

      {/* Privacy notice */}
      <div className="px-3 pb-2 flex items-center gap-1">
        <Shield className="w-3 h-3 text-violet-400 flex-shrink-0" />
        <span className="text-[8px] text-gray-500">No video stored. Only numbers saved.</span>
      </div>
    </div>
  );
}
