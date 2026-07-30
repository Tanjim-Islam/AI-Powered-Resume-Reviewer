import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { llmProvider } from "@/lib/llm-provider";
import {
  RewriteModelResponseSchema,
  type ResumeTemplateId,
} from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  DEFAULT_RESUME_TEMPLATE_ID,
  generateResumeLatex,
  generateResumeMarkdown,
  isResumeTemplateId,
} from "@/lib/resume-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const RewriteRequestSchema = z.object({
  resumeText: z.string().min(200).max(100_000),
  jobDescription: z.string().max(30_000).optional(),
  analysis: z.record(z.string(), z.unknown()).optional(),
  analysisId: z.string().uuid().nullable().optional(),
  resumeName: z.string().max(255).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const parsedRequest = RewriteRequestSchema.safeParse(await request.json());
    if (!parsedRequest.success) {
      return NextResponse.json(
        { error: "Resume text is required and must be at least 200 characters." },
        { status: 400 }
      );
    }

    const {
      resumeText,
      jobDescription,
      analysis,
      analysisId,
      resumeName = "Resume",
    } = parsedRequest.data;

    const supabase = await createSupabaseServerClient();
    let signedInUserId: string | null = null;
    let accountPreferences = "";
    let preferredTemplateId: ResumeTemplateId =
      DEFAULT_RESUME_TEMPLATE_ID;
    let photoPath: string | null = null;
    let verifiedAnalysisId: string | null = null;
    let verifiedResumeName = resumeName;

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        signedInUserId = user.id;
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select(
            "profession, job_preferences, modification_preferences, memory_notes, preferred_template_id, resume_photo_path"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Rewrite preferences lookup failed:", profileError.code);
        } else if (profile) {
          const values = [
            ["Profession", profile.profession],
            ["Job preferences", profile.job_preferences],
            ["Editing preferences", profile.modification_preferences],
            ["Saved memory", profile.memory_notes],
          ].filter((entry) => Boolean(entry[1]));

          accountPreferences = values
            .map(([label, value]) => `${label}: ${value}`)
            .join("\n");

          if (isResumeTemplateId(profile.preferred_template_id)) {
            preferredTemplateId = profile.preferred_template_id;
          }
          photoPath =
            typeof profile.resume_photo_path === "string"
              ? profile.resume_photo_path
              : null;
        }

        if (analysisId) {
          const { data: ownedAnalysis } = await supabase
            .from("resume_analyses")
            .select("id, resume_name")
            .eq("id", analysisId)
            .eq("user_id", user.id)
            .maybeSingle();

          if (ownedAnalysis) {
            verifiedAnalysisId = ownedAnalysis.id as string;
            verifiedResumeName = ownedAnalysis.resume_name as string;
          }
        }
      }
    }

    const systemPrompt = `You are a resume rewriter that produces recruiter-friendly content with measurable impact, strong action verbs, and concise bullets.

Rewrite the resume into a clean structure with these sections when supported by the source: Header, Summary, Skills, Experience, Projects, Education, Certifications, Publications, Awards, Languages, and Interests. Tailor wording to the job description if provided. Preserve facts. Do not invent employers, degrees, metrics, publications, credentials, or personal details.

If analysis data is provided, incorporate useful suggestions only when they align with facts in the resume.

Return a JSON object with exactly two fields:
1. "markdown": the rewritten resume in Markdown
2. "json": structured resume data

The json object must have this shape:
{
  "header": {
    "name": "string",
    "title": "string",
    "location": "string",
    "phone": "string",
    "email": "string",
    "linkedin": "string",
    "portfolio": "string",
    "links": ["string"]
  },
  "summary": "string",
  "skills": [{"group": "string", "items": ["string"]}],
  "experience": [{"company": "string", "role": "string", "start": "string", "end": "string", "bullets": ["string"], "tech": ["string"]}],
  "projects": [{"name": "string", "description": "string", "bullets": ["string"], "tech": ["string"]}],
  "education": [{"school": "string", "degree": "string", "year": "string", "cgpa": "string"}],
  "certifications": ["string"],
  "publications": [{"title": "string", "venue": "string", "year": "string"}],
  "awards": ["string"],
  "languages": ["string"],
  "interests": ["string"]
}

Put the LinkedIn profile only in "linkedin" and the personal website only in "portfolio". Use "links" only for additional, distinct URLs such as GitHub, Behance, or a publication profile. Never repeat the same URL in multiple header fields.

Use empty strings or empty arrays for missing information.`;

    const userPrompt = `Resume:
${resumeText}

Job Description:
${jobDescription || "N/A"}

Analysis:
${analysis ? JSON.stringify(analysis) : "{}"}

Account Preferences:
${accountPreferences || "N/A"}`;

    const modelRewrite = await llmProvider.generateJson(
      RewriteModelResponseSchema,
      systemPrompt,
      userPrompt
    );

    const markdown = generateResumeMarkdown(modelRewrite.json);
    const latexSource = generateResumeLatex(
      preferredTemplateId,
      modelRewrite.json
    );

    let rewriteId: string | null = null;
    if (supabase && signedInUserId) {
      const writePayload = {
        user_id: signedInUserId,
        analysis_id: verifiedAnalysisId,
        resume_name: verifiedResumeName,
        source_resume_text: resumeText,
        job_description: jobDescription || "",
        rewrite_json: modelRewrite.json,
        rewrite_markdown: markdown,
        latex_source: latexSource,
        template_id: preferredTemplateId,
        photo_path: photoPath,
      };

      const writeQuery = verifiedAnalysisId
        ? supabase
            .from("resume_rewrites")
            .upsert(writePayload, { onConflict: "analysis_id" })
        : supabase.from("resume_rewrites").insert(writePayload);

      const { data: savedRewrite, error: saveError } = await writeQuery
        .select("id")
        .single();

      if (saveError) {
        console.error("Resume rewrite save failed:", saveError.code);
      } else {
        rewriteId = savedRewrite.id as string;
      }
    }

    return NextResponse.json(
      {
        json: modelRewrite.json,
        markdown,
        rewrite_id: rewriteId,
        analysis_id: verifiedAnalysisId,
        resume_name: verifiedResumeName,
        template_id: preferredTemplateId,
        latex_source: latexSource,
        photo_path: photoPath,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Rewrite error:", error);

    if (error instanceof Error) {
      if (
        error.message.startsWith("Rate limit exceeded") ||
        error.message.startsWith("AI service timed out") ||
        error.message.startsWith(
          "Gemini API service is temporarily unavailable"
        )
      ) {
        return NextResponse.json({ error: error.message }, { status: 503 });
      }
    }

    return NextResponse.json(
      { error: "Resume rewriting failed. Please try again." },
      { status: 500 }
    );
  }
}
