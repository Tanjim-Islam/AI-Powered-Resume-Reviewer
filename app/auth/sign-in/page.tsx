import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";

function safeNextPath(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/account";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const initialError =
    params.error === "oauth"
      ? "Google sign-in could not be completed. Please try again."
      : undefined;

  return (
    <AppShell>
      <div className="container mx-auto flex min-h-[calc(100vh-170px)] items-center justify-center px-4 py-10">
        <AuthForm
          mode="sign-in"
          nextPath={safeNextPath(params.next)}
          initialError={initialError}
        />
      </div>
    </AppShell>
  );
}
