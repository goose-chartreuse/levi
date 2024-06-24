import { NextResponse } from "next/server";
import axios from "axios";

const OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req) {
  const { prompt } = await req.json();

  try {
    // Generate audio from text using TTS endpoint
    const audioResponse = await axios.post(
      OPENAI_TTS_URL,
      {
        model: "tts-1",
        voice: "shimmer", // Change voice as needed
        input: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer", // Ensure response is handled as an array buffer
      }
    );

    return new NextResponse(audioResponse.data, {
      headers: {
        "Content-Type": "audio/mp3",
        "Content-Length": audioResponse.data.byteLength,
      },
    });
  } catch (error) {
    console.error("Error generating audio from OpenAI:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate audio from OpenAI" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
