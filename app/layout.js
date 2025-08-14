import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ThemeToggle from "@/components/theme-toggle";
import { AppProviders } from "@/app/providers";
import Link from "next/link";
import MobileTabs from "@/components/mobile-tabs";
import AppHeader from "@/components/header/app-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RapidQuest Chat",
  description: "WhatsApp-like chat UI with modern design",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden`}>
        <ThemeProvider>
          <AppProviders>
            <div className="h-screen flex flex-col overflow-hidden">
              <AppHeader />
              <main className="flex-1 overflow-hidden pt-0">{children}</main>
              <MobileTabs />
            </div>
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Small client-only wrapper to avoid SSR mismatch for components depending on window
function ClientOnly({ children }) {
  if (typeof window === "undefined") return null;
  return children;
}
