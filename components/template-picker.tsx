"use client";

import { useState } from "react";
import { Check, ExternalLink, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getResumeTemplate,
  resumeTemplates,
  type ResumeTemplate,
  type ResumeTemplateCategory,
} from "@/lib/resume-templates";
import type { ResumeTemplateId } from "@/lib/schemas";

const templateCategories: ReadonlyArray<{
  value: ResumeTemplateCategory | "all";
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "leadership", label: "Leadership" },
  { value: "technical", label: "Technical" },
  { value: "academic", label: "Academic" },
  { value: "specialized", label: "Specialized" },
  { value: "early-career", label: "Early career" },
];

function TemplateMiniature({ template }: { template: ResumeTemplate }) {
  const isTwoColumn = template.layout === "two-column";
  const isAcademic = template.layout === "academic";

  return (
    <div className="relative h-32 overflow-hidden rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <div
        className={cn(
          "mb-2 h-2 rounded-sm",
          isAcademic ? "w-1/2" : "mx-auto w-2/3"
        )}
        style={{ backgroundColor: template.accent }}
      />
      <div
        className={cn(
          "mb-3 h-1 rounded-full bg-gray-200",
          isAcademic ? "w-2/3" : "mx-auto w-1/2"
        )}
      />
      {template.photo === "optional" && (
        <div className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-sm bg-gray-100 text-gray-400">
          <ImageIcon className="size-3" />
        </div>
      )}
      <div className={cn("flex h-20 gap-2", isTwoColumn && "items-stretch")}>
        {isTwoColumn && (
          <div className="w-[32%] space-y-1.5 border-r border-gray-100 pr-2">
            <div
              className="h-1 w-4/5 rounded-full"
              style={{ backgroundColor: template.accent }}
            />
            <div className="h-1 w-full rounded-full bg-gray-100" />
            <div className="h-1 w-3/4 rounded-full bg-gray-100" />
            <div className="mt-2 h-1 w-2/3 rounded-full bg-gray-200" />
            <div className="h-1 w-full rounded-full bg-gray-100" />
          </div>
        )}
        <div className="flex-1 space-y-1.5">
          {[0, 1, 2].map((section) => (
            <div key={section} className="space-y-1">
              <div
                className="h-1 w-1/3 rounded-full"
                style={{ backgroundColor: template.accent }}
              />
              <div className="h-1 w-full rounded-full bg-gray-100" />
              <div className="h-1 w-5/6 rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TemplatePicker({
  value,
  onChange,
  compact = false,
}: {
  value: ResumeTemplateId;
  onChange: (templateId: ResumeTemplateId) => void;
  compact?: boolean;
}) {
  const selectedTemplate = getResumeTemplate(value);
  const [category, setCategory] = useState<
    ResumeTemplateCategory | "all"
  >("all");
  const visibleTemplates =
    category === "all"
      ? resumeTemplates
      : resumeTemplates.filter((template) => template.category === category);

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="Template category"
        className="flex flex-wrap gap-1.5"
      >
        {templateCategories.map((option) => {
          const active = category === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(option.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                active
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-gray-200 bg-white/70 text-gray-600 hover:border-teal-300 hover:text-teal-800"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "grid gap-3",
          compact
            ? "sm:grid-cols-2 xl:grid-cols-3"
            : "sm:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {visibleTemplates.map((template) => {
          const selected = template.id === value;
          return (
            <button
              key={template.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(template.id)}
              className={cn(
                "group rounded-xl border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                selected
                  ? "border-teal-500 bg-teal-50/70 shadow-sm"
                  : "border-gray-200 bg-white/75 hover:border-teal-300 hover:bg-white"
              )}
            >
              <TemplateMiniature template={template} />
              <div className="flex items-start gap-2 px-1 pb-1 pt-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {template.shortName}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-gray-500">
                    {template.recommendedFor}
                  </p>
                </div>
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    selected
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-gray-200 text-transparent"
                  )}
                >
                  <Check className="size-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <details className="rounded-lg border border-gray-200 bg-white/60 px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium text-gray-700">
          About {selectedTemplate.name}
        </summary>
        <div className="mt-2 space-y-1 text-gray-500">
          <p>{selectedTemplate.description}</p>
          <p>{selectedTemplate.sourceName}</p>
          <p>{selectedTemplate.sourceLicense}</p>
          {selectedTemplate.sourceUrl && (
            <a
              href={selectedTemplate.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-teal-700 hover:text-teal-800"
            >
              View source reference
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </details>
    </div>
  );
}
