import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CacheIndicator from "@/components/CacheIndicator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/auth/AuthProvider";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "海盜大叔航海誌 | Chronicle of the Uncle Pirates",
  description: "海盜大叔的活動相簿與公積金透明管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <CacheIndicator />
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
