import { Mic, StopCircle } from "lucide-react";

interface MainButtonProps {
  isLoading: boolean;
  listening: boolean;
  chatflowId: string;
  isAppReady: boolean;
  onClick: () => void;
}

export default function MainButton({
  isLoading,
  listening,
  chatflowId,
  isAppReady,
  onClick,
}: MainButtonProps) {
  return (
    <div className="relative flex flex-col justify-end items-center pb-16">
      <button
        onClick={onClick}
        disabled={!chatflowId || !isAppReady}
        className={`relative z-10 flex justify-center items-center w-24 h-24 rounded-full focus:outline-none transition-all duration-900 border ${
          !chatflowId || !isAppReady
            ? "cursor-not-allowed opacity-50"
            : isLoading
            ? "cursor-pointer border-orange-400 border-4 animate-pulse"
            : listening
            ? "cursor-pointer border-red-400 border-4 animate-pulse"
            : "cursor-pointer hover:shadow-lg"
        }`}
      >
        {isLoading ? (
          <StopCircle
            size={64}
            className="animate-spin text-orange-400 drop-shadow-lg"
            style={{ animationDuration: "1s" }}
          />
        ) : listening ? (
          <StopCircle
            size={64}
            className="h-12 w-12 fill-red-400 drop-shadow-lg"
          />
        ) : (
          <Mic
            size={64}
            className={`${
              !chatflowId ? "opacity-50" : "bg-transparent drop-shadow-lg"
            }`}
          />
        )}
      </button>
    </div>
  );
}
