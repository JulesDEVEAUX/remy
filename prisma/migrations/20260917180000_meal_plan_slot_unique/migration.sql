-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_householdId_date_mealType_key" ON "MealPlan"("householdId", "date", "mealType");
