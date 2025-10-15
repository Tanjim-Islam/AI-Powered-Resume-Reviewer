"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { RewritePreview } from "@/components/rewrite-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, FileText } from "lucide-react";
import { RewriteResponse } from "@/lib/schemas";

export default function RewritePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [rewriteData, setRewriteData] = useState<RewriteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRewrite = async () => {
    if (!resumeText.trim()) {
      setError("Please enter your resume text");
      return;
    }

    setIsRewriting(true);
    setError(null);

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Rewrite failed");
      }

      const data = await response.json();
      setRewriteData(data);
    } catch (error) {
      console.error("Rewrite error:", error);
      setError(error instanceof Error ? error.message : "Rewrite failed");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleExport = async (format: "docx" | "pdf") => {
    if (!rewriteData) return;

    setIsExporting(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rewriteJson: rewriteData.json,
          format,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Export failed");
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        {!rewriteData ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                AI Resume Rewriter
              </h1>
              <p className="text-xl text-gray-600">
                Get a completely rewritten resume with improved content and
                structure
              </p>
            </div>

            <Card className="p-8 bg-white/80 backdrop-blur-sm border-white/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRewrite();
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume Text *
                  </label>
                  <Textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your current resume text here..."
                    className="min-h-64"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Character count: {resumeText.length}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description (Optional)
                  </label>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description to tailor the rewrite..."
                    className="min-h-32"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Character count: {jobDescription.length}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isRewriting || !resumeText.trim()}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg font-medium"
                >
                  {isRewriting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Rewriting Resume...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Rewrite Resume
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        ) : (
          <RewritePreview
            rewriteData={rewriteData}
            onExport={handleExport}
            isExporting={isExporting}
          />
        )}
      </div>
    </AppShell>
  );
}
