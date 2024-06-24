"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSpeechRecognition } from "@/hooks";

export const Initializer = () => {
  const [prompt, setPrompt] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const audioElement = useRef(null);

  const { startRecognition, stopRecognition } = useSpeechRecognition({
    onCompletedSpeech: (text) => {
      setPrompt(text);
      setTimeout(() => {
        sendRequestToOpenAI(text);
      }, 3000);
    },
  });

  //   useEffect(() => {
  //     if (speechResult !== prompt) {
  //       setPrompt(speechResult);
  //     }

  //     setPrompt(speechResult);
  //   }, [speechResult]);

  const sendRequestToOpenAI = async (textInput: string) => {
    console.log("text input", textInput);

    try {
      const response = await axios.post("/api/openai", { prompt: textInput });

      if (response.status === 200) {
        setTextResponse(response.data.result);

        const audioResponse = await axios.post(
          "/api/openaiaudio",
          { prompt: response.data.result },
          { responseType: "arraybuffer" } // Ensure response is handled as an array buffer
        );

        if (audioResponse.status === 200) {
          const blob = new Blob([audioResponse.data], { type: "audio/mp3" });
          const blobUrl = URL.createObjectURL(blob);

          setAudioSrc(blobUrl);
        } else {
          setError("Failed to generate audio from OpenAI");
        }
      } else {
        setError("Failed to fetch text response from OpenAI");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to communicate with OpenAI");
    }
  };

  const handleSubmit = async (e) => {
    if (prompt === "") return;

    if (e) e.preventDefault();

    sendRequestToOpenAI(prompt);
  };

  useEffect(() => {
    if (audioSrc && audioElement.current) {
      audioElement.current.src = audioSrc;
      audioElement.current.load();

      const playAudio = () => {
        audioElement.current?.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      };

      audioElement.current.addEventListener("canplaythrough", playAudio);

      return () => {
        audioElement.current?.removeEventListener("canplaythrough", playAudio);
      };
    }
  }, [audioSrc]);

  const handleStartListening = () => {
    console.log(startRecognition);

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
      {error && <p>{error}</p>}
      <audio
        ref={audioElement}
        onPlay={() => stopRecognition()}
        onEnded={() => startRecognition()}
        src={audioSrc}
        controls
      />
    </div>
  );
};
