import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

describe("lib/prisma", () => {
  it("exposes a single shared PrismaClient instance", async () => {
    const { prisma: prismaAgain } = await import("@/lib/prisma");
    expect(prismaAgain).toBe(prisma);
  });
});
