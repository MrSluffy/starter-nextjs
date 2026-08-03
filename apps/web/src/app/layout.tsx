import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const themeInitializer = `(() => {
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const applyTheme = (isDark) => {
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  };

  applyTheme(media.matches);
  media.addEventListener?.("change", (event) => applyTheme(event.matches));
})();`;

export const metadata: Metadata = {
  title: "Next.js Starter — Project Generator",
  description: "Generate production-ready Next.js projects with a Spring Initializr-style wizard.",
  keywords: ["Next.js", "starter", "generator", "boilerplate", "scaffold"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body className="font-sans antialiased">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
