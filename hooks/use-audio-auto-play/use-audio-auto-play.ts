import { useEffect, useRef, useState } from "react";

export const useAudioAutoPlay = () => {
  const audioElement = useRef<HTMLAudioElement>(null);
  const [audioSrc, setAudioSrc] = useState<string>("");

  useEffect(() => {
    const audioNode = audioElement.current;

    if (audioSrc && audioNode) {
      audioNode.src = audioSrc;
      audioNode.load();

      const playAudio = () => {
        audioNode?.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      };

      audioNode.addEventListener("canplaythrough", playAudio);

      return () => {
        audioNode?.removeEventListener("canplaythrough", playAudio);
      };
    }
  }, [audioSrc]);

  return {
    audioRef: audioElement,
    audioSrc,
    setAudioSrc,
  };
};
