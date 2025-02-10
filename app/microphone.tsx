"use client";

import { useState, useRef } from "react";
import Recording from "./recording.svg";
import Siriwave from "react-siriwave";
import { AudioRecorder } from "./recording";

export default function Microphone() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioRecorder = useRef<AudioRecorder>(new AudioRecorder());

  const startRecording = async () => {
    try {
      setError(null);
      setIsRecording(true);
      await audioRecorder.current.startRecording();
    } catch (err) {
      setError((err as Error).message);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      const audioBlob = await audioRecorder.current.stopRecording();

      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const payload = {
          question: "",
          uploads: [
            {
              data: base64Audio,
              type: "audio",
              name: "audio.webm",
              mime: "audio/webm",
            },
          ],
        };

        setLoading(true);

        try {
          const response = await fetch(
            "https://llminabox.criticalfutureglobal.com/api/v1/prediction/0f6e4479-ba3d-4a34-b0cb-be96f269a24c",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );

          const chatCompletion = await response.json();
          setCaption(chatCompletion.text);

          const ttsResponse = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: chatCompletion.text }),
          });

          const { audioUrl } = await ttsResponse.json();
          const audioElement = new Audio(audioUrl);

          setAudio(audioElement);
          audioElement.play();
        } catch (err) {
          setError("Failed to process audio: " + (err as Error).message);
        }

        setLoading(false);
      };
    } catch (err) {
      setError((err as Error).message);
      setIsRecording(false);
      setLoading(false);
    }
  };

  const handleAudioPlaying = () => {
    return (
      audio &&
      audio.currentTime > 0 &&
      !audio.paused &&
      !audio.ended &&
      audio.readyState > 2
    );
  };

  return (
    <div className="w-full relative">
      <div className="relative flex w-screen justify-center items-center max-w-screen-lg place-items-center content-center before:pointer-events-none after:pointer-events-none before:absolute before:right-0 after:right-1/4 before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <Siriwave
          theme="ios9"
          autostart={handleAudioPlaying() || isRecording}
        />
      </div>
      <div className="mt-10 flex flex-col align-middle items-center">
        <button
          className="w-24 h-24"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={isRecording ? stopRecording : undefined}
          disabled={isLoading}
        >
          <Recording
            width="96"
            height="96"
            className={`cursor-pointer ${
              isRecording ? "fill-red-400 drop-shadow-glowRed" : "fill-gray-600"
            }`}
          />
        </button>
        {error && <div className="mt-4 p-2 text-red-500 text-sm">{error}</div>}
        {isLoading && (
          <div className="mt-4 p-2 text-blue-500">Processing audio...</div>
        )}
        <div className="mt-20 p-6 text-xl text-center">{caption}</div>
      </div>
    </div>
  );
}
