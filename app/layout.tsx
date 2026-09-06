import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./tokens.css";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

const publicBase = process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : "";
export const metadata: Metadata = {
  title: { default: "PMWORK", template: "%s · PMWORK" },
  description: "The practical operating system for project managers.",
  manifest: `${publicBase}/manifest.webmanifest`,
  icons: { icon: `${publicBase}/brand/favicon.png`, apple: `${publicBase}/apple-touch-icon.png` },
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
      <head><script dangerouslySetInnerHTML={{__html:`try{const t=localStorage.getItem('pmwork-theme');document.documentElement.dataset.theme=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch{}`}}/></head>
      <body className="local-fonts">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
