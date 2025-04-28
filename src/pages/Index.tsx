
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dumbbell, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-6 md:p-12 flex flex-col justify-center">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Dumbbell className="h-8 w-8" />
            <h1 className="text-3xl font-bold">FitFlow AI</h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Personal AI Fitness Coach</h2>
          <p className="text-lg md:text-xl mb-8">
            Get personalized workout plans based on your goals, track your progress, 
            and achieve results faster with AI-powered guidance.
          </p>
          <div className="space-y-4">
            <p className="font-medium">✓ Smart workout recommendations</p>
            <p className="font-medium">✓ Progress tracking and analytics</p>
            <p className="font-medium">✓ Personalized fitness journey</p>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="flex-1 bg-white p-6 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Get Started</h2>
          <div className="space-y-4">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/auth")}
            >
              Sign In or Create Account
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
