import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resume Reviewer - AI-Powered Resume Analysis",
  description:
    "Get instant ATS feedback, keyword analysis, and AI-powered resume improvements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <div className="min-h-screen w-full bg-white relative">
          {/* Dual Gradient Overlay Swapped Background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
                radial-gradient(circle 500px at 20% 20%, rgba(20,184,166,0.3), transparent),
                radial-gradient(circle 500px at 80% 80%, rgba(20,184,166,0.3), transparent)
              `,
              backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
            }}
          />
          {/* Content */}
          <div className="relative z-10">
            {children}
            <ToastProvider />
          </div>
        </div>
      </body>
    </html>
  );
}
