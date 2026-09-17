import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/remy_test",
      DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/remy_test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
