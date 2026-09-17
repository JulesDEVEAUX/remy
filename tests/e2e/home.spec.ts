import { test, expect } from "@playwright/test";

test("la page d'accueil affiche le titre Remy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /remy/i })).toBeVisible();
});
