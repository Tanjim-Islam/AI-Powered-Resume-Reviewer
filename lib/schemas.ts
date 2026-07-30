import { z } from "zod";

export const AnalyzeRequestSchema = z.object({
  resumeText: z.string().min(200, "Resume text is too short"),
  jobDescription: z.string().optional(),
});

export const KeywordMatchSchema = z.object({
  matched: z.array(z.string()),
  missing: z.array(z.string()),
});

export const BulletSuggestionSchema = z.object({
  original: z.string(),
  improved: z.string(),
  rationale: z.string().optional(),
});

export const AnalyzeResponseSchema = z.object({
  ats_score: z.number().min(0).max(100),
  keyword_match: KeywordMatchSchema,
  bullet_suggestions: z.array(BulletSuggestionSchema),
  missing_sections: z.array(z.string()),
  formatting_tips: z.array(z.string()),
  inferred_structure: z.object({
    sectionsPresent: z.array(z.string()),
    sectionsMissing: z.array(z.string()),
  }),
});

export const ResumeSectionSchema = z.object({
  title: z.string(),
  items: z.array(z.any()),
});

export const ResumeTemplateIdSchema = z.enum([
  "harshibar",
  "curve",
  "northeastern",
  "boltach",
  "portrait",
  "iiit",
  "deedy",
  "engineer",
  "researcher",
  "executive",
  "swiss",
  "consulting",
  "finance",
  "legal",
  "clinical",
  "data",
  "cyber",
  "product",
  "sales",
  "graduate",
  "public-service",
]);

export const ResumeDataSchema = z.object({
  header: z.object({
    name: z.string(),
    title: z.string().optional(),
    location: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    linkedin: z.string().optional(),
    portfolio: z.string().optional(),
    links: z.array(z.string()).optional(),
  }),
  summary: z.string(),
  skills: z.array(
    z.object({ group: z.string(), items: z.array(z.string()) })
  ),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      start: z.string(),
      end: z.string(),
      bullets: z.array(z.string()),
      tech: z.array(z.string()).optional(),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      bullets: z.array(z.string()),
      tech: z.array(z.string()).optional(),
    })
  ),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      year: z.string().optional(),
      cgpa: z.string().optional(),
    })
  ),
  certifications: z.array(z.string()).optional(),
  publications: z
    .array(
      z.object({
        title: z.string(),
        venue: z.string().optional(),
        year: z.string().optional(),
      })
    )
    .optional(),
  awards: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

export const RewriteModelResponseSchema = z.object({
  markdown: z.string(),
  json: ResumeDataSchema,
});

export const RewriteResponseSchema = RewriteModelResponseSchema.extend({
  rewrite_id: z.string().uuid().nullable().optional(),
  analysis_id: z.string().uuid().nullable().optional(),
  resume_name: z.string().max(255).optional(),
  template_id: ResumeTemplateIdSchema.optional(),
  latex_source: z.string().optional(),
  photo_path: z.string().nullable().optional(),
});

export const ResumeRewriteSaveSchema = z.object({
  json: ResumeDataSchema,
  markdown: z.string().max(100_000),
  latex_source: z.string().min(50).max(150_000),
  template_id: ResumeTemplateIdSchema,
  photo_path: z.string().max(1024).nullable().optional(),
});

export const ExportRequestSchema = z.object({
  rewriteJson: ResumeDataSchema,
  format: z.literal("docx"),
});

// Type exports
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;
export type ResumeTemplateId = z.infer<typeof ResumeTemplateIdSchema>;
export type RewriteModelResponse = z.infer<typeof RewriteModelResponseSchema>;
export type RewriteResponse = z.infer<typeof RewriteResponseSchema>;
export type ResumeRewriteSave = z.infer<typeof ResumeRewriteSaveSchema>;
export type ExportRequest = z.infer<typeof ExportRequestSchema>;
export type BulletSuggestion = z.infer<typeof BulletSuggestionSchema>;
export type KeywordMatch = z.infer<typeof KeywordMatchSchema>;
