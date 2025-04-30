
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "./VoiceInput";
import { SpeechSupportWarning } from "./SpeechSupportWarning";
import { TranscriptDisplay } from "./TranscriptDisplay";

interface ActionButtonsProps {
  userId: string | undefined;
  isSpeechSupported: boolean;
  onOpenModal: () => void;
  onFoodLogged: () => void;
  transcript: string;
  onTranscriptChange: (transcript: string) => void;
}

export const ActionButtons = ({ 
  userId, 
  isSpeechSupported, 
  onOpenModal, 
  onFoodLogged,
  transcript,
  onTranscriptChange 
}: ActionButtonsProps) => {
  return (
    <>
      <div className="fixed bottom-20 md:bottom-8 right-8 flex flex-col gap-2">
        {!isSpeechSupported ? (
          <SpeechSupportWarning />
        ) : (
          <VoiceInput 
            userId={userId} 
            onTranscriptChange={onTranscriptChange}
            onFoodLogged={onFoodLogged}
            isSpeechSupported={isSpeechSupported}
          />
        )}
        
        <Button 
          size="lg" 
          className="rounded-full w-14 h-14 p-0 shadow-lg"
          onClick={onOpenModal}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      
      <TranscriptDisplay transcript={transcript} />
    </>
  );
};
