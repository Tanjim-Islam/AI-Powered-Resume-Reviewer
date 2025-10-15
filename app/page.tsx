"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { UploadForm } from "@/components/upload-form";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAnimations } from "@/hooks/use-animations";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  // Initialize animations
  useAnimations();

  const handleAnalyze = async (formData: FormData) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Analysis failed");
      }

      const analysis = await response.json();

      // Store analysis in sessionStorage for the results page
      sessionStorage.setItem("resumeAnalysis", JSON.stringify(analysis));

      // Navigate to results page
      router.push("/analyze");
    } catch (error) {
      console.error("Analysis error:", error);
      alert(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRewrite = async () => {
    router.push("/rewrite");
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold text-gray-800 mb-6"
            data-animate="textReveal"
            data-delay="0.2"
          >
            AI-Powered Resume Review
          </h1>
          <p
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            data-animate="fadeInUp"
            data-delay="0.4"
          >
            Get instant ATS feedback, keyword analysis, and AI-powered
            improvements to land your dream job
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            data-animate="fadeInUp"
            data-delay="0.6"
          >
            <Button
              onClick={handleRewrite}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Rewrite Full Resume
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-3 text-lg"
              onClick={() => router.push("/analyze?action=sample")}
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Sample Analysis
            </Button>
          </div>
        </div>

        {/* Upload Form */}
        <div data-animate="scaleIn" data-delay="0.8" className="mb-12">
          <UploadForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
        </div>
      </div>
    </AppShell>
  );
}
