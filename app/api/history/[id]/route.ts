import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StoredAnalysisRow = {
  id: string;
  analysis: Record<string, unknown>;
  resume_name: string;
  resume_text: string;
  job_description: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return Response.json({ error: "Review not found." }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return Response.json(
      { error: "Account access is unavailable." },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: "Sign in to view this review." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("resume_analyses")
    .select("id, analysis, resume_name, resume_text, job_description")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("History lookup failed:", error.code);
    return Response.json(
      { error: "Could not load this review." },
      { status: 500 }
    );
  }

  if (!data) {
    return Response.json({ error: "Review not found." }, { status: 404 });
  }

  const row = data as StoredAnalysisRow;
  return Response.json(
    {
      ...row.analysis,
      original_resume_text: row.resume_text,
      job_description: row.job_description,
      resume_name: row.resume_name,
      analysis_id: row.id,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}
