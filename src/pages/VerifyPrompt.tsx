
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { getVerifyRedirect } from "@/utils/getVerifyRedirect";

const VerifyPrompt = () => {
  const [resending, setResending] = useState(false);
  
  const handleResendVerification = async () => {
    const pendingEmail = localStorage.getItem("pending_signup_email");
    
    if (!pendingEmail) {
      toast({
        title: "Error",
        description: "No pending email verification found",
        variant: "destructive"
      });
      return;
    }
    
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
        options: { emailRedirectTo: getVerifyRedirect() }
      });
      
      if (error) throw error;
      
      toast({
        title: "Email sent",
        description: "A new verification email has been sent to your inbox"
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend email",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <MailCheck className="h-12 w-12 text-blue-600 mb-4"/>
      <h1 className="text-2xl font-semibold mb-2">Verify your email</h1>
      <p className="text-gray-600 mb-6 text-center max-w-sm">
        We've sent a confirmation link to your inbox. Click it to activate your
        account, then come back here and sign in.
      </p>
      <div className="space-y-2 w-full max-w-xs">
        <Button onClick={()=>location.reload()} className="w-full">
          I'm verified – Sign In
        </Button>
        <Button 
          onClick={handleResendVerification} 
          variant="outline" 
          className="w-full"
          disabled={resending}
        >
          {resending ? "Sending..." : "Resend verification email"}
        </Button>
      </div>
    </div>
  );
};

export default VerifyPrompt;
