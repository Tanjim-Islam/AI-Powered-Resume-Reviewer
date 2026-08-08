"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/app-shell";
import { toast } from "sonner";

const uploadSchema = z
  .object({
    resumeFile: z.any().optional(),
    resumeText: z.string().optional(),
    jobDescription: z.string().optional(),
  })
  .refine((data) => data.resumeFile || data.resumeText, {
    message: "Please upload a resume file or paste resume text",
    path: ["resumeFile"],
  });

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadFormProps {
  onAnalyze: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

export function UploadForm({ onAnalyze, isLoading }: UploadFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [useTextInput, setUseTextInput] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    watch,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const jobDescription = watch("jobDescription") || "";

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (validateFile(file)) {
          setSelectedFile(file);
          setResumeText("");
          setValue("resumeText", "");
          setValue("resumeFile", file, { shouldValidate: true });
          clearErrors("resumeFile");
          setUseTextInput(false);
        }
      }
    },
    [clearErrors, setValue]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (validateFile(file)) {
          setSelectedFile(file);
          setResumeText("");
          setValue("resumeText", "");
          setValue("resumeFile", file, { shouldValidate: true });
          clearErrors("resumeFile");
          setUseTextInput(false);
        }
      }
    },
    [clearErrors, setValue]
  );

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or DOCX file.");
      return false;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("File size must be less than 4MB.");
      return false;
    }

    return true;
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValue("resumeFile", undefined, { shouldValidate: true });
  };

  const onSubmit = async (data: UploadFormData) => {
    const formData = new FormData();

    if (selectedFile) {
      formData.append("resumeFile", selectedFile);
    } else if (resumeText) {
      formData.append("resumeText", resumeText);
    }

    if (data.jobDescription) {
      formData.append("jobDescription", data.jobDescription);
    }

    await onAnalyze(formData);
  };

  return (
    <GlassCard className="p-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Upload Your Resume
          </h2>
          <p className="text-gray-600">
            Get instant ATS feedback and AI-powered improvements
          </p>
        </div>

        {/* File Upload Section */}
        {!useTextInput ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-teal-500 bg-teal-50"
                : "border-gray-300 hover:border-teal-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-8 w-8 shrink-0 text-teal-600" />
                  <div className="min-w-0 flex-1 text-left">
                    <p
                      className="line-clamp-2 break-all font-medium text-gray-800"
                      title={selectedFile.name}
                    >
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="shrink-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drag and drop your resume here
                  </p>
                  <p className="text-gray-500">or</p>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                    aria-label="Upload resume file"
                    title="Upload resume file"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    className="mt-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Choose File
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Supports PDF and DOCX files up to 4MB
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setValue("resumeText", e.target.value, {
                  shouldValidate: true,
                });
                clearErrors("resumeFile");
              }}
              className="min-h-32"
            />
            <p className="text-sm text-gray-500">
              Character count: {resumeText.length}
            </p>
          </div>
        )}

        {/* Toggle between file upload and text input */}
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const nextUseTextInput = !useTextInput;
              setUseTextInput(nextUseTextInput);
              if (nextUseTextInput) {
                setSelectedFile(null);
                setValue("resumeFile", undefined);
                clearErrors("resumeFile");
              } else {
                setResumeText("");
                setValue("resumeText", "");
                clearErrors("resumeFile");
              }
            }}
            className="text-teal-600 hover:text-teal-700"
          >
            {useTextInput ? "Upload File Instead" : "Paste Text Instead"}
          </Button>
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Job Description (Optional)
          </label>
          <Textarea
            {...register("jobDescription")}
            placeholder="Paste the job description to get tailored feedback..."
            className="min-h-24"
          />
          <p className="text-sm text-gray-500">
            Character count: {jobDescription.length}
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || (!selectedFile && !resumeText)}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            "Analyze Resume"
          )}
        </Button>

        {errors.resumeFile && (
          <p className="text-red-500 text-sm text-center">
            {String(errors.resumeFile.message)}
          </p>
        )}
      </form>
    </GlassCard>
  );
}
