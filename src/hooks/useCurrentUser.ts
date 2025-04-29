
import { useAuth } from "@/contexts/AuthContext";

/** Returns the real logged-in user or a dev stub. */
export const useCurrentUser = () => {
  const { user } = useAuth();
  
  if (user) return user;

  // Preview / local dev bypass
  if (import.meta.env.DEV || location.hostname.endsWith(".lovable.app")) {
    return { id: "0000-preview-user", email: "preview@demo", role: "tester" } as const;
  }
  
  return null; // production: must log in
};
