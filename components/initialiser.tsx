"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

export const Initializer = () => {
  const [prompt, setPrompt] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [error, setError] = useState(null);

  const audioElement = useRef<HTMLAudioElement>(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (prompt === "") return;

    try {
      // Step 1: Request text response from OpenAI using Axios
      const response = await axios.post("/api/openai", { prompt });

      if (response.status === 200) {
        setTextResponse(response.data.result);

        // Step 2: Request audio data from OpenAI TTS using Axios
        const audioResponse = await axios.post(
          "/api/openaiaudio",
          { prompt: response.data.result },
          { responseType: "arraybuffer" } // Ensure response is handled as an array buffer
        );

        if (audioResponse.status === 200) {
          // Convert arraybuffer to blob
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

  return (
    <div>
      <h1>OpenAI Text-to-Speech Example</h1>
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
      <audio ref={audioElement} src={audioSrc} controls />
    </div>
  );
};
