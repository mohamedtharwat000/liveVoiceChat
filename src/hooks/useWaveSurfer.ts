import React, { useState, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

interface UseWavesurferOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useWavesurfer({ containerRef }: UseWavesurferOptions) {
  const [record, setRecord] = useState<ReturnType<
    typeof RecordPlugin.create
  > | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#A8DADC",
      progressColor: "#1D3557",
    });

    const recPlugin = RecordPlugin.create({
      renderRecordedAudio: false,
      continuousWaveform: false,
      scrollingWaveform: false,
    });

    ws.registerPlugin(recPlugin);

    setRecord(recPlugin);

    return () => {
      record?.stopRecording();
    };
  }, [containerRef]);

  return record;
}
