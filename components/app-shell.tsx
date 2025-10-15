"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className = "" }: AppShellProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <header className="w-full border-b border-white/20 backdrop-blur-sm bg-white/10 glass-navbar">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RR</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">
                Resume Reviewer
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-teal-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-teal-600 transition-colors"
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="w-full border-t border-white/20 backdrop-blur-sm bg-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              © 2024 Resume Reviewer. Built with brutal truth. Resumes quake.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function GlassCard({ children, className = "" }: AppShellProps) {
  return (
    <Card
      className={`backdrop-blur-sm bg-white/80 border-white/20 shadow-lg ${className}`}
    >
      {children}
    </Card>
  );
}
