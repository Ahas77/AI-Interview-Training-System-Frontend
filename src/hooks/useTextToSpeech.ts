import { useState, useCallback } from "react";

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);

  const speakQuestion = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech Synthesis API not supported in this browser.");
      return;
    }

    // Cancel any active speech
    window.speechSynthesis.cancel();

    if (!text || text.trim().length === 0) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Natural human pace
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    // Try selecting natural sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Karen"))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  return { isPlaying, speakQuestion, stopSpeaking };
}
