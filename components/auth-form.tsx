"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type AuthMode = "sign-in" | "sign-up";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.64-2.43l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.86A6.01 6.01 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.01c1.47 0 2.79.5 3.83 1.49l2.88-2.88A9.66 9.66 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z"
      />
    </svg>
  );
}

function getFriendlyAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirm your email before signing in.";
  }
  if (normalized.includes("already registered")) {
    return "An account already exists for this email.";
  }
  if (normalized.includes("password")) {
    return "Use a password with at least 8 characters.";
  }
  if (normalized.includes("rate") || normalized.includes("too many")) {
    return "Too many attempts. Please wait and try again.";
  }

  return "Account access failed. Please try again.";
}

export function AuthForm({
  mode,
  nextPath = "/account",
  initialError,
}: {
  mode: AuthMode;
  nextPath?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const isSignUp = mode === "sign-up";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const callbackUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      nextPath
    )}`;

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!configured) {
      setError("Account access is unavailable right now.");
      return;
    }

    if (isSignUp && fullName.trim().length < 2) {
      setError("Enter your name.");
      return;
    }

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    const supabase = getSupabaseBrowserClient();

    try {
      if (isSignUp) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: callbackUrl(),
          },
        });

        if (authError) {
          throw authError;
        }

        if (!data.session) {
          setMessage("Check your email to confirm your account.");
          return;
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (authError) {
          throw authError;
        }
      }

      router.push(nextPath);
      router.refresh();
    } catch (authError) {
      setError(
        getFriendlyAuthError(
          authError instanceof Error ? authError.message : ""
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setMessage("");

    if (!configured) {
      setError("Account access is unavailable right now.");
      return;
    }

    setIsGoogleLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl(),
      },
    });

    if (authError) {
      setError(getFriendlyAuthError(authError.message));
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md gap-0 overflow-hidden border-white/40 bg-white/85 p-0 shadow-xl shadow-teal-950/5 backdrop-blur-xl">
      <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white shadow-sm">
            RR
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {isSignUp
                ? "Save reviews and preferences."
                : "Continue to your review history."}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-gray-200 bg-white text-gray-700 hover:border-teal-200 hover:bg-teal-50"
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading || isSubmitting}
        >
          {isGoogleLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          {isSignUp ? "Sign up with Google" : "Sign in with Google"}
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          <span>or use email</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-gray-700">Name</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                  maxLength={120}
                  required
                  className="h-10 border-gray-200 bg-white pl-9 focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
                />
              </div>
            </label>
          )}

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="h-10 border-gray-200 bg-white pl-9 focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={8}
                required
                className="h-10 border-gray-200 bg-white pl-9 focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
              />
            </div>
            {isSignUp && (
              <span className="text-xs text-gray-400">
                8 characters minimum
              </span>
            )}
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="text-sm text-teal-700">
              {message}
            </p>
          )}

          <Button
            type="submit"
            className="h-10 w-full bg-teal-600 text-white hover:bg-teal-700"
            disabled={isSubmitting || isGoogleLoading}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSignUp ? "Create account" : "Sign in"}
          </Button>
        </form>
      </div>

      <p className="px-6 py-4 text-center text-sm text-gray-500 sm:px-8">
        {isSignUp ? "Already have an account?" : "New to Resume Reviewer?"}{" "}
        <Link
          href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}
          className="font-medium text-teal-700 hover:text-teal-800"
        >
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </Card>
  );
}
