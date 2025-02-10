"use client";

import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveTranscriptionEvents,
  createClient,
} from "@deepgram/sdk";
import { useState, useEffect, useCallback } from "react";
import { useQueue } from "@uidotdev/usehooks";
import Recording from "./recording.svg";
import axios from "axios";
import Siriwave from "react-siriwave";

import { Client } from "@gradio/client";

export default function Microphone() {
  const { add, remove, first, size, queue } = useQueue<any>([]);
  const [apiKey, setApiKey] = useState<CreateProjectKeyResponse | null>();
  const [connection, setConnection] = useState<LiveClient | null>();
  const [isListening, setListening] = useState(false);
  const [isLoadingKey, setLoadingKey] = useState(true);
  const [isLoading, setLoading] = useState(true);
  const [isProcessing, setProcessing] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>();
  const [userMedia, setUserMedia] = useState<MediaStream | null>();
  const [caption, setCaption] = useState<string | null>();
  const [audio, setAudio] = useState<HTMLAudioElement | null>();

  const toggleMicrophone = useCallback(async () => {
    if (microphone && userMedia) {
      setUserMedia(null);
      setMicrophone(null);

      microphone.stop();
    } else {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const microphone = new MediaRecorder(userMedia);
      microphone.start(500);

      microphone.onstart = () => {
        setMicOpen(true);
      };

      microphone.onstop = () => {
        setMicOpen(false);
      };

      microphone.ondataavailable = (e) => {
        add(e.data);
      };

      setUserMedia(userMedia);
      setMicrophone(microphone);
    }
  }, [add, microphone, userMedia]);

  useEffect(() => {
    if (!apiKey) {
      console.log("getting a new api key");
      fetch("/api/deepgram", { cache: "no-store" })
        .then((res) => res.json())
        .then((object) => {
          if (!("key" in object)) throw new Error("No api key returned");
          console.log(object);
          setApiKey(object);
          setLoadingKey(false);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey && "key" in apiKey) {
      console.log("connecting to deepgram");
      const deepgram = createClient(apiKey?.key ?? "");
      const connection = deepgram.listen.live({
        model: "nova",
        interim_results: false,
        language: "en-US",
        smart_format: true,
      });

      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log("connection established");
        setListening(true);
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log("connection closed");
        setListening(false);
        setApiKey(null);
        setConnection(null);
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const words = data.channel.alternatives[0].words;
        const caption = words
          .map((word: any) => word.punctuated_word ?? word.word)
          .join(" ");
        if (caption !== "") {
          setCaption(caption);
          if (data.is_final) {
            fetch(
              "https://llminabox.criticalfutureglobal.com/api/v1/prediction/0f6e4479-ba3d-4a34-b0cb-be96f269a24c",
              {
                method: "POST",
                body: JSON.stringify({
                  question: "who are you?",
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
              .then((response) => response.json())
              .then((chatCompletion) => {
                setCaption(chatCompletion.text);
                return Client.connect(
                  "https://critical-hf-cpu-tts.hf.space"
                ).then((app) => ({
                  app,
                  text: chatCompletion.text,
                }));
              })
              .then(({ app, text }) => {
                return app.predict("/predict", {
                  text: text,
                  voice: "en-NG-AbeoNeural - en-NG (Male)",
                  rate: 0,
                  pitch: 0,
                });
              })
              .then((prediction) => {
                fetch(prediction.data[0].url)
                  .then((response) => {
                    console.log(response);

                    const blob = new Blob([response.data], {
                      type: "audio/mp3",
                    });
                    const url = URL.createObjectURL(blob);

                    const audio = new Audio(url);
                    setAudio(audio);
                    console.log("Playing audio.");

                    audio.play();
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              });
          }
        }
      });

      setConnection(connection);
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    const processQueue = async () => {
      if (size > 0 && !isProcessing) {
        setProcessing(true);

        if (isListening) {
          const blob = first;
          connection?.send(blob);
          remove();
        }

        const waiting = setTimeout(() => {
          clearTimeout(waiting);
          setProcessing(false);
        }, 250);
      }
    };

    processQueue();
  }, [connection, queue, remove, first, size, isProcessing, isListening]);

  function handleAudio() {
    return (
      audio &&
      audio.currentTime > 0 &&
      !audio.paused &&
      !audio.ended &&
      audio.readyState > 2
    );
  }

  if (isLoadingKey)
    return (
      <span className="w-full text-center">Loading temporary API key...</span>
    );
  if (isLoading)
    return <span className="w-full text-center">Loading the app...</span>;

  return (
    <div className="w-full relative">
      <div className="relative flex w-screen flex justify-center items-center max-w-screen-lg place-items-center content-center before:pointer-events-none after:pointer-events-none before:absolute before:right-0 after:right-1/4 before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <Siriwave theme="ios9" autostart={handleAudio() || false} />
      </div>
      <div className="mt-10 flex flex-col align-middle items-center">
        <button className="w-24 h-24" onClick={() => toggleMicrophone()}>
          <Recording
            width="96"
            height="96"
            className={
              `cursor-pointer` + !!userMedia && !!microphone && micOpen
                ? "fill-red-400 drop-shadow-glowRed"
                : "fill-gray-600"
            }
          />
        </button>
        <div className="mt-20 p-6 text-xl text-center">{caption}</div>
      </div>
    </div>
  );
}
