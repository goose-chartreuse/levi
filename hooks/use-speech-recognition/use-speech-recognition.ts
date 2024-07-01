import { useEffect, useRef, useState } from "react";

export const useSpeechRecognition = ({
  onCompletedSpeech,
}: {
  onCompletedSpeech: (text: string) => void;
}) => {
  const immutableRecognition = useRef<SpeechRecognition>();

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const lastResult = event.results[event.resultIndex];

        if (lastResult.isFinal) {
          const textSpeech = lastResult[0].transcript;

          onCompletedSpeech(textSpeech);
        }
      };

      immutableRecognition.current = recognition;
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  }, []);

  return {
    startRecognition: () => immutableRecognition.current?.start(),
    stopRecognition: () => immutableRecognition.current?.stop(),
  };
};
