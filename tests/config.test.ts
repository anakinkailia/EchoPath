import { afterEach, expect, it, vi } from "vitest";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
it("invalid connection settings show an error without falling back to fictional data", async () => {
  vi.stubEnv("VITE_SUPABASE_URL", "not-a-url");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "public-key");
  vi.resetModules();
  const store = await import("../src/store");
  expect(store.live).toBe(true);
  await expect(store.listExperiences()).rejects.toThrow(
    "configuration is incomplete or invalid",
  );
});
it("partial connection settings also produce an explicit configuration error", async () => {
  vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
  vi.resetModules();
  const store = await import("../src/store");
  expect(store.live).toBe(true);
  await expect(store.listExperiences()).rejects.toThrow(
    "configuration is incomplete or invalid",
  );
});
