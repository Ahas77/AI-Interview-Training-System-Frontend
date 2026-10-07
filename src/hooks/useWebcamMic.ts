import { useEffect, useRef, useState } from "react";

export function useWebcamMic() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: true,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Camera/Microphone permission denied or unavailable:", err);
        setHasPermission(false);
      }
    }

    startMedia();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return { videoRef, hasPermission, isMicMuted, isVideoOff, toggleMic, toggleVideo };
}
