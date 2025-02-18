import { useState, useEffect, useRef } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import WavesurferPlayer from "@wavesurfer/react";

export default function Wavesurfer() {
  const containerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");

  const { wavesurfer } = useWavesurfer({
    container: containerRef,
    waveColor: "rgb(200, 0, 200)",
    progressColor: "rgb(100, 0, 100)",
    height: 100,
    plugins: [
      {
        plugin: RecordPlugin,
        options: {
          renderRecordedAudio: false,
          scrollingWaveform: false,
          continuousWaveform: true,
          continuousWaveformDuration: 30,
        },
      },
    ],
  });

  // Setup event listeners and fetch available audio devices.
  useEffect(() => {
    if (wavesurfer) {
      // Get available microphones.
      RecordPlugin.getAvailableAudioDevices().then((deviceList) => {
        setDevices(deviceList);
        if (deviceList.length > 0) {
          setSelectedDevice(deviceList[0].deviceId);
        }
      });
      const recordPlugin = wavesurfer.getActivePlugin("record");
      if (recordPlugin) {
        recordPlugin.on("record-end", (blob) => {
          const url = URL.createObjectURL(blob);
          setRecordedUrl(url);
          setIsRecording(false);
        });
        recordPlugin.on("record-progress", (time) => {
          setProgress(time);
        });
      }
    }
    return () => {
      if (wavesurfer) {
        const recordPlugin = wavesurfer.getActivePlugin("record");
        if (recordPlugin) {
          recordPlugin.un("record-end");
          recordPlugin.un("record-progress");
        }
      }
    };
  }, [wavesurfer]);

  // Toggle recording on/off.
  const handleRecordToggle = () => {
    if (!wavesurfer) return;
    const recordPlugin = wavesurfer.getActivePlugin("record");
    if (!isRecording) {
      recordPlugin
        .startRecording({ deviceId: selectedDevice })
        .then(() => {
          setIsRecording(true);
        })
        .catch((err) => {
          console.error("Error starting recording:", err);
        });
    } else {
      recordPlugin.stopRecording();
      setIsRecording(false);
    }
  };

  // Toggle pause/resume while recording.
  const handlePauseToggle = () => {
    if (!wavesurfer) return;
    const recordPlugin = wavesurfer.getActivePlugin("record");
    if (isPaused) {
      recordPlugin.resumeRecording();
      setIsPaused(false);
    } else {
      recordPlugin.pauseRecording();
      setIsPaused(true);
    }
  };

  // Handle mic device change.
  const handleDeviceChange = (e) => {
    setSelectedDevice(e.target.value);
  };

  // Utility: Format progress time (ms) as mm:ss.
  const formatTime = (timeMs) => {
    const minutes = Math.floor((timeMs % 3600000) / 60000)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor((timeMs % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="p-4 bg-gray-800 rounded mb-4 w-full max-w-xl">
      <h2 className="text-xl mb-2">Recording</h2>
      {/* Wavesurfer container for live recording waveform */}
      <div ref={containerRef} className="mb-2 border border-gray-600 rounded" />

      {/* Control buttons and mic selection */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <button
          onClick={handleRecordToggle}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          {isRecording ? "Stop" : "Record"}
        </button>
        {isRecording && (
          <button
            onClick={handlePauseToggle}
            className="px-4 py-2 bg-yellow-600 rounded"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        )}
        <select
          value={selectedDevice}
          onChange={handleDeviceChange}
          className="bg-gray-700 rounded p-1"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || device.deviceId}
            </option>
          ))}
        </select>
      </div>

      {/* Display recording progress */}
      <div className="mb-2">
        <span>Recording Time: {formatTime(progress)}</span>
      </div>

      {/* Playback section after recording completes */}
      {recordedUrl && (
        <div className="mt-4">
          <h3 className="text-lg mb-2">Recorded Audio</h3>
          <WavesurferPlayer
            height={100}
            waveColor="rgb(200, 100, 0)"
            progressColor="rgb(100, 50, 0)"
            url={recordedUrl}
            onReady={(ws) => {}}
            onPlay={() => {}}
            onPause={() => {}}
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => {
                // Optionally add additional control logic if needed.
              }}
              className="px-4 py-2 bg-green-600 rounded"
            >
              Play/Pause
            </button>
            <a
              href={recordedUrl}
              download="recording.webm"
              className="px-4 py-2 bg-indigo-600 rounded"
            >
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
