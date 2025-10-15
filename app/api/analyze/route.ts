import { NextRequest, NextResponse } from "next/server";
import { parseResumeFile, validateJobDescription } from "@/lib/file-parser";
import { llmProvider } from "@/lib/llm-provider";
import { AnalyzeResponseSchema } from "@/lib/schemas";

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
${jobDescription || "N/A"}`;

    const analysis = await llmProvider.generateJson(
      AnalyzeResponseSchema,
      systemPrompt,
      userPrompt
    );

    // Include original resume text and job description for downstream rewrite flow
    return NextResponse.json({
      ...analysis,
      original_resume_text: parsedResume.text,
      job_description: jobDescription || "",
    });
  } catch (error) {
    console.error("Analysis error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
