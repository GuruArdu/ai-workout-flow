
import { AlertTriangle } from "lucide-react";

export const SpeechSupportWarning = () => {
  return (
    <div className="bg-amber-50 text-amber-800 p-2 rounded-lg text-sm max-w-xs border border-amber-200 mb-2">
      <div className="flex items-center gap-1 mb-1">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">Voice input not supported</span>
      </div>
      <p>Your browser doesn't support speech recognition.</p>
    </div>
  );
};
