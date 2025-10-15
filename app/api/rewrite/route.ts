import { NextRequest, NextResponse } from "next/server";
import { llmProvider } from "@/lib/llm-provider";
import { RewriteResponseSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription, analysis } = body as {
      resumeText: string;
      jobDescription?: string;
      analysis?: Record<string, unknown>;
    };

    if (!resumeText || resumeText.length < 200) {
      return NextResponse.json(
        {
          error: "Resume text is required and must be at least 200 characters",
        },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a resume rewriter that produces recruiter friendly content with measurable impact, strong action verbs, and concise bullets. 

Rewrite the resume below into a clean structure with these sections: Header, Summary, Skills grouped, Experience, Projects, Education, Certifications if any. Tailor wording to the job description if provided. Keep truthfulness, do not invent employers or degrees. Add metrics only when safely inferable from the text. Use crisp language.

If analysis data is provided, thoughtfully incorporate its insights: prefer the suggested improved bullets when aligned with the resume facts, address missing sections when information exists, and reflect formatting tips in the markdown output. Do not fabricate details to satisfy suggestions.

You must return a JSON object with exactly two fields:
1. "markdown": A string containing the rewritten resume in Markdown format with clear headings and bullet lists
2. "json": An object with the structured resume data containing header, summary, skills, experience, projects, education, and certifications

The JSON structure must match this schema:
{
  "markdown": "string",
  "json": {
    "header": {"name": "string", "title": "string", "location": "string", "links": ["string"]},
    "summary": "string",
    "skills": [{"group": "string", "items": ["string"]}],
    "experience": [{"company": "string", "role": "string", "start": "string", "end": "string", "bullets": ["string"], "tech": ["string"]}],
    "projects": [{"name": "string", "description": "string", "bullets": ["string"], "tech": ["string"]}],
    "education": [{"school": "string", "degree": "string", "year": "string"}],
    "certifications": ["string"]
  }
}`;

    const userPrompt = `Resume:
${resumeText}

Job Description:
${jobDescription || "N/A"}

Analysis (may be empty):
${analysis ? JSON.stringify(analysis) : "{}"}`;

    const rewrite = await llmProvider.generateJson(
      RewriteResponseSchema,
      systemPrompt,
      userPrompt
    );

    return NextResponse.json(rewrite);
  } catch (error) {
    console.error("Rewrite error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
