import type { User } from "@supabase/supabase-js";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  providers: string[];
};

export function toAppUser(user: User): AppUser {
  const metadata = user.user_metadata ?? {};
  const providers = Array.from(
    new Set(
      (user.identities ?? [])
        .map((identity) => identity.provider)
        .filter(Boolean)
    )
  );

  if (providers.length === 0 && typeof user.app_metadata?.provider === "string") {
    providers.push(user.app_metadata.provider);
  }

  const email = user.email ?? "";
  const fallbackName = email.includes("@") ? email.split("@")[0] : "Account";

  return {
    id: user.id,
    email,
    name:
      (typeof metadata.full_name === "string" && metadata.full_name) ||
      (typeof metadata.name === "string" && metadata.name) ||
      fallbackName,
    avatarUrl:
      typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    providers,
  };
}
