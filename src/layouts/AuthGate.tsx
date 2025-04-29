
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDevUser } from "@/hooks/useDevUser";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const devUser = useDevUser();

  if (loading) return null;                    // still fetching
  if (user || devUser) return <>{children}</>; // allow dev or real user
  return <Navigate to="/auth" replace />;
}
