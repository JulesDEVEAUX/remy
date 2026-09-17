import type { Metadata } from "next";
import clsx from "clsx";
import { fontVars } from "./fonts";
import { getTheme } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remy",
  description: "Assistant courses & recettes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();
  return (
    <html lang="fr" className={clsx(fontVars, theme === "dark" && "dark")}>
      <body>{children}</body>
    </html>
  );
}
