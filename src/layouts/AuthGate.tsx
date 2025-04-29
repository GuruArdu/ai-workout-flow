import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface AuthGateProps {
  children: ReactNode;
}

const AuthGate = ({ children }: AuthGateProps) => {
  const currentUser = useCurrentUser();

  // Allow access if real user or preview user
  if (currentUser) return <>{children}</>;

  // Otherwise redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default AuthGate;
