import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDevUser } from "@/hooks/useDevUser";

interface AuthGateProps {
  children: ReactNode;
}

const AuthGate = ({ children }: AuthGateProps) => {
  const { user, loading } = useAuth();
  const devUser = useDevUser();
  const [isDevBypass, setIsDevBypass] = useState(false);

  useEffect(() => {
    // Check for development mode bypass
    const checkDevMode = async () => {
      try {
        // Check if we're in development mode
        const devModeEnabled = localStorage.getItem('devModeEnabled') === 'true';
        setIsDevBypass(devModeEnabled && !!devUser);
      } catch (error) {
        console.error("Error checking dev mode:", error);
      }
    };
    
    checkDevMode();
  }, [devUser]);

  // While checking auth status, show loading state
  if (loading && !isDevBypass) return null;

  // Allow access if authenticated user or in dev bypass mode
  if (user || isDevBypass) return <>{children}</>;
  
  // Otherwise redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default AuthGate;
