import { useCallback, useEffect, useRef } from "react";
import { c3Api, SignalReading } from "../app/progress/c3Api";

type UseC3SignalBatcherArgs = {
  sessionId: number | null;
  qaId: number | null;
  enabled: boolean;
  devMockEnabled?: boolean;
  getElapsedSec?: () => number;
};

type TextSignalInput = {
  transcript: string;
};

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function useC3SignalBatcher({ sessionId, qaId, enabled, devMockEnabled = false, getElapsedSec }: UseC3SignalBatcherArgs) {
  const queueRef = useRef<SignalReading[]>([]);
  const lastFlushRef = useRef(Promise.resolve());

  const elapsed = useCallback(() => {
    return Number((getElapsedSec ? getElapsedSec() : performance.now() / 1000).toFixed(2));
  }, [getElapsedSec]);

  const enqueue = useCallback((reading: SignalReading) => {
    if (!enabled || !sessionId) return;
    queueRef.current.push(reading);
  }, [enabled, sessionId]);

  const recordTextSignal = useCallback(({ transcript }: TextSignalInput) => {
    if (!transcript.trim()) return;
    const words = countWords(transcript);
    enqueue({
      t_sec: elapsed(),
      source: "text",
      metrics: {
        browser_word_count: words,
        browser_answer_length: transcript.trim().length,
      },
    });
  }, [elapsed, enqueue]);

  const recordExternalMetrics = useCallback((metrics: Record<string, number>, source: "face" | "voice" | "text" = "face") => {
    enqueue({ t_sec: elapsed(), source, metrics });
  }, [elapsed, enqueue]);

  const flush = useCallback(async () => {
    if (!sessionId || queueRef.current.length === 0) return;
    const batch = queueRef.current.splice(0, 100);
    lastFlushRef.current = lastFlushRef.current
      .catch(() => undefined)
      .then(async () => {
        try {
          await c3Api.sendSignals(sessionId, qaId, batch);
        } catch {
          queueRef.current.unshift(...batch);
        }
      });
    await lastFlushRef.current;
  }, [qaId, sessionId]);

  useEffect(() => {
    if (!enabled || !sessionId) return;
    const interval = window.setInterval(() => {
      if (devMockEnabled) {
        enqueue({
          t_sec: elapsed(),
          source: "face",
          metrics: {
            tension: Number((0.35 + Math.random() * 0.15).toFixed(3)),
            gaze_off: Number((0.2 + Math.random() * 0.1).toFixed(3)),
            pace: Number((0.45 + Math.random() * 0.1).toFixed(3)),
            pause_ratio: Number((0.3 + Math.random() * 0.1).toFixed(3)),
          },
        });
      }
      flush();
    }, 5000);

    return () => {
      window.clearInterval(interval);
      flush();
    };
  }, [devMockEnabled, elapsed, enabled, enqueue, flush, sessionId]);

  return {
    enqueue,
    recordTextSignal,
    recordExternalMetrics,
    flush,
  };
}
