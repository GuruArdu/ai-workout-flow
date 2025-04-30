
import { useEffect, useState } from "react";

export const useSpeechRecognition = () => {
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  
  // Check if Speech Recognition is supported
  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setIsSpeechSupported(false);
    }
  }, []);
  
  return { isSpeechSupported };
};
