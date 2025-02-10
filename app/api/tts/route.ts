// app/api/tts/route.ts
import { NextResponse } from "next/server";
import { Client } from "@gradio/client";

export async function POST(request: Request) {
  try {
    // Expect a JSON body with { text: string }
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    // Instead of setCaption, capture the text locally.
    const chatText = text;

    // Connect to the Gradio app.
    const app = await Client.connect("https://critical-hf-cpu-tts.hf.space");

    // Call the predict endpoint with the provided text and voice parameters.
    const prediction = await app.predict("/predict", {
      text: chatText,
      voice: "en-NG-AbeoNeural - en-NG (Male)",
      rate: 0,
      pitch: 0,
    });

    // Get the URL from the prediction response.
    // @ts-ignore
    const predictionUrl = prediction.data[0].url;

    // Fetch the audio from the returned URL.
    const fetchResponse = await fetch(predictionUrl);
    if (!fetchResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch audio from prediction URL." },
        { status: 500 }
      );
    }

    // Retrieve the binary data.
    const arrayBuffer = await fetchResponse.arrayBuffer();

    // Convert the ArrayBuffer to a Base64 string (for easy JSON transport).
    // Node’s Buffer is available in the server environment.
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");

    // Return the caption and Base64 audio string as JSON.
    return NextResponse.json({
      caption: chatText,
      audio: base64Audio,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
