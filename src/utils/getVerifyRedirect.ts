
export const getVerifyRedirect = () => {
  // Always returns a valid https:// URL that matches the current host
  const origin = window.location.origin.replace("http://", "https://");
  return `${origin}/verify`;
};
