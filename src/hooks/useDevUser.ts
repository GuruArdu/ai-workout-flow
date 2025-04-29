
export const useDevUser = () => {
  // Enabled only on localhost or *.lovable.app preview hosts
  const dev =
    import.meta.env.DEV ||
    location.hostname.endsWith(".lovable.app");
  if (!dev) return null;
  return { id: "dev-user", email: "dev@local" } as const;
};
