import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDevBypass } from "@/hooks/useDevBypass";

interface AuthGateProps {
  children: ReactNode;
}

const AuthGate = ({ children }: AuthGateProps) => {
  const { user, loading } = useAuth();
  const devUser = useDevBypass();

  // While checking auth status, show nothing
  if (loading) return null;

  // Allow access if real user or dev bypass
  if (user || devUser) return <>{children}</>;

  // Otherwise redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default AuthGate;
