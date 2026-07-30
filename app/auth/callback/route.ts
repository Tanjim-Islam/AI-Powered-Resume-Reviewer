import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/account";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
      const origin =
        process.env.NODE_ENV === "development" || !forwardedHost
          ? requestUrl.origin
          : `${forwardedProto}://${forwardedHost}`;

      return NextResponse.redirect(new URL(nextPath, origin));
    }
  }

  return NextResponse.redirect(
    new URL("/auth/sign-in?error=oauth", requestUrl.origin)
  );
}
