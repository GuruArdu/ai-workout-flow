
export const getVerifyRedirect = () => {
  // Prefer the env var if present, else fall back to runtime origin
  const base =
    (import.meta.env.VITE_PUBLIC_APP_URL ?? window.location.origin)
      .replace(/^http:/, "https:")
      .replace(/\/$/, "");
  return `${base}/verify`;
};
