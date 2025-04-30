
export const useDevUser = () => {
  // Enabled only on localhost or *.lovable.app preview hosts
  const dev =
    import.meta.env.DEV ||
    location.hostname.endsWith(".lovable.app");
  if (!dev) return null;
  // Using a valid UUID format for development user
  return { id: "00000000-0000-0000-0000-000000000000", email: "dev@local" } as const;
};
