import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGateProps {
  children: ReactNode;
}

const AuthGate = ({ children }: AuthGateProps) => {
  const { user, loading } = useAuth();

  // While checking auth status, show loading state
  if (loading) return null;

  // Allow access if authenticated user, regardless of email verification
  if (user) return <>{children}</>;
  
  // Otherwise redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default AuthGate;
