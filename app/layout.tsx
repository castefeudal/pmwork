import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./tokens.css";
import "./globals.css";
import "./premium.css";
import "./editorial.css";
import "./ux-transformation.css";
import "./workspace.css";
import "./excellence.css";
import "./management.css";
import "./refinement.css";
import "./clarity.css";
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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale } = await params;
  return <RootDocument locale={locale === "en" ? "en" : "ru"}>{children}</RootDocument>;
}

function RootDocument({ children, locale }: { children: React.ReactNode; locale: "ru" | "en" }) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:"try{var z=localStorage.getItem('pmwork-text-size');document.documentElement.dataset.textSize=['large','extra-large'].includes(z)?z:'standard';document.documentElement.dataset.contrast=localStorage.getItem('pmwork-contrast')==='more'?'more':'standard';var t=localStorage.getItem('pmwork-theme');document.documentElement.dataset.theme=t?(t==='dark'?'dark':'light'):(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch{}"}}/>
      </head>
      <body className="local-fonts">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
