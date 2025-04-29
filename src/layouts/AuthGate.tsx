
import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGateProps {
  children: ReactNode;
}

const AuthGate = ({ children }: AuthGateProps) => {
  const { user, loading } = useAuth();
  const [isDevBypass, setIsDevBypass] = useState(false);

  useEffect(() => {
    // Check for development mode bypass
    const checkDevMode = async () => {
      try {
        // Check if we're in development mode
        if (import.meta.env.DEV) {
          // You could toggle this with localStorage to enable/disable dev mode
          const devModeEnabled = localStorage.getItem('devModeEnabled') === 'true';
          setIsDevBypass(devModeEnabled);
        }
      } catch (error) {
        console.error("Error checking dev mode:", error);
      }
    };
    
    checkDevMode();
  }, []);

  // While checking auth status, show loading state
  if (loading && !isDevBypass) return null;

  // Allow access if authenticated user or in dev bypass mode
  if (user || isDevBypass) return <>{children}</>;
  
  // Otherwise redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default AuthGate;
