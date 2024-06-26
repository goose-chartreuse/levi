import { NextResponse } from "next/server";
import https from "https";

export async function POST(req) {
  const { prompt } = await req.json();

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    };

    const options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: headers,
    };

    const requestPayload = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      stream: true,
    });

    return new Promise((resolve, reject) => {
      const apiRequest = https.request(options, (apiResponse) => {
        if (apiResponse.statusCode !== 200) {
          reject(
            new Error(
              `Request failed with status code ${apiResponse.statusCode}`
            )
          );
        }

        const headers = {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        };

        resolve(new NextResponse(apiResponse, { headers }));

        apiResponse.on("data", (chunk) => {
          const data = chunk.toString();
          const lines = data.split("\n\n");
          lines.forEach((line) => {
            if (line.startsWith("data: ")) {
              const jsonData = line.substring(6);
              if (jsonData !== "[DONE]") {
                try {
                  const parsed = JSON.parse(jsonData);
                  const content = parsed.choices[0]?.delta?.content || "";
                  console.log("Received content:", content); // Debugging
                } catch (e) {
                  console.error("Failed to parse JSON:", e);
                }
              }
            }
          });
        });

        apiResponse.on("end", () => {
          console.log("Streaming complete.");
        });

        apiResponse.on("error", (error) => {
          reject(error);
        });
      });

      apiRequest.on("error", (error) => {
        reject(error);
      });

      apiRequest.write(requestPayload);
      apiRequest.end();
    });
  } catch (error) {
    console.error("Error fetching data from OpenAI:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from OpenAI" },
      { status: 500 }
    );
  }
}
