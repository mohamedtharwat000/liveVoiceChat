import { useState, useCallback, useEffect, useRef } from "react";
import { useMicVAD } from "@/hooks/useMic";
import { handleAsyncFn, sttPrediction, ttsPrediction } from "@/lib/utils";
import SettingsSheet from "@/components/SettingsSheet";
import Caption from "@/components/Caption";
import MainButton from "@/components/MainButton";
import Feedback from "@/components/Feedback";
import WaveSurfer from "wavesurfer.js";
import { useWavesurfer } from "@/hooks/useWaveSurfer";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";

export default function Microphone() {
  const [wavsurferRecorder, setWavesurferRecorder] =
    useState<RecordPlugin | null>(null);
  const [audioMode, setAudioMode] = useState<"input" | "output">("input");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isAppListening, setIsAppListening] = useState(false);
  const [isHandleAudio, setIsHandleAudio] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [positiveSpeechThreshold, setPositiveSpeechThreshold] = useState(0.5);
  const [negativeSpeechThreshold, setNegativeSpeechThreshold] = useState(0.35);
  const [redemptionFrames, setRedemptionFrames] = useState(8);
  const [frameSamples, setFrameSamples] = useState(1024);
  const [preSpeechPadFrames, setPreSpeechPadFrames] = useState(1);
  const [minSpeechFrames, setMinSpeechFrames] = useState(5);
  const [speechRate, setSpeechRate] = useState(0);
  const [speechPitch, setSpeechPitch] = useState(0);
  const [chatflowId, setChatflowId] = useState<string>(
    "e89d6572-be23-4709-a1f5-ab2aaada13cd"
  );
  const [sessionID, setSessionID] = useState<string>(
    Math.random().toString(32).substring(8)
  );
  const [selectedVoice, setSelectedVoice] = useState(
    "en-US-RogerNeural - en-US (Male)"
  );

  const currentConversation = useRef<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wavesurferRef = useRef<HTMLDivElement | null>(null);
  const outputWaveRef = useRef<HTMLDivElement | null>(null);

  const record = useWavesurfer({
    containerRef: wavesurferRef,
  });

  useEffect(() => {
    if (record) {
      setWavesurferRecorder(record);
    }
  }, [record]);

  const handleResetChat = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
    }
    audioRef.current = null;
    setIsHandleAudio(false);
    setCaption(null);
    setError(null);
    setAudioMode("input");
  }, []);

  const handleAudio = useCallback(
    async (audioData: Float32Array) => {
      const conversationId = currentConversation.current + 1;
      currentConversation.current = conversationId;

      handleResetChat();

      setIsHandleAudio(true);

      if (conversationId !== currentConversation.current) return;
      const [textResponse, textError] = await handleAsyncFn(() =>
        sttPrediction(chatflowId, sessionID, audioData)
      );

      if (textError || !textResponse) {
        if (textError?.message) setError(textError?.message);
      }

      if (conversationId !== currentConversation.current) return;
      const [ttsResponse, ttsError] = await handleAsyncFn(() =>
        ttsPrediction(textResponse!, selectedVoice, speechRate, speechPitch)
      );

      if (ttsError || !ttsResponse) {
        if (ttsError?.message) setError(ttsError?.message);
      }

      if (conversationId !== currentConversation.current) return;

      audioRef.current = ttsResponse;

      setCaption(textResponse);

      if (ttsResponse) setAudioUrl(ttsResponse.src);

      setAudioMode("output");

      setIsHandleAudio(false);
    },
    [
      handleResetChat,
      chatflowId,
      sessionID,
      selectedVoice,
      speechRate,
      speechPitch,
    ]
  );

  useEffect(() => {
    if (audioMode === "output" && outputWaveRef.current && audioUrl) {
      const wsOutput = WaveSurfer.create({
        container: outputWaveRef.current,
        waveColor: "#A8DADC",
        progressColor: "#1D3557",
        backend: "MediaElement",
      });

      wsOutput.load(audioUrl);
      wsOutput.on("ready", () => {
        wsOutput.play();
      });
      wsOutput.on("finish", handleResetChat);

      return () => {
        wsOutput.destroy();
      };
    }
  }, [audioMode, audioUrl, handleResetChat]);

  useEffect(() => {
    if (audioRef.current && caption) {
      audioRef.current.onended = handleResetChat;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [caption, handleResetChat]);

  const vad = useMicVAD({
    onSpeechEnd: handleAudio,
    positiveSpeechThreshold,
    negativeSpeechThreshold,
    redemptionFrames,
    frameSamples,
    preSpeechPadFrames,
    minSpeechFrames,
  });

  useEffect(() => {
    if (vad) {
      setIsAppReady(true);
    }
  }, [vad]);

  const handleResetDefaults = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
      audioRef.current = null;
    }
    setCaption(null);
    setError(null);
    setSelectedVoice("en-US-RogerNeural - en-US (Male)");
    setChatflowId("e89d6572-be23-4709-a1f5-ab2aaada13cd");
    setSessionID(Math.random().toString(32).substring(8));
    setSpeechRate(0);
    setSpeechPitch(0);
    setPositiveSpeechThreshold(0.5);
    setNegativeSpeechThreshold(0.35);
    setRedemptionFrames(8);
    setFrameSamples(1024);
    setPreSpeechPadFrames(1);
    setMinSpeechFrames(5);
  }, [
    setCaption,
    setError,
    setSelectedVoice,
    setChatflowId,
    setSessionID,
    setSpeechRate,
    setSpeechPitch,
    setPositiveSpeechThreshold,
    setNegativeSpeechThreshold,
    setRedemptionFrames,
    setFrameSamples,
    setPreSpeechPadFrames,
    setMinSpeechFrames,
  ]);

  const handleNewChat = useCallback(() => {
    setSessionID(Math.random().toString(32).substring(8));
    handleResetChat();
  }, [handleResetChat]);

  const handleMainButtonClick = useCallback(() => {
    handleResetChat();

    // @ts-ignore
    if (vad && vad.listening) {
      vad.pause();
      setIsAppListening(false);
      if (wavsurferRecorder) wavsurferRecorder.stopRecording();
    } else if (vad) {
      vad.start();
      setIsAppListening(true);
      if (wavsurferRecorder) wavsurferRecorder.startRecording();
    }
  }, [handleResetChat, vad, wavsurferRecorder]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between">
      <SettingsSheet
        chatflowId={chatflowId}
        setChatflowId={setChatflowId}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        speechRate={speechRate}
        setSpeechRate={setSpeechRate}
        speechPitch={speechPitch}
        setSpeechPitch={setSpeechPitch}
        positiveSpeechThreshold={positiveSpeechThreshold}
        setPositiveSpeechThreshold={setPositiveSpeechThreshold}
        negativeSpeechThreshold={negativeSpeechThreshold}
        setNegativeSpeechThreshold={setNegativeSpeechThreshold}
        redemptionFrames={redemptionFrames}
        setRedemptionFrames={setRedemptionFrames}
        frameSamples={frameSamples}
        setFrameSamples={setFrameSamples}
        preSpeechPadFrames={preSpeechPadFrames}
        setPreSpeechPadFrames={setPreSpeechPadFrames}
        minSpeechFrames={minSpeechFrames}
        setMinSpeechFrames={setMinSpeechFrames}
        onNewChat={handleNewChat}
        onResetDefaults={handleResetDefaults}
      />

      <div
        ref={audioMode === "output" ? outputWaveRef : wavesurferRef}
        className="w-full h-24 mb-auto"
      />

      <div className="flex flex-col justify-center items-center">
        <Caption text={caption} />

        <MainButton
          isAppReady={isAppReady}
          listening={isAppListening}
          isLoading={isHandleAudio}
          chatflowId={chatflowId}
          onClick={handleMainButtonClick}
        />

        <Feedback chatflowId={chatflowId} error={error} />
      </div>
    </div>
  );
}
