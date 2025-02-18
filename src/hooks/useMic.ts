import { useState, useEffect, useCallback } from "react";
import { MicVAD, RealTimeVADOptions } from "@ricky0123/vad-web";

export function useMicVAD(options: Partial<RealTimeVADOptions>) {
  const [vad, setVad] = useState<MicVAD | null>(null);

  const initVAD = useCallback(async () => {
    return MicVAD.new({
      ...options,
      onSpeechEnd: (audio: Float32Array) => {
        if (options.onSpeechEnd) options.onSpeechEnd(audio);
      },
    });
  }, [options]);

  useEffect(() => {
    if (!vad) {
      initVAD().then((vad) => {
        setVad(vad);
      });
    }
  }, [initVAD, vad]);

  return vad;
}
