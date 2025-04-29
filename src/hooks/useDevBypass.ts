
export const useDevBypass = () => {
  const isDev = import.meta.env.DEV || 
    window.location.hostname.endsWith(".lovable.app");

  if (!isDev) return null; // No bypass in production

  const url = new URL(window.location.href);
  const uid = url.searchParams.get("devUser") ?? "0000-dev";
  
  return {
    id: uid,
    email: "dev@local",
    role: "authenticated"
  };
};
