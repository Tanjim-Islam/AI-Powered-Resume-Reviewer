"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/lib/schemas";

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitComma(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 border-white/50 bg-white/85 p-0 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="border-gray-200 bg-white"
      />
    </label>
  );
}

export function StructuredResumeEditor({
  value,
  onChange,
}: {
  value: ResumeData;
  onChange: (value: ResumeData) => void;
}) {
  const updateHeader = (
    key: keyof ResumeData["header"],
    nextValue: string
  ) => {
    onChange({
      ...value,
      header: {
        ...value.header,
        [key]: nextValue,
      },
    });
  };

  const updateStringList = (
    key: "certifications" | "awards" | "languages" | "interests",
    text: string
  ) => {
    onChange({ ...value, [key]: splitLines(text) });
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Name"
            value={value.header.name}
            onChange={(nextValue) => updateHeader("name", nextValue)}
          />
          <Field
            label="Headline"
            value={value.header.title ?? ""}
            onChange={(nextValue) => updateHeader("title", nextValue)}
          />
          <Field
            label="Location"
            value={value.header.location ?? ""}
            onChange={(nextValue) => updateHeader("location", nextValue)}
          />
          <Field
            label="Phone"
            value={value.header.phone ?? ""}
            onChange={(nextValue) => updateHeader("phone", nextValue)}
          />
          <Field
            label="Email"
            value={value.header.email ?? ""}
            onChange={(nextValue) => updateHeader("email", nextValue)}
          />
          <Field
            label="LinkedIn"
            value={value.header.linkedin ?? ""}
            onChange={(nextValue) => updateHeader("linkedin", nextValue)}
          />
          <Field
            label="Portfolio"
            value={value.header.portfolio ?? ""}
            onChange={(nextValue) => updateHeader("portfolio", nextValue)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Summary">
        <Textarea
          value={value.summary}
          onChange={(event) =>
            onChange({ ...value, summary: event.target.value })
          }
          className="min-h-32 border-gray-200 bg-white"
        />
      </SectionCard>

      <SectionCard
        title="Skills"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...value,
                skills: [...value.skills, { group: "", items: [] }],
              })
            }
          >
            <Plus className="size-4" />
            Add
          </Button>
        }
      >
        {value.skills.map((skill, index) => (
          <div
            key={`skill-${index}`}
            className="grid gap-3 rounded-lg border border-gray-100 bg-gray-50/60 p-4 sm:grid-cols-[0.35fr_0.65fr_auto]"
          >
            <Field
              label="Group"
              value={skill.group}
              onChange={(nextValue) =>
                onChange({
                  ...value,
                  skills: value.skills.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, group: nextValue } : item
                  ),
                })
              }
            />
            <Field
              label="Items"
              value={skill.items.join(", ")}
              onChange={(nextValue) =>
                onChange({
                  ...value,
                  skills: value.skills.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, items: splitComma(nextValue) }
                      : item
                  ),
                })
              }
              placeholder="TypeScript, React, PostgreSQL"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove skill group"
              onClick={() =>
                onChange({
                  ...value,
                  skills: value.skills.filter(
                    (_, itemIndex) => itemIndex !== index
                  ),
                })
              }
              className="self-end text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Experience"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...value,
                experience: [
                  ...value.experience,
                  {
                    company: "",
                    role: "",
                    start: "",
                    end: "",
                    bullets: [],
                    tech: [],
                  },
                ],
              })
            }
          >
            <Plus className="size-4" />
            Add
          </Button>
        }
      >
        {value.experience.map((experience, index) => (
          <div
            key={`experience-${index}`}
            className="space-y-4 rounded-lg border border-gray-100 bg-gray-50/60 p-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["Role", "role"],
                  ["Company", "company"],
                  ["Start", "start"],
                  ["End", "end"],
                ] as const
              ).map(([label, key]) => (
                <Field
                  key={key}
                  label={label}
                  value={experience[key]}
                  onChange={(nextValue) =>
                    onChange({
                      ...value,
                      experience: value.experience.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, [key]: nextValue }
                          : item
                      ),
                    })
                  }
                />
              ))}
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-gray-700">
                Achievements, one per line
              </span>
              <Textarea
                value={experience.bullets.join("\n")}
                onChange={(event) =>
                  onChange({
                    ...value,
                    experience: value.experience.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, bullets: splitLines(event.target.value) }
                        : item
                    ),
                  })
                }
                className="min-h-28 border-gray-200 bg-white"
              />
            </label>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Field
                  label="Tools"
                  value={(experience.tech ?? []).join(", ")}
                  onChange={(nextValue) =>
                    onChange({
                      ...value,
                      experience: value.experience.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, tech: splitComma(nextValue) }
                          : item
                      ),
                    })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove experience"
                onClick={() =>
                  onChange({
                    ...value,
                    experience: value.experience.filter(
                      (_, itemIndex) => itemIndex !== index
                    ),
                  })
                }
                className="text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Projects"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...value,
                projects: [
                  ...value.projects,
                  {
                    name: "",
                    description: "",
                    bullets: [],
                    tech: [],
                  },
                ],
              })
            }
          >
            <Plus className="size-4" />
            Add
          </Button>
        }
      >
        {value.projects.map((project, index) => (
          <div
            key={`project-${index}`}
            className="space-y-4 rounded-lg border border-gray-100 bg-gray-50/60 p-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Project"
                value={project.name}
                onChange={(nextValue) =>
                  onChange({
                    ...value,
                    projects: value.projects.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, name: nextValue }
                        : item
                    ),
                  })
                }
              />
              <Field
                label="Tools"
                value={(project.tech ?? []).join(", ")}
                onChange={(nextValue) =>
                  onChange({
                    ...value,
                    projects: value.projects.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, tech: splitComma(nextValue) }
                        : item
                    ),
                  })
                }
              />
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-gray-700">
                Description
              </span>
              <Textarea
                value={project.description}
                onChange={(event) =>
                  onChange({
                    ...value,
                    projects: value.projects.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, description: event.target.value }
                        : item
                    ),
                  })
                }
                className="min-h-20 border-gray-200 bg-white"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-gray-700">
                Highlights, one per line
              </span>
              <Textarea
                value={project.bullets.join("\n")}
                onChange={(event) =>
                  onChange({
                    ...value,
                    projects: value.projects.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, bullets: splitLines(event.target.value) }
                        : item
                    ),
                  })
                }
                className="min-h-24 border-gray-200 bg-white"
              />
            </label>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    ...value,
                    projects: value.projects.filter(
                      (_, itemIndex) => itemIndex !== index
                    ),
                  })
                }
                className="text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Education"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...value,
                education: [
                  ...value.education,
                  { school: "", degree: "", year: "", cgpa: "" },
                ],
              })
            }
          >
            <Plus className="size-4" />
            Add
          </Button>
        }
      >
        {value.education.map((education, index) => (
          <div
            key={`education-${index}`}
            className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50/60 p-4 sm:grid-cols-2"
          >
            {(
              [
                ["Degree", "degree"],
                ["School", "school"],
                ["Year", "year"],
                ["Grade", "cgpa"],
              ] as const
            ).map(([label, key]) => (
              <Field
                key={key}
                label={label}
                value={education[key] ?? ""}
                onChange={(nextValue) =>
                  onChange({
                    ...value,
                    education: value.education.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, [key]: nextValue }
                        : item
                    ),
                  })
                }
              />
            ))}
            <div className="flex justify-end sm:col-span-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    ...value,
                    education: value.education.filter(
                      (_, itemIndex) => itemIndex !== index
                    ),
                  })
                }
                className="text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Publications"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...value,
                publications: [
                  ...(value.publications ?? []),
                  { title: "", venue: "", year: "" },
                ],
              })
            }
          >
            <Plus className="size-4" />
            Add
          </Button>
        }
      >
        {(value.publications ?? []).map((publication, index) => (
          <div
            key={`publication-${index}`}
            className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50/60 p-4 sm:grid-cols-[1fr_0.65fr_0.3fr_auto]"
          >
            {(
              [
                ["Title", "title"],
                ["Venue", "venue"],
                ["Year", "year"],
              ] as const
            ).map(([label, key]) => (
              <Field
                key={key}
                label={label}
                value={publication[key] ?? ""}
                onChange={(nextValue) =>
                  onChange({
                    ...value,
                    publications: (value.publications ?? []).map(
                      (item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, [key]: nextValue }
                          : item
                    ),
                  })
                }
              />
            ))}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove publication"
              onClick={() =>
                onChange({
                  ...value,
                  publications: (value.publications ?? []).filter(
                    (_, itemIndex) => itemIndex !== index
                  ),
                })
              }
              className="self-end text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {!value.publications?.length && (
          <p className="text-sm text-gray-500">
            Add publications when using an academic template.
          </p>
        )}
      </SectionCard>

      <SectionCard title="Additional sections">
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["Certifications", "certifications"],
              ["Awards", "awards"],
              ["Languages", "languages"],
              ["Interests", "interests"],
            ] as const
          ).map(([label, key]) => (
            <label key={key} className="space-y-1.5">
              <span className="text-sm font-medium text-gray-700">
                {label}
              </span>
              <Textarea
                value={(value[key] ?? []).join("\n")}
                onChange={(event) =>
                  updateStringList(key, event.target.value)
                }
                placeholder="One per line"
                className="min-h-24 border-gray-200 bg-white"
              />
            </label>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
