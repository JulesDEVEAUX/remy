import dotenv from "dotenv";
import { expand } from "dotenv-expand";
import { defineConfig } from "prisma/config";

expand(dotenv.config({ quiet: true }));

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Connexion directe (non poolée) : requise par `migrate`/`db push` pour les DDL.
    // Lecture directe (pas le helper strict `env()`) : DIRECT_URL n'est volontairement pas
    // fournie sur Vercel (CI-only), et `prisma generate` (postinstall) ne doit pas planter
    // pour autant — il n'a pas besoin d'une connexion DB réelle.
    url: process.env.DIRECT_URL,
  },
});
