import axios from "axios";

export const fetchOpenai = async (textInput: string) => {
  try {
    const response = await axios.post(
      "/api/openai",
      { prompt: textInput },
      { responseType: "stream" }
    );

    return response;
  } catch (error) {
    console.error(`fetchOpenai failed. Error:`, error);
  }
};
