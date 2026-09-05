import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import "./premium.css";
import { PwaRegister } from "@/components/pwa-register";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const publicBase = process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : "";
export const metadata: Metadata = {
  title: { default: "PMWORK", template: "%s · PMWORK" },
  description: "The practical operating system for project managers.",
  manifest: `${publicBase}/manifest.webmanifest`,
  icons: { icon: `${publicBase}/icon.svg` },
  applicationName: "PMWORK",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F8FB" },
    { media: "(prefers-color-scheme: dark)", color: "#080B10" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable}`}>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
