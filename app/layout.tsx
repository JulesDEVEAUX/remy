import type { Metadata } from "next";
import { fontVars } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remy",
  description: "Assistant courses & recettes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
