"use client";

import { useState } from "react";

import { useSpeechRecognition, useAudioAutoPlay } from "@/hooks";
import { fetchOpenai, fetchOpenaiSpeech } from "@/fetchers";
import {Button} from '@/components'

import { Textarea, Box, Flex } from '@chakra-ui/react'

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
    <Flex flexDir='column' gap="12px">
      <Flex gap='12px'>
        <Button onClick={handleStartListening} disabled={isListening}>
          Enable Speech-to-Text
        </Button>
        <Button onClick={handleStopListening} disabled={!isListening}>
          Disable Speech-to-Text
        </Button>
      </Flex>
      <form onSubmit={handleSubmit}>
        <Flex flexDir="column" gap="12px">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}  
        />
        <Button type="submit">Generate Response</Button>
        </Flex>
      </form>
      <Flex flexDir="column" gap="12px">
        <h2>Text Response:</h2>
        <Box padding='12px' backgroundColor="#333" borderRadius="4px">{textResponse}</Box>
      </Flex>
      <audio
        style={{display: 'none'}}
        ref={audioRef}
        onPlay={() => stopRecognition()}
        onEnded={() => startRecognition()}
        src={audioSrc}
        controls
      />
    </Flex>
  );
};
