import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";

function safeNextPath(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/account";
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <AppShell>
      <div className="container mx-auto flex min-h-[calc(100vh-170px)] items-center justify-center px-4 py-10">
        <AuthForm mode="sign-up" nextPath={safeNextPath(params.next)} />
      </div>
    </AppShell>
  );
}
