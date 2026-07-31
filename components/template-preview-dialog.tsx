"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileWarning, Loader2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  compileLatexToPdf,
  type LatexCompileProgress,
} from "@/lib/latex-compiler";
import {
  generateResumeLatex,
  type ResumeTemplate,
} from "@/lib/resume-templates";
import type { ResumeTemplateId } from "@/lib/schemas";
import { templatePreviewResumeData } from "@/lib/template-preview-data";

const previewPdfCache = new Map<ResumeTemplateId, Uint8Array>();

export function TemplatePreviewDialog({
  template,
  onClose,
}: {
  template: ResumeTemplate;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const pdfUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [progress, setProgress] = useState<LatexCompileProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const replacePdf = useCallback((bytes: Uint8Array) => {
    if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    const nextUrl = URL.createObjectURL(
      new Blob([new Uint8Array(bytes)], { type: "application/pdf" })
    );
    pdfUrlRef.current = nextUrl;
    setPdfUrl(nextUrl);
  }, []);

  const renderPreview = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsRendering(true);
    setError(null);
    setProgress({ stage: "starting", detail: "Loading the PDF renderer" });

    try {
      const cached = previewPdfCache.get(template.id);
      const bytes =
        cached ??
        (
          await compileLatexToPdf({
            source: generateResumeLatex(
              template.id,
              templatePreviewResumeData
            ),
            onProgress: setProgress,
          })
        ).pdf;

      if (requestId !== requestIdRef.current) return;
      previewPdfCache.set(template.id, bytes);
      replacePdf(bytes);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setError(
        "This template preview could not be rendered. Please try again."
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsRendering(false);
        setProgress(null);
      }
    }
  }, [replacePdf, template.id]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    void renderPreview();

    return () => {
      requestIdRef.current += 1;
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    };
  }, [renderPreview]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="template-preview-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto h-[94dvh] w-[min(96vw,1120px)] max-w-none overflow-hidden rounded-2xl border border-white/70 bg-white p-0 shadow-2xl backdrop:bg-slate-950/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
              Full template preview
            </p>
            <h2
              id="template-preview-title"
              className="truncate text-base font-semibold text-gray-950 sm:text-lg"
            >
              {template.name}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close template preview"
            autoFocus
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 bg-[#e8eaed] p-2 sm:p-4">
          {isRendering && !pdfUrl ? (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-2xl border border-white bg-white/95 px-8 py-7 text-center shadow-xl shadow-slate-900/10">
                <Loader2 className="mx-auto size-7 animate-spin text-teal-600" />
                <p className="mt-3 text-sm font-semibold text-gray-900">
                  Rendering the real template
                </p>
                <p className="mt-1 max-w-xs text-xs text-gray-500">
                  {progress?.detail || "Preparing a sample resume"}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-sm rounded-2xl border border-red-100 bg-white px-7 py-6 text-center shadow-lg">
                <FileWarning className="mx-auto size-7 text-red-500" />
                <p className="mt-3 text-sm font-medium text-gray-900">{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void renderPreview()}
                  className="mt-4"
                >
                  <RefreshCw className="size-4" />
                  Try again
                </Button>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={`${template.name} sample resume PDF`}
              className="h-full w-full rounded-lg border-0 bg-white shadow-xl"
            />
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
