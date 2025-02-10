import { NextResponse } from "next/server";
import { Client } from "@gradio/client";

export async function POST(request: Request) {
  try {
    const { text, voice, rate = 0, pitch = 0 } = await request.json();

    if (!text || !voice) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const app = await Client.connect("https://critical-hf-cpu-tts.hf.space");
    const prediction = await app.predict("/predict", {
      text,
      voice,
      rate,
      pitch,
    });

    // @ts-ignore
    return NextResponse.json({ audioUrl: prediction.data[0].url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      // @ts-ignore
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
