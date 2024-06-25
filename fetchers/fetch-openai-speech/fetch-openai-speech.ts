import axios from "axios";

export const fetchOpenaiSpeech = async (textInput: string) => {
  try {
    const audioResponse = await axios.post(
      "/api/openaiaudio",
      { prompt: textInput },
      { responseType: "arraybuffer" }
    );

    return audioResponse;
  } catch (error) {
    console.error(`fetchOpenaiSpeech failed. Error:`, error);
  }
};
