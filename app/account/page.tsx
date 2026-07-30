import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronRight,
  Clock3,
  FilePenLine,
  Link2,
  Settings2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AccountProfileForm } from "@/components/account-profile-form";
import type { ProfileValues } from "@/components/account-profile-form";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toAppUser } from "@/lib/supabase/user";
import {
  DEFAULT_RESUME_TEMPLATE_ID,
  isResumeTemplateId,
} from "@/lib/resume-templates";

type ProfileRow = {
  full_name: string | null;
  profession: string | null;
  job_preferences: string | null;
  modification_preferences: string | null;
  memory_notes: string | null;
  preferred_template_id: string | null;
  resume_photo_path: string | null;
};

type HistoryRow = {
  id: string;
  resume_name: string;
  ats_score: number;
  created_at: string;
};

type RewriteHistoryRow = {
  id: string;
  analysis_id: string | null;
  updated_at: string;
};

const providerNames: Record<string, string> = {
  email: "Email",
  google: "Google",
};

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/auth/sign-in");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/account");
  }

  const [profileResult, historyResult, rewritesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, profession, job_preferences, modification_preferences, memory_notes, preferred_template_id, resume_photo_path"
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("resume_analyses")
      .select("id, resume_name, ats_score, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("resume_rewrites")
      .select("id, analysis_id, updated_at")
      .eq("user_id", user.id)
      .not("analysis_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  const profile = profileResult.data as ProfileRow | null;
  const history = (historyResult.data ?? []) as HistoryRow[];
  const rewrites = (rewritesResult.data ?? []) as RewriteHistoryRow[];
  const rewriteByAnalysis = new Map(
    rewrites
      .filter((rewrite) => rewrite.analysis_id)
      .map((rewrite) => [rewrite.analysis_id as string, rewrite.id])
  );
  const appUser = toAppUser(user);
  let photoUrl = "";

  if (profile?.resume_photo_path) {
    const { data } = await supabase.storage
      .from("resume-assets")
      .createSignedUrl(profile.resume_photo_path, 3600);
    photoUrl = data?.signedUrl ?? "";
  }

  const initialValues: ProfileValues = {
    full_name: profile?.full_name ?? appUser.name,
    profession: profile?.profession ?? "",
    job_preferences: profile?.job_preferences ?? "",
    modification_preferences: profile?.modification_preferences ?? "",
    memory_notes: profile?.memory_notes ?? "",
    preferred_template_id: isResumeTemplateId(
      profile?.preferred_template_id
    )
      ? profile.preferred_template_id
      : DEFAULT_RESUME_TEMPLATE_ID,
    resume_photo_path: profile?.resume_photo_path ?? "",
    resume_photo_url: photoUrl,
  };
  const providers = appUser.providers.length > 0 ? appUser.providers : ["email"];

  return (
    <AppShell>
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="mb-7">
          <p className="text-sm font-medium text-teal-700">Your account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Profile and history
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <Card className="gap-0 border-white/40 bg-white/85 p-0 shadow-lg shadow-teal-950/5 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Settings2 className="size-4" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Preferences</h2>
                <p className="text-sm text-gray-500">
                  Used for your signed-in reviews.
                </p>
              </div>
            </div>

            <div className="px-6 py-6">
              <AccountProfileForm initialValues={initialValues} />
            </div>

            <div className="border-t border-gray-100 px-6 py-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Link2 className="size-4 text-teal-600" />
                Connections
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {providers.map((provider) => (
                  <span
                    key={provider}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    {providerNames[provider] ?? provider}
                  </span>
                ))}
                <span className="text-sm text-gray-500">{appUser.email}</span>
              </div>
            </div>
          </Card>

          <Card className="h-fit gap-0 border-white/40 bg-white/85 p-0 shadow-lg shadow-teal-950/5 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Clock3 className="size-4" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Resume history</h2>
                <p className="text-sm text-gray-500">
                  Saved only when signed in.
                </p>
              </div>
            </div>

            {history.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {history.map((item) => (
                  <Link
                    key={item.id}
                    href={
                      rewriteByAnalysis.has(item.id)
                        ? `/rewrite?id=${rewriteByAnalysis.get(item.id)}`
                        : `/analyze?id=${item.id}`
                    }
                    className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-teal-50/60"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-sm font-bold text-teal-700">
                      {item.ats_score}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {item.resume_name}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {new Intl.DateTimeFormat("en", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(item.created_at))}
                      </p>
                    </div>
                    {rewriteByAnalysis.has(item.id) && (
                      <span className="hidden items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-[11px] font-medium text-teal-700 sm:flex">
                        <FilePenLine className="size-3" />
                        Rewritten
                      </span>
                    )}
                    <ChevronRight className="size-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-gray-500">
                Your signed-in reviews will appear here.
              </p>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
