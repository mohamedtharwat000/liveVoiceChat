import { CogIcon, PlusIcon, MenuIcon } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SettingsSheetProps {
  chatflowId: string;
  setChatflowId: React.Dispatch<React.SetStateAction<string>>;
  selectedVoice: string;
  setSelectedVoice: React.Dispatch<React.SetStateAction<string>>;
  speechRate: number;
  setSpeechRate: React.Dispatch<React.SetStateAction<number>>;
  speechPitch: number;
  setSpeechPitch: React.Dispatch<React.SetStateAction<number>>;
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
  selectedVoice,
  setSelectedVoice,
  speechRate,
  setSpeechRate,
  speechPitch,
  setSpeechPitch,
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
              {/* Settings Title with Buttons Below */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <CogIcon className="h-5 w-5" />
                  <span className="text-lg font-semibold">Settings</span>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={onResetDefaults} variant="outline">
                    Reset Defaults
                  </Button>
                  <Button onClick={onNewChat}>
                    <PlusIcon className="h-5 w-5 mr-1" /> New Chat
                  </Button>
                </div>
              </div>

              {/* Chatflow ID & Voice Selection */}
              <div>
                <label className="block mb-1 font-medium">Chatflow ID</label>
                <input
                  type="text"
                  value={chatflowId}
                  onChange={(e) => setChatflowId(e.target.value)}
                  className="w-full border rounded p-2 bg-gray-700 text-white"
                  placeholder="Enter Chatflow ID"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Voice</label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-full border rounded p-2 bg-gray-700 text-white">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "en-US-AndrewMultilingualNeural - en-US (Male)",
                      "en-US-BrianNeural - en-US (Male)",
                      "en-US-RogerNeural - en-US (Male)",
                      "en-US-MichelleNeural - en-US (Female)",
                      "en-US-GuyNeural - en-US (Male)",
                      "en-US-BrianMultilingualNeural - en-US (Male)",
                      "en-US-SteffanNeural - en-US (Male)",
                      "en-US-AvaNeural - en-US (Female)",
                      "en-US-EmmaNeural - en-US (Female)",
                      "en-US-EmmaMultilingualNeural - en-US (Female)",
                      "en-US-AriaNeural - en-US (Female)",
                      "en-US-AndrewNeural - en-US (Male)",
                      "en-US-AnaNeural - en-US (Female)",
                      "en-US-ChristopherNeural - en-US (Male)",
                      "en-US-JennyNeural - en-US (Female)",
                      "en-US-EricNeural - en-US (Male)",
                      "en-US-AvaMultilingualNeural - en-US (Female)",
                    ].map((voice) => (
                      <SelectItem key={voice} value={voice}>
                        {voice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tabs for Voice Input & Output Sliders */}
              <Tabs defaultValue="input">
                <TabsList className="w-full flex justify-around">
                  <TabsTrigger value="input">Voice Input</TabsTrigger>
                  <TabsTrigger value="output">Voice Output</TabsTrigger>
                </TabsList>

                {/* Voice Input Sliders */}
                <TabsContent value="input">
                  <SliderGroup
                    label="Positive Speech Threshold"
                    value={positiveSpeechThreshold}
                    setValue={setPositiveSpeechThreshold}
                    min={0.1}
                    max={1}
                    step={0.01}
                  />
                  <SliderGroup
                    label="Negative Speech Threshold"
                    value={negativeSpeechThreshold}
                    setValue={setNegativeSpeechThreshold}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                  <SliderGroup
                    label="Redemption Frames"
                    value={redemptionFrames}
                    setValue={setRedemptionFrames}
                    min={1}
                    max={20}
                    step={1}
                  />
                  <SliderGroup
                    label="Frame Samples"
                    value={frameSamples}
                    setValue={setFrameSamples}
                    min={512}
                    max={2048}
                    step={1}
                  />
                  <SliderGroup
                    label="Pre Speech Pad Frames"
                    value={preSpeechPadFrames}
                    setValue={setPreSpeechPadFrames}
                    min={0}
                    max={10}
                    step={1}
                  />
                  <SliderGroup
                    label="Minimum Speech Frames"
                    value={minSpeechFrames}
                    setValue={setMinSpeechFrames}
                    min={1}
                    max={10}
                    step={1}
                  />
                </TabsContent>

                {/* Voice Output Sliders */}
                <TabsContent value="output">
                  <SliderGroup
                    label="Speech Rate (%)"
                    value={speechRate}
                    setValue={setSpeechRate}
                    min={-50}
                    max={50}
                    step={1}
                  />
                  <SliderGroup
                    label="Speech Pitch (Hz)"
                    value={speechPitch}
                    setValue={setSpeechPitch}
                    min={-20}
                    max={20}
                    step={1}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SliderGroup({
  label,
  value,
  setValue,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
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
}
