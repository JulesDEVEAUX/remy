import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Connexion directe (non poolée) : requise par `migrate`/`db push` pour les DDL.
    url: env("DIRECT_URL"),
  },
});
