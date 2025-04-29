
export const getVerifyRedirect = () => {
  // Prefer the stable env var if present, else fall back to runtime origin
  const base =
    import.meta.env.VITE_PUBLIC_APP_URL?.replace(/^http:/, "https:") ||
    window.location.origin.replace(/^http:/, "https:");
  return `${base}/verify`;
};
