import type { Metadata, Viewport } from "next";
import clsx from "clsx";
import { fontVars } from "./fonts";
import { getTheme } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remy",
  description: "Assistant courses & recettes",
};

// Ne désactive pas le pinch-zoom (userScalable) : ça casserait l'accessibilité pour
// les personnes qui en ont besoin. Le vrai bug (barre d'onglets qui sort de l'écran
// après un zoom involontaire) vient d'iOS Safari qui zoome tout seul au focus d'un
// champ dont le texte fait moins de 16px — cf. components/ui/FormField.tsx.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
