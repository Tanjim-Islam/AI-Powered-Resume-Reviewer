"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ResumeStudio } from "@/components/resume-studio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { readApiResponse } from "@/lib/api-response";
import { prewarmLatexCompiler } from "@/lib/latex-compiler";
import type {
  ResumeData,
  ResumeRewriteSave,
  RewriteResponse,
} from "@/lib/schemas";

function RewritePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rewriteId = searchParams.get("id");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoadingSaved, setIsLoadingSaved] = useState(Boolean(rewriteId));
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteData, setRewriteData] = useState<RewriteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      if (rewriteId) {
        setIsLoadingSaved(true);
        try {
          const response = await fetch(`/api/rewrite/${rewriteId}`, {
            cache: "no-store",
          });
          const saved = await readApiResponse<RewriteResponse>(
            response,
            "Could not load this saved resume."
          );
          if (active) setRewriteData(saved);
        } catch (loadError) {
          if (active) {
            toast.error(
              loadError instanceof Error
                ? loadError.message
                : "Could not load this saved resume."
            );
          }
        } finally {
          if (active) setIsLoadingSaved(false);
        }
        return;
      }

      try {
        const stored = sessionStorage.getItem("rewriteResult");
        if (stored && active) {
          setRewriteData(JSON.parse(stored) as RewriteResponse);
        }
      } catch {
        sessionStorage.removeItem("rewriteResult");
      }
    };

    void hydrate();
    return () => {
      active = false;
    };
  }, [rewriteId]);

  const handleRewrite = async () => {
    if (resumeText.trim().length < 200) {
      setError("Enter at least 200 characters from your resume.");
      return;
    }

    setIsRewriting(true);
    setError(null);
    prewarmLatexCompiler();

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim() || undefined,
          resumeName: "Pasted resume",
        }),
      });

      const data = await readApiResponse<RewriteResponse>(
        response,
        "Resume rewriting is temporarily unavailable. Please try again."
      );
      setRewriteData(data);
      sessionStorage.setItem("rewriteResult", JSON.stringify(data));
      if (data.rewrite_id) {
        router.replace(`/rewrite?id=${data.rewrite_id}`);
      }
    } catch (rewriteError) {
      setError(
        rewriteError instanceof Error ? rewriteError.message : "Rewrite failed."
      );
    } finally {
      setIsRewriting(false);
    }
  };

  const handleSave = async (payload: ResumeRewriteSave) => {
    const nextData: RewriteResponse = {
      ...rewriteData!,
      ...payload,
    };

    if (rewriteData?.rewrite_id) {
      const response = await fetch(`/api/rewrite/${rewriteData.rewrite_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await readApiResponse<RewriteResponse>(
        response,
        "Could not save this resume."
      );
      setRewriteData(saved);
      sessionStorage.setItem("rewriteResult", JSON.stringify(saved));
      return;
    }

    setRewriteData(nextData);
    sessionStorage.setItem("rewriteResult", JSON.stringify(nextData));
  };

  const handleDownloadDocx = async (data: ResumeData) => {
    const response = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewriteJson: data, format: "docx" }),
    });

    if (!response.ok) {
      await readApiResponse(
        response,
        "Resume export is temporarily unavailable. Please try again."
      );
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${data.header.name || "resume"}.docx`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        {isLoadingSaved ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="size-7 animate-spin text-teal-600" />
          </div>
        ) : rewriteData ? (
          <ResumeStudio
            rewriteData={rewriteData}
            onSave={handleSave}
            onDownloadDocx={handleDownloadDocx}
          />
        ) : (
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <p className="text-sm font-medium text-teal-700">Resume studio</p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight text-gray-900">
                Rewrite your resume
              </h1>
              <p className="mt-2 text-gray-600">
                Create an editable resume with professional PDF templates.
              </p>
            </div>

            <Card className="border-white/40 bg-white/85 p-6 shadow-lg backdrop-blur-xl sm:p-8">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleRewrite();
                }}
                className="space-y-6"
              >
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-gray-700">
                    Resume text
                  </span>
                  <Textarea
                    value={resumeText}
                    onChange={(event) => setResumeText(event.target.value)}
                    placeholder="Paste your current resume text"
                    className="min-h-64 border-gray-200 bg-white"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-gray-700">
                    Job description
                    <span className="ml-1 font-normal text-gray-400">
                      Optional
                    </span>
                  </span>
                  <Textarea
                    value={jobDescription}
                    onChange={(event) =>
                      setJobDescription(event.target.value)
                    }
                    placeholder="Paste the role you are targeting"
                    className="min-h-32 border-gray-200 bg-white"
                  />
                </label>

                {error && (
                  <p className="text-sm font-medium text-red-600">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isRewriting || resumeText.trim().length < 200}
                  className="w-full bg-teal-600 py-3 text-white hover:bg-teal-700"
                >
                  {isRewriting ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <FileText className="size-5" />
                  )}
                  {isRewriting ? "Rewriting" : "Rewrite resume"}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function RewritePage() {
  return (
    <Suspense fallback={null}>
      <RewritePageContent />
    </Suspense>
  );
}
