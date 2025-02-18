import { useEffect, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

interface UseWavesurferOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useWavesurfer({ containerRef }: UseWavesurferOptions) {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [record, setRecord] = useState<RecordPlugin | null>(null);

  useEffect(() => {
    if (!containerRef || !containerRef.current) return;
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#A8DADC",
      progressColor: "#1D3557",
    });
    setWavesurfer(ws);

    return () => {
      ws.destroy();
      setWavesurfer(null);
    };
  }, [containerRef]);

  useEffect(() => {
    if (wavesurfer) {
      const rec = wavesurfer.registerPlugin(
        RecordPlugin.create({
          renderRecordedAudio: false,
          scrollingWaveform: false,
          continuousWaveform: false,
          continuousWaveformDuration: 30,
        })
      );
      setRecord(rec);

      return () => {
        rec.stopRecording();
      };
    }
  }, [wavesurfer]);

  const startRecording = useCallback(() => {
    record?.startRecording({ deviceId: "default" });
  }, [record]);

  const stopRecording = useCallback(() => {
    record?.stopRecording();
  }, [record]);

  return { wavesurfer, record, startRecording, stopRecording };
}
