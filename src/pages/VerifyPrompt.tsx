
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const VerifyPrompt = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6">
    <MailCheck className="h-12 w-12 text-blue-600 mb-4"/>
    <h1 className="text-2xl font-semibold mb-2">Verify your email</h1>
    <p className="text-gray-600 mb-6 text-center max-w-sm">
      We've sent a confirmation link to your inbox. Click it to activate your
      account, then come back here and sign in.
    </p>
    <Button onClick={()=>location.reload()}>I'm verified – Sign In</Button>
  </div>
);

export default VerifyPrompt;
