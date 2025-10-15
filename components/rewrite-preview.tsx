"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Download,
  Copy,
  Eye,
  Edit3,
  FileText,
  Loader2,
  Save,
} from "lucide-react";
import { RewriteResponse } from "@/lib/schemas";

interface RewritePreviewProps {
  rewriteData: RewriteResponse;
  onExport: (format: "docx" | "pdf") => Promise<void>;
  onSave: (data: RewriteResponse["json"]) => Promise<void>;
  exportingFormat: "docx" | "pdf" | null;
}

type EditableData = RewriteResponse["json"];

export function RewritePreview({
  rewriteData,
  onExport,
  onSave,
  exportingFormat,
}: RewritePreviewProps) {
  const [activeTab, setActiveTab] = useState("markdown");
  const [editableData, setEditableData] = useState<EditableData>(
    rewriteData.json
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditableData(rewriteData.json);
    setIsDirty(false);
  }, [rewriteData.json]);

  const markDirty = () => setIsDirty(true);

  const handleSave = async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    try {
      await onSave(editableData);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const updateField = (
    section: keyof EditableData,
    field: string,
    value: string
  ) => {
    setEditableData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value,
      },
    }));
    markDirty();
  };

  const updateArrayField = (
    section: keyof EditableData,
    index: number,
    field: string,
    value: string
  ) => {
    let didUpdate = false;
    setEditableData((prev) => {
      const currentSection = prev[section];
      if (Array.isArray(currentSection) && currentSection.length > 0) {
        // Type guard to ensure we're dealing with objects, not strings
        if (
          typeof currentSection[0] === "object" &&
          currentSection[0] !== null
        ) {
          const arr = currentSection as Array<Record<string, unknown>>;
          didUpdate = true;
          return {
            ...prev,
            [section]: arr.map((item, i) =>
              i === index ? { ...item, [field]: value } : item
            ) as typeof currentSection,
          };
        }
      }
      return prev;
    });
    if (didUpdate) markDirty();
  };

  const updateNestedArrayField = (
    section: keyof EditableData,
    arrayIndex: number,
    field: string,
    itemIndex: number,
    value: string
  ) => {
    let didUpdate = false;
    setEditableData((prev) => {
      const currentSection = prev[section];
      if (Array.isArray(currentSection) && currentSection.length > 0) {
        if (
          typeof currentSection[0] === "object" &&
          currentSection[0] !== null
        ) {
          const arr = currentSection as Array<Record<string, unknown>>;
          didUpdate = true;
          return {
            ...prev,
            [section]: arr.map((item, i) =>
              i === arrayIndex
                ? {
                    ...item,
                    [field]: (item[field] as string[]).map((str, j) =>
                      j === itemIndex ? value : str
                    ),
                  }
                : item
            ) as typeof currentSection,
          };
        }
      }
      return prev;
    });
    if (didUpdate) markDirty();
  };

  const updateSkillsArrayItem = (
    section: keyof EditableData,
    arrayIndex: number,
    itemIndex: number,
    value: string
  ) => {
    let didUpdate = false;
    setEditableData((prev) => {
      const currentSection = prev[section];
      if (Array.isArray(currentSection) && currentSection.length > 0) {
        if (
          typeof currentSection[0] === "object" &&
          currentSection[0] !== null
        ) {
          const arr = currentSection as Array<Record<string, unknown>>;
          didUpdate = true;
          return {
            ...prev,
            [section]: arr.map((item, i) =>
              i === arrayIndex
                ? {
                    ...item,
                    items: (item.items as string[]).map((str, j) =>
                      j === itemIndex ? value : str
                    ),
                  }
                : item
            ) as typeof currentSection,
          };
        }
      }
      return prev;
    });
    if (didUpdate) markDirty();
  };

  const addArrayItem = (
    section: keyof EditableData,
    newItem: Record<string, unknown>
  ) => {
    let didUpdate = false;
    setEditableData((prev) => {
      const currentSection = prev[section];
      if (Array.isArray(currentSection) && currentSection.length > 0) {
        if (
          typeof currentSection[0] === "object" &&
          currentSection[0] !== null
        ) {
          const arr = currentSection as Array<Record<string, unknown>>;
          didUpdate = true;
          return {
            ...prev,
            [section]: [...arr, newItem] as unknown as typeof currentSection,
          };
        }
      }
      return prev;
    });
    if (didUpdate) markDirty();
  };

  const removeArrayItem = (section: keyof EditableData, index: number) => {
    let didUpdate = false;
    setEditableData((prev) => {
      const currentSection = prev[section];
      if (Array.isArray(currentSection) && currentSection.length > 0) {
        if (
          typeof currentSection[0] === "object" &&
          currentSection[0] !== null
        ) {
          const arr = currentSection as Array<Record<string, unknown>>;
          didUpdate = true;
          return {
            ...prev,
            [section]: arr.filter(
              (_, i) => i !== index
            ) as unknown as typeof currentSection,
          };
        }
      }
      return prev;
    });
    if (didUpdate) markDirty();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          AI-Rewritten Resume
        </h2>
        <p className="text-gray-600">
          Review and customize your improved resume
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="markdown" className="flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="markdown" className="space-y-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Markdown Preview
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(rewriteData.markdown)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Markdown
              </Button>
            </div>
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm text-gray-700">
                <ReactMarkdown>{rewriteData.markdown}</ReactMarkdown>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {/* Header Section */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Header Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  value={editableData.header.name}
                  onChange={(e) =>
                    updateField("header", "name", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <Input
                  value={editableData.header.title || ""}
                  onChange={(e) =>
                    updateField("header", "title", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  value={editableData.header.location || ""}
                  onChange={(e) =>
                    updateField("header", "location", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <Input
                  value={editableData.header.phone || ""}
                  onChange={(e) =>
                    updateField("header", "phone", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  value={editableData.header.email || ""}
                  onChange={(e) =>
                    updateField("header", "email", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <Input
                  value={editableData.header.linkedin || ""}
                  onChange={(e) =>
                    updateField("header", "linkedin", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio
                </label>
                <Input
                  value={editableData.header.portfolio || ""}
                  onChange={(e) =>
                    updateField("header", "portfolio", e.target.value)
                  }
                />
              </div>
            </div>
          </Card>

          {/* Summary Section */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Professional Summary
            </h3>
            <Textarea
              value={editableData.summary}
              onChange={(e) => {
                setEditableData((prev) => ({
                  ...prev,
                  summary: e.target.value,
                }));
                markDirty();
              }}
              className="min-h-32"
            />
          </Card>

          {/* Skills Section */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills</h3>
            <div className="space-y-4">
              {editableData.skills.map((skillGroup, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Input
                      value={skillGroup.group}
                      onChange={(e) =>
                        updateArrayField(
                          "skills",
                          index,
                          "group",
                          e.target.value
                        )
                      }
                      className="font-medium"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem("skills", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center">
                        <Input
                          value={item}
                          onChange={(e) => {
                            updateSkillsArrayItem(
                              "skills",
                              index,
                              itemIndex,
                              e.target.value
                            );
                          }}
                          className="w-auto min-w-0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  addArrayItem("skills", { group: "New Category", items: [] })
                }
              >
                Add Skill Category
              </Button>
            </div>
          </Card>

          {/* Experience Section */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Work Experience
            </h3>
            <div className="space-y-6">
              {editableData.experience.map((exp, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <Input
                        value={exp.company}
                        onChange={(e) =>
                          updateArrayField(
                            "experience",
                            index,
                            "company",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <Input
                        value={exp.role}
                        onChange={(e) =>
                          updateArrayField(
                            "experience",
                            index,
                            "role",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <Input
                        value={exp.start}
                        onChange={(e) =>
                          updateArrayField(
                            "experience",
                            index,
                            "start",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <Input
                        value={exp.end}
                        onChange={(e) =>
                          updateArrayField(
                            "experience",
                            index,
                            "end",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Achievements
                    </label>
                    <div className="space-y-2">
                      {exp.bullets.map((bullet, bulletIndex) => (
                        <div
                          key={bulletIndex}
                          className="flex items-center gap-2"
                        >
                          <Input
                            value={bullet}
                            onChange={(e) => {
                              updateNestedArrayField(
                                "experience",
                                index,
                                "bullets",
                                bulletIndex,
                                e.target.value
                              );
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newBullets = exp.bullets.filter(
                                (_, i) => i !== bulletIndex
                              );
                              setEditableData((prev) => {
                                const currentSection = prev.experience;
                                if (Array.isArray(currentSection)) {
                                  return {
                                    ...prev,
                                    experience: currentSection.map((item, i) =>
                                      i === index
                                        ? { ...item, bullets: newBullets }
                                        : item
                                    ),
                                  };
                                }
                                return prev;
                              });
                              markDirty();
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newBullets = [...exp.bullets, ""];
                          setEditableData((prev) => {
                            const currentSection = prev.experience;
                            if (Array.isArray(currentSection)) {
                              return {
                                ...prev,
                                experience: currentSection.map((item, i) =>
                                  i === index
                                    ? { ...item, bullets: newBullets }
                                    : item
                                ),
                              };
                            }
                            return prev;
                          });
                          markDirty();
                        }}
                      >
                        Add Bullet Point
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem("experience", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove Experience
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  addArrayItem("experience", {
                    company: "",
                    role: "",
                    start: "",
                    end: "",
                    bullets: [""],
                  })
                }
              >
                Add Experience
              </Button>
            </div>
          </Card>

          {/* Projects Section */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Projects
            </h3>
            <div className="space-y-4">
              {editableData.projects.map((project, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name
                      </label>
                      <Input
                        value={project.name}
                        onChange={(e) =>
                          updateArrayField(
                            "projects",
                            index,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Input
                        value={project.description}
                        onChange={(e) =>
                          updateArrayField(
                            "projects",
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Achievements
                    </label>
                    <div className="space-y-2">
                      {project.bullets.map((bullet, bulletIndex) => (
                        <div
                          key={bulletIndex}
                          className="flex items-center gap-2"
                        >
                          <Input
                            value={bullet}
                            onChange={(e) => {
                              updateNestedArrayField(
                                "projects",
                                index,
                                "bullets",
                                bulletIndex,
                                e.target.value
                              );
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newBullets = project.bullets.filter(
                                (_, i) => i !== bulletIndex
                              );
                              setEditableData((prev) => {
                                const currentSection = prev.projects;
                                if (Array.isArray(currentSection)) {
                                  return {
                                    ...prev,
                                    projects: currentSection.map((item, i) =>
                                      i === index
                                        ? { ...item, bullets: newBullets }
                                        : item
                                    ),
                                  };
                                }
                                return prev;
                              });
                              markDirty();
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newBullets = [...project.bullets, ""];
                          setEditableData((prev) => {
                            const currentSection = prev.projects;
                            if (Array.isArray(currentSection)) {
                              return {
                                ...prev,
                                projects: currentSection.map((item, i) =>
                                  i === index
                                    ? { ...item, bullets: newBullets }
                                    : item
                                ),
                              };
                            }
                            return prev;
                          });
                          markDirty();
                        }}
                      >
                        Add Bullet Point
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem("projects", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove Project
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  addArrayItem("projects", {
                    name: "",
                    description: "",
                    bullets: [""],
                  })
                }
              >
                Add Project
              </Button>
            </div>
          </Card>

          {/* Education Section */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Education
            </h3>
            <div className="space-y-4">
              {editableData.education.map((edu, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School
                      </label>
                      <Input
                        value={edu.school}
                        onChange={(e) =>
                          updateArrayField(
                            "education",
                            index,
                            "school",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Degree
                      </label>
                      <Input
                        value={edu.degree}
                        onChange={(e) =>
                          updateArrayField(
                            "education",
                            index,
                            "degree",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <Input
                        value={edu.year || ""}
                        onChange={(e) =>
                          updateArrayField(
                            "education",
                            index,
                            "year",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem("education", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove Education
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  addArrayItem("education", {
                    school: "",
                    degree: "",
                    year: "",
                  })
                }
              >
                Add Education
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Actions */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20 mt-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => onExport("docx")}
            disabled={exportingFormat !== null}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3"
          >
            {exportingFormat === "docx" ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            Download DOCX
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onExport("pdf")}
            disabled={exportingFormat !== null}
            className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-3"
          >
            {exportingFormat === "pdf" ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <FileText className="w-5 h-5 mr-2" />
            )}
            Download PDF
          </Button>
        </div>
      </Card>
    </div>
  );
}
