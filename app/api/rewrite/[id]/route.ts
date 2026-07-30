import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ResumeRewriteSaveSchema } from "@/lib/schemas";
import { generateResumeMarkdown } from "@/lib/resume-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type StoredRewrite = {
  id: string;
  analysis_id: string | null;
  resume_name: string;
  rewrite_json: unknown;
  rewrite_markdown: string;
  latex_source: string;
  template_id: string;
  photo_path: string | null;
};

function toResponse(row: StoredRewrite) {
  return {
    rewrite_id: row.id,
    analysis_id: row.analysis_id,
    resume_name: row.resume_name,
    json: row.rewrite_json,
    markdown: row.rewrite_markdown,
    latex_source: row.latex_source,
    template_id: row.template_id,
    photo_path: row.photo_path,
  };
}

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, user };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return Response.json({ error: "Saved resume not found." }, { status: 404 });
  }

  const auth = await getAuthenticatedClient();
  if (!auth) {
    return Response.json(
      { error: "Sign in to view this resume." },
      { status: 401 }
    );
  }

  const { data, error } = await auth.supabase
    .from("resume_rewrites")
    .select(
      "id, analysis_id, resume_name, rewrite_json, rewrite_markdown, latex_source, template_id, photo_path"
    )
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    console.error("Saved resume lookup failed:", error.code);
    return Response.json(
      { error: "Could not load this saved resume." },
      { status: 500 }
    );
  }

  if (!data) {
    return Response.json({ error: "Saved resume not found." }, { status: 404 });
  }

  return Response.json(toResponse(data as StoredRewrite), {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return Response.json({ error: "Saved resume not found." }, { status: 404 });
  }

  const auth = await getAuthenticatedClient();
  if (!auth) {
    return Response.json(
      { error: "Sign in to save this resume." },
      { status: 401 }
    );
  }

  const parsed = ResumeRewriteSaveSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "The resume contains invalid or oversized content." },
      { status: 400 }
    );
  }

  const photoPath = parsed.data.photo_path ?? null;
  if (photoPath && !photoPath.startsWith(`${auth.user.id}/`)) {
    return Response.json({ error: "Invalid resume photo." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("resume_rewrites")
    .update({
      rewrite_json: parsed.data.json,
      rewrite_markdown: generateResumeMarkdown(parsed.data.json),
      latex_source: parsed.data.latex_source,
      template_id: parsed.data.template_id,
      photo_path: photoPath,
    })
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select(
      "id, analysis_id, resume_name, rewrite_json, rewrite_markdown, latex_source, template_id, photo_path"
    )
    .maybeSingle();

  if (error) {
    console.error("Saved resume update failed:", error.code);
    return Response.json(
      { error: "Could not save this resume." },
      { status: 500 }
    );
  }

  if (!data) {
    return Response.json({ error: "Saved resume not found." }, { status: 404 });
  }

  return Response.json(toResponse(data as StoredRewrite), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
