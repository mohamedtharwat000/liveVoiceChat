import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Client } from "@gradio/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function handleAsyncFn<T>(
  fn: () => Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

export function float2Audio(float32Array: Float32Array): string {
  const numChannels = 1;
  const sampleRate = 16000;
  const bytesPerSample = 4;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = float32Array.length * bytesPerSample;

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");

  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 3, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);

  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const headerBytes = new Uint8Array(wavHeader);
  const dataBytes = new Uint8Array(float32Array.buffer);
  const wavBytes = new Uint8Array(headerBytes.length + dataBytes.length);
  wavBytes.set(headerBytes, 0);
  wavBytes.set(dataBytes, headerBytes.length);

  const base64 = btoa(String.fromCharCode(...wavBytes));
  return `data:audio/wav; codecs=1;base64,${base64}`;
}

export async function sttPrediction(
  chatflowId: string,
  sessionId: string,
  audio: Float32Array
): Promise<string> {
  const audioString = float2Audio(audio);

  const payload = {
    question: "",
    chatId: sessionId,
    uploads: [
      {
        data: audioString,
        type: "audio",
        name: "audio.ogg",
        mime: "audio/ogg",
      },
    ],
  };

  const [response, fetchError] = await handleAsyncFn(() =>
    fetch(
      `https://llminabox.criticalfutureglobal.com/api/v1/prediction/${chatflowId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )
  );

  if (fetchError || !response) {
    throw fetchError ?? new Error("No response received");
  }

  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`);
  }

  const [chatCompletion, jsonError] = await handleAsyncFn(() =>
    response.json()
  );

  if (jsonError || !chatCompletion) {
    throw jsonError ?? new Error("Failed to parse JSON response");
  }

  return chatCompletion.text;
}

export async function ttsPrediction(
  text: string,
  selectedVoice: string,
  speechRate: number,
  speechPitch: number
): Promise<HTMLAudioElement> {
  const [app, connectError] = await handleAsyncFn(() => {
    return Client.connect("https://critical-hf-cpu-tts.hf.space");
  });

  if (connectError || !app) throw connectError;

  const [prediction, predictError] = await handleAsyncFn(() => {
    return app.predict("/predict", {
      text,
      voice: selectedVoice,
      rate: speechRate,
      pitch: speechPitch,
    });
  });

  if (predictError || !prediction) throw predictError;

  // @ts-ignore
  const audioUrl = prediction?.data[0]?.url;

  return new Audio(audioUrl);
}
