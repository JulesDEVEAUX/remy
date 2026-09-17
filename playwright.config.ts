import dotenv from "dotenv";
import { expand } from "dotenv-expand";
import { defineConfig, devices } from "@playwright/test";

expand(dotenv.config({ quiet: true }));

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    // `next dev` n'est pas assez robuste sous la charge concurrente de plusieurs
    // workers Playwright sur le runner CI (streams SSR qui se coupent, redirections
    // post-mutation qui n'aboutissent pas à temps) — un build de prod n'a pas ce
    // problème. En local, reuseExistingServer réutilise le `pnpm dev` déjà lancé.
    command: process.env.CI ? "pnpm build && pnpm start" : "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 180_000 : undefined,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
