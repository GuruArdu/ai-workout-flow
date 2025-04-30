
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VoiceInputProps {
  userId: string | undefined;
  onTranscriptChange: (transcript: string) => void;
  onFoodLogged: () => void;
  isSpeechSupported: boolean;
}

export const VoiceInput = ({ userId, onTranscriptChange, onFoodLogged, isSpeechSupported }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  
  const handleVoiceInput = async () => {
    // Check if Speech Recognition is supported
    if (!isSpeechSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please try using a different browser, like Chrome.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isListening) {
        setIsListening(false);
        return;
      }
      
      setIsListening(true);
      onTranscriptChange("");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener("stop", async () => {
        setIsListening(false);
        setIsProcessingVoice(true);
        
        try {
          // Safely access Speech Recognition API
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!SpeechRecognition) {
            throw new Error("Speech Recognition not supported");
          }
          
          const recognition = new SpeechRecognition();
          recognition.lang = 'en-US';
          
          // Create audio URL for potential playback
          const audioBlob = new Blob(audioChunks);
          
          recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            onTranscriptChange(transcript);
            
            // Process the transcript with our edge function
            if (userId) {
              const { data, error } = await supabase.functions.invoke("classify_food_recordings", {
                body: { 
                  userId: userId,
                  transcript 
                }
              });
              
              if (error) {
                toast({
                  title: "Error",
                  description: "Failed to process voice input",
                  variant: "destructive"
                });
              } else {
                toast({
                  title: "Food items logged",
                  description: `Successfully logged ${data.logged} food items`,
                });
                onFoodLogged();
              }
            }
            
            setIsProcessingVoice(false);
          };
          
          recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            toast({
              title: "Error",
              description: "Speech recognition failed. Please try again.",
              variant: "destructive"
            });
            setIsProcessingVoice(false);
          };
          
          recognition.start();
          
        } catch (error) {
          console.error("Error processing audio:", error);
          toast({
            title: "Error",
            description: "Failed to process audio. Please try again or use manual entry.",
            variant: "destructive"
          });
          setIsProcessingVoice(false);
        }
      });
      
      // Record for 5 seconds
      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        }
      }, 5000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive"
      });
      setIsListening(false);
    }
  };
  
  return (
    <Button 
      size="lg" 
      className="rounded-full w-14 h-14 p-0 shadow-lg"
      variant={isListening ? "destructive" : (isProcessingVoice ? "outline" : "default")}
      onClick={handleVoiceInput}
      disabled={isProcessingVoice || !isSpeechSupported}
    >
      {isProcessingVoice ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Mic className="h-6 w-6" />
      )}
    </Button>
  );
};
