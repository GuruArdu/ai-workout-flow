
// Returns a stub user object when running on localhost or a Lovable preview.
// Everywhere else it returns null.
export const DEV_ID = "0000-preview-user";

export const useDevUser = () => {
  const dev =
    import.meta.env.DEV || location.hostname.endsWith(".lovable.app");
  return dev ? { id: DEV_ID, email: "dev@local" } : null;
};
