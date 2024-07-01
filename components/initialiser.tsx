"use client";
import { useState } from "react";
import { useSpeechRecognition, useAudioAutoPlay } from "@/hooks";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: textInput }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      setTextResponse("");
      let receivedText = "";
      let partialChunk = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value);
        partialChunk += textChunk;

        const messages = partialChunk.split("\n\n");

        // Process all complete messages except the last one
        for (let i = 0; i < messages.length - 1; i++) {
          const message = messages[i];
          if (message.startsWith("data: ")) {
            const jsonData = message.substring(6);

            if (jsonData !== "[DONE]") {
              try {
                const parsed = JSON.parse(jsonData);
                const content = parsed.choices[0]?.delta?.content || "";
                receivedText += content;
                setTextResponse((prev) => prev + content);
              } catch (e) {
                console.error("Failed to parse JSON:", e);
              }
            } else {
              console.log("Streaming complete.");
            }
          }
        }

        // Keep the last partial chunk for the next loop iteration
        partialChunk = messages[messages.length - 1];
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const EnhancedExampleComponent = ({ markdownText }) => {
    return (
      <div className="markdown-container">
        <ReactMarkdown
          components={{
            code: (props) => {
              console.log(props);

              return (
                <SyntaxHighlighter
                  language={props.lang}
                  style={atomDark}
                  customStyle={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    backgroundColor: "#f0f0f0",
                    padding: "10px",
                    borderRadius: "4px",
                    overflowX: "auto",
                  }}
                >
                  {props.children}
                </SyntaxHighlighter>
              );
            },
          }}
          className="code-container"
        >
          {markdownText}
        </ReactMarkdown>
      </div>
    );
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
        <EnhancedExampleComponent markdownText={textResponse} />
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
