import { expect, test } from "@playwright/test";
import { ensureTestUserId, signInAsTestUser } from "./support/auth";
import { ensureHouseholdHasPerson } from "./support/household";

test.describe("Accueil", () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    "nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test",
  );

  test("la page d'accueil affiche le wordmark et le résumé du foyer", async ({ page }) => {
    const email = "e2e-home@remy.test";
    const userId = await ensureTestUserId(email);
    await ensureHouseholdHasPerson(userId);

    await signInAsTestUser(page, email);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[aria-label="Remy"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Voici où tu en es." })).toBeVisible();
  });
});
