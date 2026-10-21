import { defineConfig } from "vitest/config";
import { loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Serves api/*.ts during `npm run dev` the same way Vercel Functions do in production.
function devApi(): Plugin {
  return {
    name: "echopath-dev-api",
    configureServer(server) {
      server.middlewares.use("/api", async (req, res) => {
        try {
          // Re-read .env.local on every call so a changed key works without a restart.
          Object.assign(
            process.env,
            loadEnv("development", process.cwd(), "POE_"),
          );
          const name = (req.url ?? "/").split("?")[0].replace(/^\/|\/$/g, "");
          const mod = await server.ssrLoadModule(`/api/${name}.ts`);
          const handler = mod[req.method ?? "GET"];
          if (!/^[\w-]+$/.test(name) || typeof handler !== "function") {
            res.statusCode = 405;
            return res.end();
          }
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const response: Response = await handler(
            new Request(`http://${req.headers.host}/api/${name}`, {
              method: req.method,
              headers: req.headers as Record<string, string>,
              body: chunks.length ? Buffer.concat(chunks) : undefined,
            }),
          );
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(await response.text());
        } catch (e) {
          server.config.logger.error(String(e));
          res.statusCode = 500;
          res.end();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
