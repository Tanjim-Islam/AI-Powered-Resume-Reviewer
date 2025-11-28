"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BarChart3,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  Sparkles,
  TrendingUp,
  FileText,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { AnalyzeResponse } from "@/lib/schemas";
import { toast } from "sonner";

type AnalyzeWithSource = AnalyzeResponse & {
  original_resume_text?: string;
  job_description?: string;
};

function AnalyzePageContent() {
  const [analysis, setAnalysis] = useState<AnalyzeWithSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRewriting, setIsRewriting] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const action = searchParams.get("action");

  useEffect(() => {
    // Check if this is a sample analysis request
    if (action === "sample") {
      // Load sample data
      setAnalysis(getSampleAnalysis());
      setIsLoading(false);
    } else {
      // Get analysis from sessionStorage for real analysis
      const storedAnalysis = sessionStorage.getItem("resumeAnalysis");
      if (storedAnalysis) {
        setAnalysis(JSON.parse(storedAnalysis));
      }
      setIsLoading(false);
    }
  }, [action]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!downloadMenuRef.current) return;
      if (!downloadMenuRef.current.contains(e.target as Node)) {
        setShowDownloadMenu(false);
      }
    }
    if (showDownloadMenu) {
      document.addEventListener("click", onDocClick);
    }
    return () => document.removeEventListener("click", onDocClick);
  }, [showDownloadMenu]);

  // Sample analysis data
  const getSampleAnalysis = (): AnalyzeResponse => {
    return {
      ats_score: 78,
      keyword_match: {
        matched: [
          "project management",
          "leadership",
          "team collaboration",
          "strategic planning",
          "budget management",
        ],
        missing: [
          "agile methodology",
          "stakeholder management",
          "risk assessment",
          "change management",
        ],
      },
      bullet_suggestions: [
        {
          original: "Managed team of 5 developers",
          improved:
            "Led a high-performing team of 5 developers, implementing agile methodologies that increased productivity by 25%",
          rationale: "Added quantifiable impact and specific methodology",
        },
        {
          original: "Worked on various projects",
          improved:
            "Directed 15+ cross-functional projects from conception to completion, consistently delivering on time and under budget",
          rationale: "Added specificity and demonstrated leadership",
        },
        {
          original: "Handled client communications",
          improved:
            "Served as primary client liaison, managing expectations and resolving issues to maintain 98% client satisfaction rate",
          rationale: "Added measurable outcomes and specific responsibilities",
        },
      ],
      missing_sections: ["Professional Summary", "Certifications"],
      formatting_tips: [
        "Use consistent bullet point formatting",
        "Add quantifiable achievements where possible",
        "Include industry-specific keywords",
        "Keep resume to 1-2 pages",
      ],
      inferred_structure: {
        sectionsPresent: [
          "Contact Information",
          "Professional Experience",
          "Education",
          "Skills",
        ],
        sectionsMissing: ["Professional Summary", "Certifications", "Projects"],
      },
    };
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!", { position: "top-center" });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleRewriteFull = async () => {
    if (action === "sample" || !analysis?.original_resume_text) {
      toast.error(
        "Cannot rewrite from sample data. Upload your resume first.",
        {
          position: "top-center",
        }
      );
      return;
    }

    setIsRewriting(true);
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: analysis.original_resume_text,
          jobDescription: analysis.job_description || undefined,
          analysis,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Rewrite failed");
      }

      const data = await response.json();
      sessionStorage.setItem("rewriteResult", JSON.stringify(data));
      window.location.href = "/rewrite";
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Rewrite failed", {
        position: "top-center",
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const downloadJson = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setShowDownloadMenu(false);
  };

  const generateAnalysisMarkdown = (a: AnalyzeResponse): string => {
    const matched = a.keyword_match.matched.join(", ");
    const missing = a.keyword_match.missing.join(", ");
    const bullets = a.bullet_suggestions
      .map(
        (b, i) =>
          `- ${i + 1}.\n  Original: ${b.original}\n  Improved: ${b.improved}` +
          (b.rationale ? `\n  Rationale: ${b.rationale}` : "")
      )
      .join("\n\n");
    const missingSections = a.missing_sections.map((s) => `- ${s}`).join("\n");
    const tips = a.formatting_tips.map((t) => `- ${t}`).join("\n");
    return `# Resume Analysis\n\n**ATS Score:** ${a.ats_score}\n\n## Keyword Match\n**Matched:** ${matched}\n\n**Missing:** ${missing}\n\n## Bullet Suggestions\n${bullets}\n\n## Missing Sections\n${missingSections}\n\n## Formatting Tips\n${tips}\n`;
  };

  const downloadMarkdown = () => {
    if (!analysis) return;
    const md = generateAnalysisMarkdown(analysis);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setShowDownloadMenu(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analysis...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!analysis) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              No Analysis Found
            </h1>
            <p className="text-gray-600 mb-8">
              Please upload a resume first to see the analysis.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Upload Resume
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const keywordMatchPercentage =
    analysis.keyword_match.matched.length > 0
      ? Math.round(
          (analysis.keyword_match.matched.length /
            (analysis.keyword_match.matched.length +
              analysis.keyword_match.missing.length)) *
            100
        )
      : 0;

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Resume Analysis Results
          </h1>
          <p className="text-gray-600">
            Here&apos;s your detailed ATS analysis and improvement suggestions
          </p>
          {action === "sample" && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-blue-800">
                <span className="text-2xl">🎭</span>
                <span className="font-medium">Sample Analysis</span>
                <span className="text-sm text-blue-600">
                  (This is demo data - upload your resume for personalized
                  results)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Score Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* ATS Score */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">ATS Score</h3>
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-center">
              <div
                className={`text-4xl font-bold mb-2 ${getScoreColor(
                  analysis.ats_score
                )}`}
              >
                {analysis.ats_score}
              </div>
              <Progress value={analysis.ats_score} className="mb-2" />
              <p className="text-sm text-gray-600">
                {analysis.ats_score >= 80
                  ? "Excellent"
                  : analysis.ats_score >= 60
                  ? "Good"
                  : "Needs Improvement"}
              </p>
            </div>
          </Card>

          {/* Keyword Match */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Keyword Match
              </h3>
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-center">
              <div
                className={`text-4xl font-bold mb-2 ${getScoreColor(
                  keywordMatchPercentage
                )}`}
              >
                {keywordMatchPercentage}%
              </div>
              <Progress value={keywordMatchPercentage} className="mb-2" />
              <p className="text-sm text-gray-600">
                {analysis.keyword_match.matched.length} matched,{" "}
                {analysis.keyword_match.missing.length} missing
              </p>
            </div>
          </Card>
        </div>

        {/* Keyword Analysis */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-teal-600" />
            Keyword Analysis
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Matched Keywords */}
            <div>
              <h4 className="font-medium text-green-700 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Matched Keywords ({analysis.keyword_match.matched.length})
              </h4>
              <div className="space-y-2">
                {analysis.keyword_match.matched.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-green-50 p-2 rounded"
                  >
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {keyword}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(keyword)}
                      className="hover:bg-teal-50 hover:text-teal-700 ring-1 ring-transparent hover:ring-teal-200 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div>
              <h4 className="font-medium text-red-700 mb-3 flex items-center">
                <XCircle className="w-4 h-4 mr-2" />
                Missing Keywords ({analysis.keyword_match.missing.length})
              </h4>
              <div className="space-y-2">
                {analysis.keyword_match.missing.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-red-50 p-2 rounded"
                  >
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800"
                    >
                      {keyword}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(keyword)}
                      className="hover:bg-teal-50 hover:text-teal-700 ring-1 ring-transparent hover:ring-teal-200 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Bullet Suggestions */}
        {analysis.bullet_suggestions.length > 0 && (
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-teal-600" />
              Bullet Point Improvements
            </h3>

            <div className="space-y-4">
              {analysis.bullet_suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">
                        Original:
                      </h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {suggestion.original}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">
                        Improved:
                      </h5>
                      <p className="text-sm text-gray-600 bg-teal-50 p-3 rounded">
                        {suggestion.improved}
                      </p>
                    </div>
                  </div>
                  {suggestion.rationale && (
                    <div className="mt-3">
                      <h6 className="font-medium text-gray-700 mb-1">
                        Why this change:
                      </h6>
                      <p className="text-sm text-gray-600">
                        {suggestion.rationale}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Formatting Tips */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-teal-600" />
            Formatting Tips
          </h3>

          <Accordion type="single" collapsible className="w-full">
            {analysis.formatting_tips.map((tip, index) => (
              <AccordionItem key={index} value={`tip-${index}`}>
                <AccordionTrigger className="text-left">
                  Tip {index + 1}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">{tip}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Missing Sections */}
        {analysis.missing_sections.length > 0 && (
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Missing Sections
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missing_sections.map((section, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-orange-300 text-orange-700"
                >
                  {section}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className={`bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 ${
              action === "sample" ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onClick={handleRewriteFull}
          >
            {isRewriting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Rewriting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Rewrite Full Resume
              </>
            )}
          </Button>
          <div className="relative" ref={downloadMenuRef}>
            <Button
              variant="outline"
              size="lg"
              className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-3"
              onClick={() => setShowDownloadMenu((s) => !s)}
            >
              <Download className="w-5 h-5 mr-2" />
              Download Analysis
            </Button>
            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-1">
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-teal-50 hover:text-teal-700"
                  onClick={downloadJson}
                >
                  JSON (.json)
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-teal-50 hover:text-teal-700"
                  onClick={downloadMarkdown}
                >
                  Markdown (.md)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analysis...</p>
            </div>
          </div>
        </AppShell>
      }
    >
      <AnalyzePageContent />
    </Suspense>
  );
}
