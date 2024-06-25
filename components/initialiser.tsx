"use client";

import { useState } from "react";

import { useSpeechRecognition, useAudioAutoPlay } from "@/hooks";
import { fetchOpenai, fetchOpenaiSpeech } from "@/fetchers";

export const Initializer = () => {
  const [prompt, setPrompt] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [isListening, setIsListening] = useState(false);

  const { startRecognition, stopRecognition } = useSpeechRecognition({
    onCompletedSpeech: (text) => {
      setPrompt(text);
      setTimeout(() => {
        sendRequestToOpenAI(text);
      }, 3000);
    },
  });

  const { audioRef, audioSrc, setAudioSrc } = useAudioAutoPlay();

  const sendRequestToOpenAI = async (textInput: string) => {
    try {
      const response = await fetchOpenai(textInput);

      if (response?.status === 200) {
        setTextResponse(response.data.result);

        const speechResponse = await fetchOpenaiSpeech(response.data.result);

        if (speechResponse) {
          if (speechResponse.status === 200) {
            const blob = new Blob([speechResponse.data], { type: "audio/mp3" });
            const blobUrl = URL.createObjectURL(blob);

            setAudioSrc(blobUrl);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    if (prompt === "") return;

    if (e) e.preventDefault();

    sendRequestToOpenAI(prompt);
  };

  const handleStartListening = () => {
    if (startRecognition) {
      startRecognition();
      setIsListening(true);
    }
  };

  const handleStopListening = () => {
    if (stopRecognition) {
      stopRecognition();
      setIsListening(false);
    }
  };

  return (
    <div>
      <h1>OpenAI Text-to-Speech Example</h1>
      <div>
        <button onClick={handleStartListening} disabled={isListening}>
          Enable Speech-to-Text
        </button>
        <button onClick={handleStopListening} disabled={!isListening}>
          Disable Speech-to-Text
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows="4"
          cols="50"
        />
        <button type="submit">Generate Response</button>
      </form>
      <div>
        <h2>Text Response:</h2>
        <p>{textResponse}</p>
      </div>
      <audio
        ref={audioRef}
        onPlay={() => stopRecognition()}
        onEnded={() => startRecognition()}
        src={audioSrc}
        controls
      />
    </div>
  );
};
