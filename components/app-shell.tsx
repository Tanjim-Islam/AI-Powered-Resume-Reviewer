"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, UserRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className = "" }: AppShellProps) {
  const { user, isConfigured, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <header className="w-full border-b border-white/20 backdrop-blur-sm bg-white/10 glass-navbar">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RR</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">
                Resume Reviewer
              </h1>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/about"
                className="hidden sm:inline text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                About
              </Link>
              {user ? (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                  >
                    <Link href="/account">
                      <UserRound className="size-4" />
                      <span className="hidden sm:inline">
                        {user.name.split(" ")[0]}
                      </span>
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    aria-label="Sign out"
                    className="text-gray-500 hover:bg-red-50 hover:text-red-600"
                  >
                    {isSigningOut ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <LogOut className="size-4" />
                    )}
                  </Button>
                </>
              ) : isConfigured ? (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                  >
                    <Link href="/auth/sign-in">Sign in</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-teal-600 text-white hover:bg-teal-700"
                  >
                    <Link href="/auth/sign-up">Get started</Link>
                  </Button>
                </>
              ) : null}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="w-full border-t border-white/20 backdrop-blur-sm bg-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              © 2026 Resume Reviewer. Built with brutal truth.
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
