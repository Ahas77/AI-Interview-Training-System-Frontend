import { RefObject, useEffect, useRef, useState } from "react";
import axiosInstance from "../../app/lib/axiosInstance";
import { isAxiosError } from "axios";

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  sessionId: number | null;
  qaId?: number | null;
  enabled: boolean;
  startedAt: number;
};

export function CameraCoaching({ videoRef, sessionId, qaId = null, enabled, startedAt }: Props) {
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("Camera analysis is off.");
  const activeRef = useRef(false);
  const [readings, setReadings] = useState(0);
  useEffect(() => {
    if (!consent || !enabled || !sessionId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const capture = async () => {
      const video = videoRef.current;
      if (activeRef.current || !video || video.readyState < 2 || !video.videoWidth) {
        timer = setTimeout(capture, 15000);
        return;
      }
      activeRef.current = true;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 480;
        canvas.height = Math.round(480 * video.videoHeight / video.videoWidth);
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (!cancelled) setStatus("Analysing a camera frame with Grok...");
        const res = await axiosInstance.post("/c3/vision/frame", {
          sessionId, qaId, consent: true,
          t_sec: Math.max(0, (Date.now() - startedAt) / 1000),
          image: canvas.toDataURL("image/jpeg", 0.65),
        });
        if (!cancelled) {
          if (res.data.data.status === "recorded") {
            setReadings((count) => count + 1);
            setStatus("Delivery indicators saved. Next frame in 15 seconds.");
          } else setStatus("No clearly visible face. Try facing the camera with better lighting.");
        }
      } catch (error) {
        if (!cancelled) {
          if (isAxiosError(error) && error.response?.status === 429) setStatus("Waiting before the next camera reading...");
          else {
            setStatus("Camera analysis unavailable. Check the backend Grok key, model access and quota; then enable it again.");
            setConsent(false);
          }
        }
      } finally {
        activeRef.current = false;
        if (!cancelled) timer = setTimeout(capture, 15000);
      }
    };
    timer = setTimeout(capture, 1000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [consent, enabled, sessionId, qaId, startedAt, videoRef]);

  return <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-slate-700">
    <label className="flex items-start gap-3 leading-6">
      <input type="checkbox" checked={consent} onChange={(event) => {
        setConsent(event.target.checked);
        setStatus(event.target.checked ? "Waiting for camera..." : "Camera analysis is off.");
      }} className="mt-1 h-4 w-4" />
      <span>Enable Grok camera coaching. Send one frame every 15 seconds to xAI to estimate gaze and head direction. The app stores numeric indicators, not images. These estimates do not reveal your emotions.</span>
    </label>
    <p role="status" className="mt-2 text-xs leading-5">{consent && !enabled ? "Paused while the camera or interview is inactive." : status} {readings > 0 && `${readings} readings saved.`}</p>
  </div>;
}
