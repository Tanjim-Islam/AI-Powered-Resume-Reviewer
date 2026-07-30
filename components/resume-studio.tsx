"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  FileDown,
  ImagePlus,
  LayoutTemplate,
  Loader2,
  RefreshCw,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { StructuredResumeEditor } from "@/components/structured-resume-editor";
import { TemplatePicker } from "@/components/template-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  compileLatexToPdf,
  LatexCompileError,
  prewarmLatexCompiler,
  type LatexCompileProgress,
} from "@/lib/latex-compiler";
import { blobToUint8Array, prepareResumePhoto } from "@/lib/resume-photo";
import {
  DEFAULT_RESUME_TEMPLATE_ID,
  generateResumeLatex,
  generateResumeMarkdown,
  getResumeTemplate,
  upgradeResumeLatexContacts,
} from "@/lib/resume-templates";
import type {
  ResumeData,
  ResumeRewriteSave,
  ResumeTemplateId,
  RewriteResponse,
} from "@/lib/schemas";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ResumeStudioProps = {
  rewriteData: RewriteResponse;
  onSave: (payload: ResumeRewriteSave) => Promise<void>;
  onDownloadDocx: (data: ResumeData) => Promise<void>;
};

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function compactCompileError(log: string): string {
  const relevantLine = log
    .split("\n")
    .map((line) => line.trim())
    .find(
      (line) =>
        line.startsWith("!") ||
        line.includes("Undefined control sequence") ||
        line.includes("LaTeX Error")
    );

  return relevantLine?.replace(/^!\s*/, "") || "Check the LaTeX code and try again.";
}

export function ResumeStudio({
  rewriteData,
  onSave,
  onDownloadDocx,
}: ResumeStudioProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const autoCompileStarted = useRef(false);
  const pdfUrlRef = useRef<string | null>(null);

  const initialTemplateId =
    rewriteData.template_id ?? DEFAULT_RESUME_TEMPLATE_ID;
  const generatedInitialLatex = generateResumeLatex(
    initialTemplateId,
    rewriteData.json,
  );
  const initialLatexSource = rewriteData.latex_source
    ? upgradeResumeLatexContacts(rewriteData.latex_source, rewriteData.json)
    : generatedInitialLatex;
  const [activeTab, setActiveTab] = useState("preview");
  const [resumeData, setResumeData] = useState(rewriteData.json);
  const [templateId, setTemplateId] =
    useState<ResumeTemplateId>(initialTemplateId);
  const [latexSource, setLatexSource] = useState(initialLatexSource);
  const [photoPath, setPhotoPath] = useState<string | null>(
    rewriteData.photo_path ?? null
  );
  const [photoBytes, setPhotoBytes] = useState<Uint8Array | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isCustomLatex, setIsCustomLatex] = useState(
    initialLatexSource !== generatedInitialLatex,
  );
  const [fieldsChangedAfterLatex, setFieldsChangedAfterLatex] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] =
    useState<ResumeTemplateId | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] =
    useState<LatexCompileProgress | null>(null);
  const [compileLog, setCompileLog] = useState("");
  const [compiledSource, setCompiledSource] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const selectedTemplate = getResumeTemplate(templateId);
  const currentMarkdown = useMemo(
    () => generateResumeMarkdown(resumeData),
    [resumeData]
  );
  const pdfIsStale = compiledSource !== latexSource;

  useEffect(() => {
    prewarmLatexCompiler();
  }, []);

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
      if (photoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    if (!photoPath || !user) return;
    let active = true;

    const loadPhoto = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.storage
        .from("resume-assets")
        .download(photoPath);

      if (!active || error || !data) return;
      const bytes = await blobToUint8Array(data);
      if (!active) return;
      setPhotoBytes(bytes);
      setPhotoPreviewUrl(URL.createObjectURL(data));
    };

    void loadPhoto();
    return () => {
      active = false;
    };
  }, [photoPath, user]);

  const replacePdf = (bytes: Uint8Array) => {
    if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    const nextUrl = URL.createObjectURL(
      new Blob([new Uint8Array(bytes)], { type: "application/pdf" })
    );
    pdfUrlRef.current = nextUrl;
    setPdfUrl(nextUrl);
    setPdfBytes(bytes);
  };

  const compileCurrent = useCallback(async () => {
    if (isCompiling) return null;
    setIsCompiling(true);
    setCompileLog("");
    setCompileProgress({ stage: "starting", detail: "Loading compiler" });

    try {
      const result = await compileLatexToPdf({
        source: latexSource,
        photo: photoBytes,
        onProgress: setCompileProgress,
      });
      replacePdf(result.pdf);
      setCompileLog(result.log);
      setCompiledSource(latexSource);
      return result.pdf;
    } catch (error) {
      const message =
        error instanceof LatexCompileError
          ? compactCompileError(error.log)
          : "The PDF could not be rendered.";
      if (error instanceof LatexCompileError) setCompileLog(error.log);
      toast.error(message);
      return null;
    } finally {
      setIsCompiling(false);
      setCompileProgress(null);
    }
  }, [isCompiling, latexSource, photoBytes]);

  useEffect(() => {
    if (activeTab !== "preview" || autoCompileStarted.current) return;
    autoCompileStarted.current = true;
    const timer = window.setTimeout(() => void compileCurrent(), 250);
    return () => window.clearTimeout(timer);
  }, [activeTab, compileCurrent]);

  const applyTemplate = (nextTemplateId: ResumeTemplateId) => {
    setTemplateId(nextTemplateId);
    setLatexSource(generateResumeLatex(nextTemplateId, resumeData));
    setIsCustomLatex(false);
    setFieldsChangedAfterLatex(false);
    setPendingTemplateId(null);
    setCompiledSource(null);
    setIsDirty(true);
  };

  const chooseTemplate = (nextTemplateId: ResumeTemplateId) => {
    if (nextTemplateId === templateId) return;
    if (isCustomLatex) {
      setPendingTemplateId(nextTemplateId);
      return;
    }
    applyTemplate(nextTemplateId);
  };

  const updateResumeData = (nextData: ResumeData) => {
    setResumeData(nextData);
    setIsDirty(true);
    setCompiledSource(null);
    if (isCustomLatex) {
      setFieldsChangedAfterLatex(true);
    } else {
      setLatexSource(generateResumeLatex(templateId, nextData));
    }
  };

  const regenerateLatex = () => {
    setLatexSource(generateResumeLatex(templateId, resumeData));
    setIsCustomLatex(false);
    setFieldsChangedAfterLatex(false);
    setCompiledSource(null);
    setIsDirty(true);
  };

  const handleLatexChange = (value: string) => {
    setLatexSource(value);
    setIsCustomLatex(true);
    setFieldsChangedAfterLatex(false);
    setCompiledSource(null);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    try {
      await onSave({
        json: resumeData,
        markdown: currentMarkdown,
        latex_source: latexSource,
        template_id: templateId,
        photo_path: photoPath,
      });
      setIsDirty(false);
      toast.success(user ? "Resume saved." : "Changes kept for this session.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the resume."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhoto = async (file: File | null) => {
    if (!file) return;
    setIsUploadingPhoto(true);

    try {
      const prepared = await prepareResumePhoto(file);
      const bytes = await blobToUint8Array(prepared);
      const previewUrl = URL.createObjectURL(prepared);
      setPhotoBytes(bytes);
      setPhotoPreviewUrl(previewUrl);
      setCompiledSource(null);
      setIsDirty(true);

      if (user) {
        const supabase = getSupabaseBrowserClient();
        const nextPath = `${user.id}/profile-photo.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("resume-assets")
          .upload(nextPath, prepared, {
            contentType: "image/jpeg",
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw new Error("Photo could not be saved to your account.");
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ resume_photo_path: nextPath })
          .eq("id", user.id);

        if (profileError) {
          throw new Error("Photo was uploaded but the profile was not updated.");
        }

        setPhotoPath(nextPath);
      }

      toast.success("Photo ready.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Photo upload failed."
      );
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = async () => {
    if (user && photoPath) {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.storage
        .from("resume-assets")
        .remove([photoPath]);
      if (error) {
        toast.error("Could not remove the saved photo.");
        return;
      }
      await supabase
        .from("profiles")
        .update({ resume_photo_path: null })
        .eq("id", user.id);
    }

    setPhotoBytes(null);
    setPhotoPath(null);
    setPhotoPreviewUrl(null);
    setCompiledSource(null);
    setIsDirty(true);
  };

  const setTemplateAsDefault = async () => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("profiles")
      .update({ preferred_template_id: templateId })
      .eq("id", user.id);
    if (error) {
      toast.error("Could not update your default template.");
    } else {
      toast.success("Default template updated.");
    }
  };

  const downloadPdf = async () => {
    let bytes = pdfBytes;
    if (!bytes || pdfIsStale) bytes = await compileCurrent();
    if (!bytes) return;
    downloadBlob(
      new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
      `${resumeData.header.name || "resume"}.pdf`
    );
  };

  const downloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      await onDownloadDocx(resumeData);
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Resume studio</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            AI-rewritten resume
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Edit the content, template, or LaTeX source.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="bg-teal-600 text-white hover:bg-teal-700"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isDirty ? (
            <Save className="size-4" />
          ) : (
            <Check className="size-4" />
          )}
          {isSaving ? "Saving" : isDirty ? "Save changes" : "Saved"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5 grid h-auto w-full grid-cols-4 bg-gray-100/90 p-1">
          <TabsTrigger value="preview" className="gap-2 py-2">
            <Eye className="size-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-2 py-2">
            <Settings2 className="size-4" />
            <span className="hidden sm:inline">Edit</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2 py-2">
            <LayoutTemplate className="size-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="latex" className="gap-2 py-2">
            <Code2 className="size-4" />
            <span className="hidden sm:inline">LaTeX</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-0">
          <Card className="gap-0 overflow-hidden border-white/50 bg-white/90 p-0 shadow-lg shadow-teal-950/5">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedTemplate.name}
                </p>
                <p className="text-xs text-gray-500">
                  {pdfIsStale && pdfUrl
                    ? "Preview needs an update"
                    : "Compiled in your browser"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void compileCurrent()}
                  disabled={isCompiling}
                >
                  {isCompiling ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  {isCompiling ? "Rendering" : "Render PDF"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void downloadPdf()}
                  disabled={isCompiling}
                  className="bg-teal-600 text-white hover:bg-teal-700"
                >
                  <Download className="size-4" />
                  PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void downloadDocx()}
                  disabled={isExportingDocx}
                >
                  {isExportingDocx ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileDown className="size-4" />
                  )}
                  DOCX
                </Button>
              </div>
            </div>

            <div className="min-h-[720px] bg-[#e8eaed] p-3 sm:p-5">
              {isCompiling && !pdfUrl ? (
                <div className="flex min-h-[680px] items-center justify-center">
                  <div className="rounded-xl bg-white px-6 py-5 text-center shadow-sm">
                    <Loader2 className="mx-auto size-6 animate-spin text-teal-600" />
                    <p className="mt-3 text-sm font-medium text-gray-800">
                      Preparing the PDF
                    </p>
                    <p className="mt-1 max-w-xs text-xs text-gray-500">
                      {compileProgress?.detail || "Loading LaTeX packages"}
                    </p>
                  </div>
                </div>
              ) : pdfUrl ? (
                <iframe
                  key={pdfUrl}
                  src={pdfUrl}
                  title="Resume PDF preview"
                  className="mx-auto min-h-[680px] w-full max-w-[900px] rounded-md border-0 bg-white shadow-xl"
                />
              ) : (
                <div className="flex min-h-[680px] items-center justify-center">
                  <Button
                    type="button"
                    onClick={() => void compileCurrent()}
                    className="bg-teal-600 text-white hover:bg-teal-700"
                  >
                    <FileDown className="size-4" />
                    Render PDF
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="mt-0">
          <StructuredResumeEditor
            value={resumeData}
            onChange={updateResumeData}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <Card className="gap-0 border-white/50 bg-white/85 p-0 shadow-lg shadow-teal-950/5">
            <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Choose a template</h2>
                <p className="text-sm text-gray-500">
                  Switching templates keeps your resume content.
                </p>
              </div>
              {user && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void setTemplateAsDefault()}
                >
                  Set as default
                </Button>
              )}
            </div>

            <div className="space-y-5 p-5">
              {pendingTemplateId && (
                <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-amber-900">
                    Switching replaces your manual LaTeX edits.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingTemplateId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => applyTemplate(pendingTemplateId)}
                      className="bg-amber-900 text-white hover:bg-amber-950"
                    >
                      Switch
                    </Button>
                  </div>
                </div>
              )}

              <TemplatePicker value={templateId} onChange={chooseTemplate} />

              {selectedTemplate.photo === "optional" && (
                <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {photoPreviewUrl ? (
                      <div className="size-20 overflow-hidden rounded-lg border border-white bg-white shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoPreviewUrl}
                          alt="Resume portrait preview"
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-20 items-center justify-center rounded-lg border border-dashed border-teal-300 bg-white/70 text-teal-600">
                        <ImagePlus className="size-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {photoPreviewUrl
                          ? "Portrait added"
                          : "Would you like to upload a portrait?"}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Optional. Use a clear, square JPG, PNG, or WebP image.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                      >
                        {isUploadingPhoto ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <ImagePlus className="size-4" />
                        )}
                        {photoPreviewUrl ? "Replace" : "Upload"}
                      </Button>
                      {photoPreviewUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove portrait"
                          onClick={() => void removePhoto()}
                          className="text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) =>
                  void handlePhoto(event.target.files?.[0] ?? null)
                }
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="latex" className="mt-0">
          <Card className="gap-0 overflow-hidden border-white/50 bg-white/90 p-0 shadow-lg shadow-teal-950/5">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">LaTeX source</h2>
                <p className="text-sm text-gray-500">
                  Edit and render the complete document.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(latexSource);
                    toast.success("LaTeX copied.");
                  }}
                >
                  <Copy className="size-4" />
                  Copy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={regenerateLatex}
                >
                  <RefreshCw className="size-4" />
                  Reset
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setActiveTab("preview");
                    void compileCurrent();
                  }}
                  disabled={isCompiling}
                  className="bg-teal-600 text-white hover:bg-teal-700"
                >
                  {isCompiling ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                  Render
                </Button>
              </div>
            </div>

            {fieldsChangedAfterLatex && (
              <div className="flex flex-col gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-amber-900">
                  Resume fields changed after manual LaTeX edits.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={regenerateLatex}
                  className="border-amber-300 bg-white"
                >
                  Use updated fields
                </Button>
              </div>
            )}

            <Textarea
              value={latexSource}
              onChange={(event) => handleLatexChange(event.target.value)}
              spellCheck={false}
              aria-label="LaTeX source code"
              className="min-h-[680px] resize-y rounded-none border-0 bg-[#111827] p-5 font-mono text-[13px] leading-6 text-slate-100 focus-visible:ring-0"
            />

            {compileLog && (
              <details className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                <summary className="cursor-pointer font-medium">
                  Compilation details
                </summary>
                <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap font-mono">
                  {compileLog}
                </pre>
              </details>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
