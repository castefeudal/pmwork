import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

const publicBase=process.env.PMWORK_BASE_PATH==="github"?"/pmwork":"";
export const metadata: Metadata = {
  title: { default: "PMWORK", template: "%s · PMWORK" },
  description: "The practical operating system for project managers.",
  manifest: `${publicBase}/manifest.webmanifest`,
  icons:{icon:`${publicBase}/icon.svg`},
  applicationName: "PMWORK",
};

export const viewport: Viewport = { themeColor: "#176B87", colorScheme: "light dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru" suppressHydrationWarning><body>{children}<PwaRegister/></body></html>;
}
