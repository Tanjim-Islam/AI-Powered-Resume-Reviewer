import { NextRequest, NextResponse } from "next/server";
import { parseResumeFile, validateJobDescription } from "@/lib/file-parser";
import { llmProvider } from "@/lib/llm-provider";
import { AnalyzeResponseSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type ProfileContextRow = {
  profession: string | null;
  job_preferences: string | null;
  modification_preferences: string | null;
  memory_notes: string | null;
};

function formatProfileContext(profile: ProfileContextRow | null) {
  if (!profile) {
    return "";
  }

  const fields = [
    ["Profession", profile.profession],
    ["Job preferences", profile.job_preferences],
    ["Editing preferences", profile.modification_preferences],
    ["Saved memory", profile.memory_notes],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  if (fields.length === 0) {
    return "";
  }

  return fields.map(([label, value]) => `${label}: ${value}`).join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resumeFile") as File;
    const resumeText = formData.get("resumeText") as string;
    const jobDescription = formData.get("jobDescription") as string;

    // Validate inputs
    if (!resumeFile && !resumeText) {
      return NextResponse.json(
        { error: "Resume file or text is required" },
        { status: 400 }
      );
    }

    let parsedResume: { text: string; fileName: string; fileType: string };

    if (resumeFile) {
      // Parse uploaded file
      parsedResume = await parseResumeFile(resumeFile);

      // Validate parsed text
      if (!parsedResume.text || parsedResume.text.length < 200) {
        return NextResponse.json(
          { error: "Resume text is too short or could not be parsed" },
          { status: 400 }
        );
      }
    } else {
      // Validate resume text
      if (!resumeText || resumeText.length < 200) {
        return NextResponse.json(
          { error: "Resume text is too short" },
          { status: 400 }
        );
      }
      parsedResume = {
        text: resumeText,
        fileName: "text-resume.txt",
        fileType: "text/plain",
      };
    }

    // Validate job description if provided
    const jobDescValidation = validateJobDescription(jobDescription || "");
    if (!jobDescValidation.isValid) {
      return NextResponse.json(
        { error: jobDescValidation.error },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    let signedInUserId: string | null = null;
    let profileContext = "";

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        signedInUserId = user.id;
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select(
            "profession, job_preferences, modification_preferences, memory_notes"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile context lookup failed:", profileError.code);
        } else {
          profileContext = formatProfileContext(
            profile as ProfileContextRow | null
          );
        }
      }
    }

    // Generate analysis using LLM
    const systemPrompt = `You are a strict ATS resume analyst and writing coach. Output must be valid JSON that conforms to the provided schema. Do not include commentary outside JSON.

Analyze the following resume. If a job description is provided, tailor the keyword match and suggestions to it. Score ATS friendliness from 0 to 100 using this rubric:
- Structure and sections 25 points
- Keyword relevance 35 points  
- Formatting clarity and scannability 20 points
- Action orientation and measurable impact 20 points

Return:
- ats_score: number between 0-100
- keyword_match: { matched: string[], missing: string[] }
- bullet_suggestions: [{ original: string, improved: string, rationale?: string }]
- missing_sections: string[]
- formatting_tips: string[]
- inferred_structure: { sectionsPresent: string[], sectionsMissing: string[] }`;

    const userPrompt = `Resume:
${parsedResume.text}

Job Description:
${jobDescription || "N/A"}

Account Preferences:
${profileContext || "N/A"}`;

    const analysis = await llmProvider.generateJson(
      AnalyzeResponseSchema,
      systemPrompt,
      userPrompt
    );

    const responseData = {
      ...analysis,
      original_resume_text: parsedResume.text,
      job_description: jobDescription || "",
      resume_name: parsedResume.fileName,
    };

    let analysisId: string | null = null;
    if (supabase && signedInUserId) {
      const { data: savedAnalysis, error: historyError } = await supabase
        .from("resume_analyses")
        .insert({
          user_id: signedInUserId,
          resume_name: parsedResume.fileName,
          resume_text: parsedResume.text,
          job_description: jobDescription || "",
          ats_score: analysis.ats_score,
          analysis,
        })
        .select("id")
        .single();

      if (historyError) {
        console.error("Analysis history save failed:", historyError.code);
      } else {
        analysisId = savedAnalysis.id as string;
      }
    }

    // Guests receive results without persistence. Signed-in users get a history ID.
    return NextResponse.json(
      {
        ...responseData,
        analysis_id: analysisId,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Analysis error:", error);

    if (error instanceof Error) {
      const message = error.message;
      if (
        message.startsWith("Unsupported file type") ||
        message.startsWith("File size must be less than") ||
        message.startsWith("Failed to parse the file")
      ) {
        return NextResponse.json({ error: message }, { status: 400 });
      }

      if (
        message.startsWith("Rate limit exceeded") ||
        message.startsWith("AI service timed out") ||
        message.startsWith("Gemini API service is temporarily unavailable")
      ) {
        return NextResponse.json({ error: message }, { status: 503 });
      }

      return NextResponse.json(
        { error: "Resume analysis failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
