import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import ScrollToTop from "../components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YatraSaathi — Making Every Journey Accessible, Safe & Smart.",
  description: "YatraSaathi is an AI-powered accessible travel companion focused on barrier-aware routing, accessibility intelligence, and verified accessibility information.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 transition-colors duration-150">
        <AppProvider>
          <ScrollToTop />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
