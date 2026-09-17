import { expect, test } from "@playwright/test";
import { ensureTestUserId, signInAsTestUser } from "./support/auth";
import { ensureHouseholdHasPerson } from "./support/household";

test.describe("Thème sombre", () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    "nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test",
  );

  test("basculer vers le thème sombre depuis les paramètres persiste après rechargement", async ({ page }) => {
    const email = "e2e-theme@remy.test";
    const userId = await ensureTestUserId(email);
    await ensureHouseholdHasPerson(userId);

    await signInAsTestUser(page, email);
    await page.goto("/parametres");
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: "Sombre", exact: true }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.getByRole("button", { name: "Clair", exact: true }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});
