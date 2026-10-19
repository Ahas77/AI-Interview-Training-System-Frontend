import { useEffect, useRef, useState } from "react";
import { Activity, CheckCircle2, Loader2, Play, ShieldAlert, StopCircle } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../lib/axiosInstance";

type AnalysisStatus =
  | "idle"
  | "collecting_baseline"
  | "saving_baseline"
  | "collecting_measurements"
  | "saving_measurements"
  | "completed"
  | "error";

interface BehavioralAnalysisPanelProps {
  stream: MediaStream | null;
  interviewCompleted: boolean;
}

interface BehavioralSample {
  timestampMs: number;
  vocal: {
    vocal_energy: number | null;
    speech_rate: number | null;
  };
  facial: {
    facial_landmark_movement: number | null;
    facial_movement_intensity: number | null;
    head_movement: number | null;
  };
}

interface AnalysisResult {
  overallStatus: string;
  mainChanges: Array<{ feature: string; changePercent: number; direction: string }>;
}

const SAMPLE_INTERVAL_MS = 1000;
const MIN_BASELINE_MS = 30_000;
const MAX_BASELINE_MS = 60_000;

function getAudioEnergy(analyser: AnalyserNode, buffer: Uint8Array) {
  analyser.getByteTimeDomainData(buffer);
  let sum = 0;
  for (const value of buffer) {
    const normalized = (value - 128) / 128;
    sum += normalized * normalized;
  }
  return Math.sqrt(sum / buffer.length);
}

export default function BehavioralAnalysisPanel({
  stream,
  interviewCompleted,
}: BehavioralAnalysisPanelProps) {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const sessionIdRef = useRef<number | null>(null);
  const samplesRef = useRef<BehavioralSample[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioBufferRef = useRef<Uint8Array | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previousFrameRef = useRef<Uint8ClampedArray | null>(null);
  const savingMeasurementsRef = useRef(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      audioContextRef.current?.close().catch((error) => {
        console.error("Failed to close behavioral analysis audio context:", error);
      });
    };
  }, []);

  useEffect(() => {
    if (interviewCompleted && status === "collecting_measurements") {
      void saveMeasurements();
    }
  }, [interviewCompleted, status]);

  const collectSample = () => {
    const startedAt = startedAtRef.current;
    if (!startedAt) return;

    const analyser = analyserRef.current;
    const audioBuffer = audioBufferRef.current;
    const audioEnergy = analyser && audioBuffer ? getAudioEnergy(analyser, audioBuffer) : null;
    let movement = 0;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const previousFrame = previousFrameRef.current;

    if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (context) {
        canvas.width = 64;
        canvas.height = 36;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const currentFrame = context.getImageData(0, 0, canvas.width, canvas.height).data;
        if (previousFrame) {
          let difference = 0;
          for (let index = 0; index < currentFrame.length; index += 4) {
            difference += Math.abs(currentFrame[index] - previousFrame[index]);
          }
          movement = difference / (currentFrame.length / 4) / 255;
        }
        previousFrameRef.current = new Uint8ClampedArray(currentFrame);
      }
    }

    samplesRef.current.push({
      timestampMs: Date.now() - startedAt,
      vocal: { vocal_energy: audioEnergy, speech_rate: audioEnergy },
      facial: {
        facial_landmark_movement: movement,
        facial_movement_intensity: movement,
        head_movement: movement,
      },
    });
  };

  const stopCollecting = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startCollecting = async (nextStatus: "collecting_baseline" | "collecting_measurements") => {
    if (!stream) {
      toast.warning("Camera and microphone access is required for behavioral analysis.");
      return;
    }

    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        audioBufferRef.current = new Uint8Array(analyser.fftSize);
      }

      samplesRef.current = [];
      previousFrameRef.current = null;
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setErrorMessage("");
      setStatus(nextStatus);
      collectSample();
      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - (startedAtRef.current || Date.now());
        setElapsedMs(elapsed);
        collectSample();
        if (nextStatus === "collecting_baseline" && elapsed >= MAX_BASELINE_MS) {
          void saveBaseline();
        }
      }, SAMPLE_INTERVAL_MS);
    } catch (error) {
      console.error("Unable to start behavioral analysis:", error);
      setStatus("error");
      setErrorMessage("The browser could not initialize audio analysis.");
    }
  };

  const createSessionAndStartBaseline = async () => {
    try {
      const response = await axiosInstance.post("/behavioral-analysis/sessions");
      if (!response.data?.success || !response.data.sessionId) {
        throw new Error(response.data?.message || "Could not create analysis session.");
      }
      sessionIdRef.current = response.data.sessionId;
      await startCollecting("collecting_baseline");
    } catch (error: any) {
      console.error("Behavioral analysis session creation failed:", error);
      setStatus("error");
      setErrorMessage(error.response?.data?.message || error.message || "Could not start analysis.");
    }
  };

  const saveBaseline = async () => {
    const sessionId = sessionIdRef.current;
    const samples = samplesRef.current;
    const elapsed = Date.now() - (startedAtRef.current || Date.now());
    if (!sessionId || elapsed < MIN_BASELINE_MS || samples.length < 2) {
      toast.info("Continue the warm-up until at least 30 seconds have been captured.");
      return;
    }

    stopCollecting();
    setStatus("saving_baseline");
    try {
      const response = await axiosInstance.post(
        `/behavioral-analysis/sessions/${sessionId}/baseline`,
        { samples },
      );
      if (!response.data?.success) throw new Error(response.data?.message || "Could not save baseline.");
      await startCollecting("collecting_measurements");
    } catch (error: any) {
      console.error("Behavioral baseline save failed:", error);
      setStatus("error");
      setErrorMessage(error.response?.data?.message || error.message || "Could not save baseline.");
    }
  };

  const saveMeasurements = async () => {
    const sessionId = sessionIdRef.current;
    if (!sessionId || savingMeasurementsRef.current || samplesRef.current.length < 1) return;

    savingMeasurementsRef.current = true;
    stopCollecting();
    setStatus("saving_measurements");
    try {
      const response = await axiosInstance.post(
        `/behavioral-analysis/sessions/${sessionId}/measurements`,
        { samples: samplesRef.current },
      );
      if (!response.data?.success) throw new Error(response.data?.message || "Could not save measurements.");
      setResult(response.data);
      setStatus("completed");
    } catch (error: any) {
      console.error("Behavioral measurement save failed:", error);
      setStatus("error");
      setErrorMessage(error.response?.data?.message || error.message || "Could not save measurements.");
    } finally {
      savingMeasurementsRef.current = false;
    }
  };

  const reset = () => {
    stopCollecting();
    sessionIdRef.current = null;
    samplesRef.current = [];
    startedAtRef.current = null;
    setElapsedMs(0);
    setResult(null);
    setErrorMessage("");
    setStatus("idle");
    savingMeasurementsRef.current = false;
  };

  const baselineSeconds = Math.floor(elapsedMs / 1000);
  const isBaselineTooShort = elapsedMs < MIN_BASELINE_MS;
  const isCollecting = status === "collecting_baseline" || status === "collecting_measurements";

  return (
    <section className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      <video ref={videoRef} autoPlay muted playsInline className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0E8C86]" />
            Behavioral baseline
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Private, session-specific vocal energy and facial movement comparison.
          </p>
        </div>
        {status === "completed" ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        ) : (
          <ShieldAlert className="w-5 h-5 text-amber-500" />
        )}
      </div>

      {status === "idle" && (
        <button
          type="button"
          onClick={() => void createSessionAndStartBaseline()}
          disabled={!stream}
          className="w-full px-4 py-2.5 rounded-xl bg-[#0E8C86] hover:bg-[#0C7873] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" /> Start 30-second warm-up
        </button>
      )}

      {status === "collecting_baseline" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Warm-up samples: {baselineSeconds}s / 30s minimum</span>
            <span className="text-[#0E8C86] font-semibold">Recording</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-[#0E8C86] transition-all"
              style={{ width: `${Math.min((elapsedMs / MIN_BASELINE_MS) * 100, 100)}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => void saveBaseline()}
            disabled={isBaselineTooShort}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 disabled:opacity-50 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <StopCircle className="w-4 h-4" /> Save baseline
          </button>
        </div>
      )}

      {(status === "saving_baseline" || status === "saving_measurements") && (
        <p className="text-xs text-gray-600 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#0E8C86]" /> Saving behavioral samples...
        </p>
      )}

      {status === "collecting_measurements" && (
        <p className="text-xs text-emerald-700">
          Baseline ready. Measurements are being collected while you interview and will be analyzed when you finish.
        </p>
      )}

      {status === "completed" && result && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-800">
            {result.overallStatus === "within_personal_baseline"
              ? "Your responses stayed within your personal baseline."
              : "Behavioral deviations were detected for review."}
          </p>
          {result.mainChanges.slice(0, 3).map((change) => (
            <div key={change.feature} className="flex items-center justify-between text-xs text-gray-600">
              <span>{change.feature.replace(/_/g, " ")}</span>
              <span className="font-semibold">{change.changePercent}%</span>
            </div>
          ))}
          <button type="button" onClick={reset} className="text-xs text-[#0E8C86] font-semibold">
            Run another baseline
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-2">
          <p className="text-xs text-red-600">{errorMessage}</p>
          <button type="button" onClick={reset} className="text-xs text-[#0E8C86] font-semibold">
            Try again
          </button>
        </div>
      )}

      {isCollecting && status !== "collecting_baseline" && (
        <span className="sr-only">Collecting live measurements</span>
      )}
    </section>
  );
}
