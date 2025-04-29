import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithProvider } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [devMode, setDevMode] = useState(false);
  
  // Check if dev mode is enabled
  useEffect(() => {
    const isDevMode = localStorage.getItem('devModeEnabled') === 'true';
    setDevMode(isDevMode);
  }, []);
  
  const toggleDevMode = () => {
    const newMode = !devMode;
    localStorage.setItem('devModeEnabled', newMode.toString());
    setDevMode(newMode);
    
    toast({
      title: newMode ? "Dev Mode Enabled" : "Dev Mode Disabled",
      description: newMode 
        ? "You can now access protected routes without authentication." 
        : "Authentication is now required for protected routes.",
      duration: 3000
    });
    
    // If enabling dev mode, redirect to dashboard
    if (newMode) {
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error("Authentication error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Dev Mode Button - Very Prominent */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={toggleDevMode}
            className={`px-6 py-3 text-base font-medium rounded-lg shadow-lg border-2 transition-all w-full ${
              devMode 
                ? "bg-green-500 text-white border-green-600 hover:bg-green-600" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {devMode ? "🔓 Dev Mode: ON (Click to Dashboard)" : "🔒 Dev Mode: OFF (Enable to Skip Login)"}
          </button>
        </div>
        
        {/* Regular authentication form */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Welcome to FitFlow AI</h1>
            <p className="text-gray-600">Sign in or create an account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button
                type="button"
                onClick={() => signInWithProvider("google")}
                className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
              >
                Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
