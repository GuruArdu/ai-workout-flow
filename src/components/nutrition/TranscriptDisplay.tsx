
interface TranscriptDisplayProps {
  transcript: string;
}

export const TranscriptDisplay = ({ transcript }: TranscriptDisplayProps) => {
  if (!transcript) return null;
  
  return (
    <div className="fixed bottom-36 md:bottom-28 right-8 max-w-xs bg-white p-4 rounded-lg shadow-lg border">
      <p className="font-medium">Transcript:</p>
      <p className="text-sm text-gray-600">{transcript}</p>
    </div>
  );
};
