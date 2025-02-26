import { CogIcon, PlusIcon, MenuIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface SettingsSheetProps {
  chatflowId: string;
  setChatflowId: React.Dispatch<React.SetStateAction<string>>;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: React.Dispatch<
    React.SetStateAction<SpeechSynthesisVoice | null>
  >;
  positiveSpeechThreshold: number;
  setPositiveSpeechThreshold: React.Dispatch<React.SetStateAction<number>>;
  negativeSpeechThreshold: number;
  setNegativeSpeechThreshold: React.Dispatch<React.SetStateAction<number>>;
  redemptionFrames: number;
  setRedemptionFrames: React.Dispatch<React.SetStateAction<number>>;
  frameSamples: number;
  setFrameSamples: React.Dispatch<React.SetStateAction<number>>;
  preSpeechPadFrames: number;
  setPreSpeechPadFrames: React.Dispatch<React.SetStateAction<number>>;
  minSpeechFrames: number;
  setMinSpeechFrames: React.Dispatch<React.SetStateAction<number>>;
  onNewChat: () => void;
  onResetDefaults: () => void;
}

export default function SettingsSheet({
  chatflowId,
  setChatflowId,
  availableVoices,
  selectedVoice,
  setSelectedVoice,
  positiveSpeechThreshold,
  setPositiveSpeechThreshold,
  negativeSpeechThreshold,
  setNegativeSpeechThreshold,
  redemptionFrames,
  setRedemptionFrames,
  frameSamples,
  setFrameSamples,
  preSpeechPadFrames,
  setPreSpeechPadFrames,
  minSpeechFrames,
  setMinSpeechFrames,
  onNewChat,
  onResetDefaults,
}: SettingsSheetProps) {
  const renderSlider = (
    label: string,
    value: number,
    setValue: (value: number) => void,
    min: number,
    max: number,
    step: number
  ) => (
    <div className="mb-4">
      <label className="block mb-1 font-medium">
        {label} ({value})
      </label>
      <Slider
        value={[value]}
        onValueChange={(v) => setValue(v[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="flex items-center justify-between p-4">
      {/* Settings Title and Icon */}
      <div className="flex items-center space-x-2">
        <CogIcon className="h-5 w-5" />
        <span className="text-lg font-semibold">Settings</span>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="hidden" />
            <SheetDescription className="hidden" />
            <div className="flex flex-col space-y-4">
              {/* Settings Title with Action Icons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CogIcon className="h-5 w-5" />
                  <span className="text-lg font-semibold">Settings</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={onResetDefaults}
                    variant="ghost"
                    size="sm"
                    title="Reset Defaults"
                  >
                    <RotateCcwIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={onNewChat}
                    variant="ghost"
                    size="sm"
                    title="New Chat"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Chatflow ID & Voice Selection */}
              <div>
                <label className="block mb-1 font-medium">Chatflow ID</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatflowId}
                    onChange={(e) => setChatflowId(e.target.value)}
                    className="w-full border rounded p-2 bg-gray-700 text-white"
                    placeholder="Enter Chatflow ID"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Voice</label>
                <Select
                  value={selectedVoice?.name || ""}
                  onValueChange={(voiceName) => {
                    const voice = availableVoices.find(
                      (v) => v.name === voiceName
                    );
                    if (voice) setSelectedVoice(voice);
                  }}
                >
                  <SelectTrigger className="w-full border rounded p-2 bg-gray-700 text-white">
                    <SelectValue placeholder="Select a voice">
                      {selectedVoice?.name || "Select a voice"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {`${voice.name} (${voice.lang})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Input Settings */}
              <div>
                <h3 className="font-medium mb-2">Voice Input Settings</h3>
                {renderSlider(
                  "Positive Speech Threshold",
                  positiveSpeechThreshold,
                  setPositiveSpeechThreshold,
                  0.1,
                  1,
                  0.01
                )}
                {renderSlider(
                  "Negative Speech Threshold",
                  negativeSpeechThreshold,
                  setNegativeSpeechThreshold,
                  0,
                  1,
                  0.01
                )}
                {renderSlider(
                  "Redemption Frames",
                  redemptionFrames,
                  setRedemptionFrames,
                  1,
                  20,
                  1
                )}
                {renderSlider(
                  "Frame Samples",
                  frameSamples,
                  setFrameSamples,
                  512,
                  2048,
                  1
                )}
                {renderSlider(
                  "Pre Speech Pad Frames",
                  preSpeechPadFrames,
                  setPreSpeechPadFrames,
                  0,
                  10,
                  1
                )}
                {renderSlider(
                  "Minimum Speech Frames",
                  minSpeechFrames,
                  setMinSpeechFrames,
                  1,
                  10,
                  1
                )}
              </div>
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
