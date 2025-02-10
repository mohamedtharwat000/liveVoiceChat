import { NextResponse } from "next/server";
import { Client } from "@gradio/client";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    const app = await Client.connect("https://critical-hf-cpu-tts.hf.space");
    const prediction = await app.predict("/predict", {
      text: text,
      voice: "en-NG-AbeoNeural - en-NG (Male)",
      rate: 0,
      pitch: 0,
    });

    // @ts-ignore
    return NextResponse.json({ audioUrl: prediction.data[0].url });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
