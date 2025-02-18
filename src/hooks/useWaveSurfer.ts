import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

interface UseWaveSurferOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  active: boolean;
}

export function useWaveSurfer({ containerRef, active }: UseWaveSurferOptions) {
  const wsRef = useRef<WaveSurfer | null>(null);
  const recordRef = useRef<ReturnType<typeof RecordPlugin.create> | null>(null);

  useEffect(() => {
    if (!containerRef || !containerRef.current) return;

    if (!active && wsRef.current) {
      wsRef.current.destroy();
      wsRef.current = null;
      recordRef.current = null;
    }

    if (active) {
      if (!wsRef.current) {
        wsRef.current = WaveSurfer.create({
          container: containerRef.current,
          waveColor: "#A8DADC",
          progressColor: "#1D3557",
        });

        recordRef.current = wsRef.current.registerPlugin(
          RecordPlugin.create({
            renderRecordedAudio: false,
            scrollingWaveform: false,
            continuousWaveform: true,
            continuousWaveformDuration: 30,
          })
        );
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.destroy();
        wsRef.current = null;
        recordRef.current = null;
      }
    };
  }, [active, containerRef]);

  return { wavesurfer: wsRef.current, record: recordRef.current };
}
