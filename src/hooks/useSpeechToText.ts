import { useState, useEffect, useRef } from "react";

export function useSpeechToText() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error("Failed to initialize SpeechRecognition:", e);
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript("");
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting speech recognition:", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {
        console.error("Error stopping speech recognition:", e);
      }
    }
  };

  const resetTranscript = () => {
    setTranscript("");
  };

  return {
    transcript,
    setTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
