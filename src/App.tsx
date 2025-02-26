import { useState, useCallback, useEffect, useRef } from "react";
import { useMicVAD } from "@/hooks/useMic";
import { tryCatch, sttPrediction } from "@/lib/utils";
import SettingsSheet from "@/components/SettingsSheet";
import Caption from "@/components/Caption";
import MainButton from "@/components/MainButton";
import Feedback from "@/components/Feedback";
import { useWavesurfer } from "@/hooks/useWaveSurfer";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
import EasySpeech from "easy-speech";
import { MicVAD } from "@ricky0123/vad-web";

export default function Microphone() {
  const currentConversation = useRef<number>(1);
  const wavesurferRef = useRef<HTMLDivElement | null>(null);
  const outputWaveRef = useRef<HTMLDivElement | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const chatflowIdRef = useRef<string>("e89d6572-be23-4709-a1f5-ab2aaada13cd");
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const sessionIdRef = useRef<string>(Math.random().toString(32).substring(8));

  const [audioMode, setAudioMode] = useState<"input" | "output">("input");
  const [isSTTReady, setIsSTTReady] = useState(false);
  const [isTTSReady, setIsTTSReady] = useState(false);
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
  const [micVAD, setMicVAD] = useState<MicVAD | null>(null);

  const [chatflowId, setChatflowId] = useState<string>(
    "e89d6572-be23-4709-a1f5-ab2aaada13cd"
  );

  const [sessionID, setSessionID] = useState<string>(
    Math.random().toString(32).substring(8)
  );

  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);

  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  const [wavsurferRecorder, setWavesurferRecorder] =
    useState<RecordPlugin | null>(null);

  const record = useWavesurfer({
    containerRef: wavesurferRef,
  });

  useEffect(() => {
    if (record) setWavesurferRecorder(record);
  }, [record]);

  useEffect(() => {
    chatflowIdRef.current = chatflowId;
  }, [chatflowId]);

  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
  }, [selectedVoice]);

  useEffect(() => {
    sessionIdRef.current = sessionID;
  }, [sessionID]);

  const vad = useMicVAD({
    onSpeechEnd: async (audioData: Float32Array) => {
      const conversationId = currentConversation.current + 1;
      currentConversation.current = conversationId;

      handleResetChat();

      setIsHandleAudio(true);

      if (conversationId !== currentConversation.current) return;
      const { data: textResponse, error: textError } = await tryCatch(() =>
        sttPrediction(chatflowIdRef.current, sessionIdRef.current, audioData)
      );
      if (conversationId !== currentConversation.current) return;

      if (textError || !textResponse) {
        if (textError?.message) setError(textError?.message);
        setIsHandleAudio(false);
        return;
      }

      setCaption(textResponse);

      const currentVoice = selectedVoiceRef.current;
      if (textResponse && currentVoice) {
        try {
          isSpeakingRef.current = true;
          setAudioMode("output");

          await EasySpeech.speak({
            text: textResponse,
            voice: currentVoice,
            end: () => {
              isSpeakingRef.current = false;
              setTimeout(() => {
                if (conversationId === currentConversation.current) {
                  handleResetChat();
                }
              }, 500);
            },
            error: (e) => {
              const errorMessage = e.error || "Unknown TTS error";
              setError(`Speech error: ${errorMessage}`);
              console.error("Speech error", e);
              isSpeakingRef.current = false;
            },
          });
        } catch (err) {
          const errorMessage = (err as Error).message || "Unknown error";
          setError(`TTS error: ${errorMessage}`);
          console.error("TTS error", err);
          isSpeakingRef.current = false;
          setIsHandleAudio(false);
        }
      } else {
        setIsHandleAudio(false);
      }
    },
    positiveSpeechThreshold,
    negativeSpeechThreshold,
    redemptionFrames,
    frameSamples,
    preSpeechPadFrames,
    minSpeechFrames,
  });

  useEffect(() => {
    if (vad) {
      setMicVAD(vad);
      setIsSTTReady(true);
    }

    if (EasySpeech.detect().speechSynthesis) setIsTTSReady(true);
  }, [vad]);

  useEffect(() => {
    if (isSTTReady && isTTSReady) setIsAppReady(true);
  }, [isSTTReady, isTTSReady]);

  useEffect(() => {
    (async () => {
      const { error: ttsError } = await tryCatch(() =>
        EasySpeech.init({ maxTimeout: 5000, interval: 250 })
      );

      if (ttsError) {
        setError(ttsError.message);
        return;
      }

      const voices = EasySpeech.voices();
      setAvailableVoices(voices);

      if (voices.length > 0) {
        const defaultVoice = voices.find((voice) => voice.default);

        const langVoice =
          defaultVoice ||
          voices.find((voice) => voice.lang.includes(navigator.language)) ||
          voices[0];

        setSelectedVoice(langVoice);
      }
    })();
  }, []);

  const handleResetChat = useCallback(() => {
    if (isSpeakingRef.current) {
      EasySpeech.cancel();
      isSpeakingRef.current = false;
    }

    setIsHandleAudio(false);
    setCaption(null);
    setError(null);
    setAudioMode("input");
  }, []);

  const handleNewChat = useCallback(() => {
    handleResetChat();
    const newSessionId = Math.random().toString(32).substring(8);
    setSessionID(newSessionId);
    sessionIdRef.current = newSessionId;
  }, [handleResetChat]);

  const handleResetDefaults = useCallback(() => {
    handleResetChat();

    setChatflowId("e89d6572-be23-4709-a1f5-ab2aaada13cd");
    setSessionID(Math.random().toString(32).substring(8));
    setPositiveSpeechThreshold(0.5);
    setNegativeSpeechThreshold(0.35);
    setRedemptionFrames(8);
    setFrameSamples(1024);
    setPreSpeechPadFrames(1);
    setMinSpeechFrames(5);

    if (availableVoices.length > 0) {
      const defaultVoice =
        availableVoices.find((voice) => voice.default) ||
        availableVoices.find((voice) =>
          voice.lang.includes(navigator.language)
        ) ||
        availableVoices[0];
      setSelectedVoice(defaultVoice);
    }
  }, [handleResetChat, availableVoices]);

  const handleMainButtonClick = useCallback(() => {
    // If currently processing audio, stop processing and reset
    if (isHandleAudio) {
      handleResetChat();
      currentConversation.current += 1; // Increment to cancel ongoing processes
      return;
    }

    handleResetChat();

    // @ts-ignore
    if (micVAD && micVAD.listening) {
      micVAD.pause();
      setIsAppListening(false);
      if (wavsurferRecorder) wavsurferRecorder.stopRecording();
    } else if (micVAD) {
      micVAD.start();
      setIsAppListening(true);
      if (wavsurferRecorder) wavsurferRecorder.startRecording();
    }
  }, [handleResetChat, micVAD, wavsurferRecorder, isHandleAudio]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between gap-4 p-4">
      <SettingsSheet
        chatflowId={chatflowId}
        setChatflowId={setChatflowId}
        availableVoices={availableVoices}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
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
