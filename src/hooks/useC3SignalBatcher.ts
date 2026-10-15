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
  const queueRef = useRef<{ sessionId: number; qaId: number | null; reading: SignalReading }[]>([]);
  const lastFlushRef = useRef(Promise.resolve());

  const elapsed = useCallback(() => {
    return Number((getElapsedSec ? getElapsedSec() : performance.now() / 1000).toFixed(2));
  }, [getElapsedSec]);

  const enqueue = useCallback((reading: SignalReading) => {
    if (!enabled || !sessionId) return;
    queueRef.current.push({ sessionId, qaId, reading });
  }, [enabled, sessionId, qaId]);

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
    lastFlushRef.current = lastFlushRef.current.catch(() => undefined).then(async () => {
      while (queueRef.current.length) {
        const first = queueRef.current[0];
        const batch = [];
        while (queueRef.current.length && batch.length < 100 &&
          queueRef.current[0].sessionId === first.sessionId && queueRef.current[0].qaId === first.qaId) {
          batch.push(queueRef.current.shift()!);
        }
        try {
          await c3Api.sendSignals(first.sessionId, first.qaId, batch.map((entry) => entry.reading));
        } catch (error) {
          queueRef.current.unshift(...batch);
          throw error;
        }
      }
    });
    await lastFlushRef.current;
  }, []);

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
      void flush().catch(() => undefined);
    }, 5000);

    return () => {
      window.clearInterval(interval);
      void flush().catch(() => undefined);
    };
  }, [devMockEnabled, elapsed, enabled, enqueue, flush, sessionId]);

  return {
    enqueue,
    recordTextSignal,
    recordExternalMetrics,
    flush,
  };
}
