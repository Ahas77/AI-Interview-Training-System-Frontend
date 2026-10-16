import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Send, Video, Volume2 } from "lucide-react";
import { toast } from "react-toastify";
import { c3Api } from "./c3Api";
import { useSpeechToText } from "../../hooks/useSpeechToText";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";
import { useWebcamMic } from "../../hooks/useWebcamMic";
import { useC3SignalBatcher } from "../../hooks/useC3SignalBatcher";
import { getErrorMessage } from "./errorUtils";
import { CameraCoaching } from "../../components/c3/CameraCoaching";

const prompts = [
  "Tell us about your day in a relaxed way.",
  "Describe a recent task you enjoyed working on.",
  "Talk about something you are looking forward to this week.",
];

export default function WarmupPage() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [building, setBuilding] = useState(false);
  const [startedAt] = useState(Date.now);
  const startRef = useRef(Date.now());
  const { videoRef, hasPermission, isMicMuted, isVideoOff, toggleMic, toggleVideo } = useWebcamMic();
  const { transcript, isListening, startListening, stopListening, resetTranscript } = useSpeechToText();
  const { speakQuestion } = useTextToSpeech();
  const { recordTextSignal, flush } = useC3SignalBatcher({
    sessionId,
    qaId: null,
    enabled: Boolean(sessionId),
    getElapsedSec: () => (Date.now() - startRef.current) / 1000,
  });

  useEffect(() => {
    const create = async () => {
      try {
        const data = await c3Api.createWarmup();
        setSessionId(data.sessionId);
        speakQuestion(prompts[0]);
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to create warm-up session."));
      }
    };
    create();
  }, [speakQuestion]);

  const nextPrompt = async () => {
    recordTextSignal({ transcript });
    resetTranscript();
    if (currentPrompt < prompts.length - 1) {
      const next = currentPrompt + 1;
      setCurrentPrompt(next);
      speakQuestion(prompts[next]);
      return;
    }

    if (!sessionId) return;
    try {
      setBuilding(true);
      if (isListening) stopListening();
      await flush();
      const result = await c3Api.buildBaseline(sessionId);
      toast.success(`Baseline built. Reading coverage: ${Math.round(Number(result.baseline?.confidence || 0) * 100)}%`);
      navigate("/progress");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to build baseline."));
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-[#0B3538]">
          Warm-up readings are used to create your own baseline. This helps future coaching compare delivery deviation with your usual relaxed delivery.
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0B3538]">
              <Video className="h-4 w-4 text-[#0E8C86]" />
              Warm-up camera
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
              <video ref={videoRef} autoPlay playsInline muted className={`h-full w-full -scale-x-100 object-cover ${isVideoOff || !hasPermission ? "hidden" : "block"}`} />
              {(isVideoOff || !hasPermission) && <div className="flex h-full items-center justify-center text-sm text-slate-300">Camera unavailable or paused</div>}
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={toggleMic} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold">{isMicMuted ? "Unmute mic" : "Mute mic"}</button>
              <button type="button" onClick={toggleVideo} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold">{isVideoOff ? "Turn video on" : "Turn video off"}</button>
            </div>
            <CameraCoaching videoRef={videoRef} sessionId={sessionId} startedAt={startedAt} enabled={Boolean(hasPermission && !isVideoOff && !building)} />
            <p className="mt-3 text-sm text-slate-600">Speak naturally for about one minute per prompt. At least 3 valid readings from a connected analysis component are needed for your baseline. Camera preview alone does not produce measurements.</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0B3538]">
              <Volume2 className="h-4 w-4 text-[#0E8C86]" />
              Prompt {currentPrompt + 1} of {prompts.length}
            </div>
            <p className="rounded-xl bg-teal-50 p-4 text-lg font-semibold leading-7 text-[#0B3538]">{prompts[currentPrompt]}</p>
            <textarea value={transcript} readOnly rows={5} className="mt-4 w-full resize-none rounded-xl border border-gray-300 p-3 text-sm" placeholder="Your spoken answer transcript appears here..." />
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={isListening ? stopListening : startListening} className="inline-flex items-center gap-2 rounded-xl bg-[#0E8C86] px-4 py-2 text-sm font-semibold text-white">
                <Mic className="h-4 w-4" />
                {isListening ? "Stop recording" : "Start speaking"}
              </button>
              <button type="button" onClick={nextPrompt} disabled={building || !sessionId} className="inline-flex items-center gap-2 rounded-xl bg-[#0B3538] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
                <Send className="h-4 w-4" />
                {currentPrompt < prompts.length - 1 ? "Next prompt" : building ? "Building baseline..." : "Finish warm-up"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
