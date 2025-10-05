"use client";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Target, CheckCircle, AlertCircle } from "lucide-react";

export default function AboutPage() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              About ATS Systems
            </h1>
            <p className="text-xl text-gray-600">
              Understanding how Applicant Tracking Systems work and why they
              matter for your job search
            </p>
          </div>

          {/* What is ATS */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-white/20 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-teal-600" />
              What is an ATS?
            </h2>
            <p className="text-gray-600 mb-4">
              An Applicant Tracking System (ATS) is software used by employers
              to manage job applications. It automatically screens resumes
              before they reach human recruiters, filtering candidates based on
              keywords, formatting, and other criteria.
            </p>
            <p className="text-gray-600">
              Over 75% of large companies use ATS systems, making it crucial for
              job seekers to optimize their resumes for these systems.
            </p>
          </Card>

          {/* How ATS Works */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-white/20 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Target className="w-6 h-6 mr-3 text-teal-600" />
              How ATS Systems Work
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Resume Parsing
                </h3>
                <p className="text-sm text-gray-600">
                  The ATS extracts text from your resume, converting it into a
                  searchable format
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Keyword Matching
                </h3>
                <p className="text-sm text-gray-600">
                  Your resume is compared against the job description for
                  relevant keywords and skills
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Scoring & Ranking
                </h3>
                <p className="text-sm text-gray-600">
                  Resumes are scored and ranked based on relevance, with top
                  candidates forwarded to recruiters
                </p>
              </div>
            </div>
          </Card>

          {/* ATS Scoring Criteria */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-white/20 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              ATS Scoring Criteria
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  What ATS Systems Look For
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-600">
                      Relevant keywords from job description
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-600">
                      Clear section headers (Experience, Education, Skills)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-600">
                      Standard file formats (PDF, DOCX)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-600">
                      Quantifiable achievements and metrics
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-600">
                      Consistent formatting and structure
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  Common ATS Pitfalls
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-{C600 mr-2">✗</span>
                    <span className="text-gray-600">
                      Complex formatting, tables, or graphics
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span className="text-gray-600">
                      Uncommon fonts or creative layouts
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span className="text-gray-600">
                      Missing relevant keywords
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span className="text-gray-600">
                      Generic bullet points without impact
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span className="text-gray-600">
                      Inconsistent date formats
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Tips for ATS Optimization */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-white/20 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Tips for ATS Optimization
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Formatting Best Practices
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    • Use standard section headers (Experience, Education,
                    Skills)
                  </li>
                  <li>
                    • Stick to common fonts like Arial, Calibri, or Times New
                    Roman
                  </li>
                  <li>• Use bullet points instead of paragraphs</li>
                  <li>• Keep formatting simple and consistent</li>
                  <li>• Save as PDF or DOCX format</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Content Optimization
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Include relevant keywords from job descriptions</li>
                  <li>• Use action verbs to start bullet points</li>
                  <li>• Quantify achievements with numbers and metrics</li>
                  <li>• Tailor content to each specific job application</li>
                  <li>• Keep descriptions concise and impactful</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* How Our Tool Helps */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-white/20 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              How Our Tool Helps
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold text-lg">📊</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  ATS Score Analysis
                </h3>
                <p className="text-sm text-gray-600">
                  Get a detailed score showing how well your resume performs in
                  ATS systems
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold text-lg">🔍</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Keyword Matching
                </h3>
                <p className="text-sm text-gray-600">
                  Compare your resume against job descriptions to identify
                  missing keywords
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold text-lg">✨</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  AI Improvements
                </h3>
                <p className="text-sm text-gray-600">
                  Get AI-powered suggestions to improve your resume content and
                  structure
                </p>
              </div>
            </div>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Ready to Optimize Your Resume?
            </h2>
            <p className="text-gray-600 mb-6">
              Upload your resume and get instant feedback on how to improve your
              ATS score
            </p>
            <a
              href="/"
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Get Started Now
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
