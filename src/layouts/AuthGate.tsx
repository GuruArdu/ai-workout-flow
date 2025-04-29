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
    const checkDevMode = () => {
      try {
        // Check if dev mode is enabled in localStorage
        const devModeEnabled = localStorage.getItem('devModeEnabled') === 'true';
        setIsDevBypass(devModeEnabled);
        
        // Add event listener to detect changes in localStorage
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === 'devModeEnabled') {
            setIsDevBypass(e.newValue === 'true');
          }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
      } catch (error) {
        console.error("Error checking dev mode:", error);
        return null;
      }
    };
    
    const cleanup = checkDevMode();
    return cleanup;
  }, []);

  // While checking auth status, show loading state
  if (loading && !isDevBypass) return null;

  // Allow access if authenticated user or in dev bypass mode
  if (user || isDevBypass) return <>{children}</>;
  
  // Otherwise redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default AuthGate;
