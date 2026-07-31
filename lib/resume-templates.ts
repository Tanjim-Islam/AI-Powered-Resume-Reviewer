import type { ResumeData, ResumeTemplateId } from "@/lib/schemas";
import {
  getResumeContactItems,
  type ResumeContactItem,
} from "@/lib/resume-contact";

export type ResumeTemplateCategory =
  | "general"
  | "leadership"
  | "technical"
  | "academic"
  | "specialized"
  | "early-career";

export type ResumeTemplate = {
  id: ResumeTemplateId;
  name: string;
  shortName: string;
  description: string;
  recommendedFor: string;
  category: ResumeTemplateCategory;
  layout: "single" | "two-column" | "academic";
  accent: string;
  photo: "none" | "optional";
  sourceUrl?: string;
  sourceName: string;
  sourceLicense: string;
};

export const DEFAULT_RESUME_TEMPLATE_ID: ResumeTemplateId = "harshibar";

export const resumeTemplates: readonly ResumeTemplate[] = [
  {
    id: "harshibar",
    name: "Harshibar Modern",
    shortName: "Modern",
    description: "Crisp one-page layout with strong section rules.",
    recommendedFor: "Software, product, and general roles",
    category: "general",
    layout: "single",
    accent: "#0f766e",
    photo: "none",
    sourceUrl:
      "https://www.overleaf.com/latex/templates/harshibars-resume/sbcyynmtpnyd",
    sourceName: "harshibar's resume",
    sourceLicense: "MIT",
  },
  {
    id: "curve",
    name: "CurVe Editorial",
    shortName: "Editorial",
    description: "Elegant academic styling with an optional portrait.",
    recommendedFor: "Researchers, consultants, and senior specialists",
    category: "academic",
    layout: "academic",
    accent: "#8b1e3f",
    photo: "optional",
    sourceUrl:
      "https://www.overleaf.com/latex/templates/a-customised-curve-cv/mvmbhkwsnmwv",
    sourceName: "A Customised CurVe CV",
    sourceLicense: "CC BY 4.0",
  },
  {
    id: "northeastern",
    name: "Faculty Record",
    shortName: "Faculty",
    description: "Spacious multi-page format for detailed credentials.",
    recommendedFor: "Faculty, science, and academic applications",
    category: "academic",
    layout: "academic",
    accent: "#c8102e",
    photo: "none",
    sourceUrl:
      "https://www.overleaf.com/latex/templates/northeastern-university-cos-faculty-cv-template/zfgnyhdpmpqg",
    sourceName: "Northeastern University COS Faculty CV Template",
    sourceLicense: "LPPL 1.3c",
  },
  {
    id: "boltach",
    name: "Boltach Classic",
    shortName: "Classic",
    description: "Traditional European CV with a refined typographic rhythm.",
    recommendedFor: "Operations, business, and experienced professionals",
    category: "general",
    layout: "single",
    accent: "#334155",
    photo: "none",
    sourceUrl:
      "https://www.overleaf.com/articles/boltach-antons-resume/ptvypkdbzzyk",
    sourceName: "Boltach Anton's Resume",
    sourceLicense: "CC BY 4.0",
  },
  {
    id: "portrait",
    name: "Portrait Professional",
    shortName: "Portrait",
    description: "Photo-led header with clean, structured content.",
    recommendedFor: "Client-facing, design, and international CVs",
    category: "general",
    layout: "single",
    accent: "#0f4c5c",
    photo: "optional",
    sourceUrl:
      "https://www.overleaf.com/latex/templates/cv-template/gsztvcrdvvbj",
    sourceName: "CV Template by Pedro Sa da Costa",
    sourceLicense: "CC BY 4.0",
  },
  {
    id: "iiit",
    name: "IIIT Compact",
    shortName: "Compact",
    description: "Dense, ATS-readable layout built for early-career impact.",
    recommendedFor: "Students, graduates, and technical internships",
    category: "early-career",
    layout: "single",
    accent: "#111827",
    photo: "none",
    sourceUrl:
      "https://www.overleaf.com/latex/templates/iiit-vadodara-resume/crrpnvzhktfs",
    sourceName: "IIIT Vadodara Resume",
    sourceLicense: "CC BY 4.0 and MIT source notice",
  },
  {
    id: "deedy",
    name: "Deedy Two Column",
    shortName: "Two Column",
    description: "Fast-scanning two-column composition for a single page.",
    recommendedFor: "Engineering, startups, and portfolio-heavy roles",
    category: "technical",
    layout: "two-column",
    accent: "#111827",
    photo: "none",
    sourceUrl:
      "https://www.overleaf.com/articles/mohamed-javids-single-page-resume/ryhxghnkffqp",
    sourceName: "Mohamed Javid's Single page Resume",
    sourceLicense: "LPPL 1.3c",
  },
  {
    id: "engineer",
    name: "Technical Engineer",
    shortName: "Engineer",
    description: "Structured technical layout with clear project emphasis.",
    recommendedFor: "Mechanical, civil, electrical, and industrial roles",
    category: "technical",
    layout: "single",
    accent: "#1d4ed8",
    photo: "none",
    sourceUrl:
      "https://www.overleaf.com/articles/akshay-vaishnavs-cv-mechanical-engineer/szfnbgkvbjrh",
    sourceName: "Akshay Vaishnav's CV",
    sourceLicense: "CC BY 4.0",
  },
  {
    id: "researcher",
    name: "Research Modern",
    shortName: "Research",
    description: "Modern academic CV with publication-friendly entries.",
    recommendedFor: "Researchers, professors, and graduate applications",
    category: "academic",
    layout: "academic",
    accent: "#2563eb",
    photo: "none",
    sourceUrl:
      "https://www.overleaf.com/latex/examples/curriculum-vitae-for-researchers/jmrscnymyfps",
    sourceName: "Curriculum Vitae for Researchers",
    sourceLicense: "Original compatible adaptation",
  },
  {
    id: "executive",
    name: "Executive Slate",
    shortName: "Executive",
    description: "Confident leadership layout with a concise executive profile.",
    recommendedFor: "Directors, heads of function, and senior leadership",
    category: "leadership",
    layout: "single",
    accent: "#1f2937",
    photo: "none",
    sourceName: "Resume Reviewer Executive Slate",
    sourceLicense: "Original Resume Reviewer design",
  },
  {
    id: "swiss",
    name: "Swiss Minimal",
    shortName: "Swiss",
    description: "Restrained typography, generous spacing, and precise rules.",
    recommendedFor: "Design, architecture, product, and general applications",
    category: "general",
    layout: "single",
    accent: "#c2410c",
    photo: "none",
    sourceName: "Resume Reviewer Swiss Minimal",
    sourceLicense: "Original Resume Reviewer design",
  },
  {
    id: "consulting",
    name: "Consulting Brief",
    shortName: "Consulting",
    description: "Structured business format built around evidence and impact.",
    recommendedFor: "Strategy, consulting, operations, and transformation",
    category: "specialized",
    layout: "single",
    accent: "#7c2d12",
    photo: "none",
    sourceName: "Resume Reviewer Consulting Brief",
    sourceLicense: "Original Resume Reviewer design",
  },
  {
    id: "finance",
    name: "Finance Ledger",
    shortName: "Finance",
    description: "Dense, conservative layout with clear chronological detail.",
    recommendedFor: "Banking, finance, accounting, and investment roles",
    category: "specialized",
    layout: "single",
    accent: "#0f3d56",
    photo: "none",
    sourceName: "Resume Reviewer Finance Ledger",
    sourceLicense: "Original Resume Reviewer design",
  },
  {
    id: "legal",
    name: "Counsel Classic",
    shortName: "Legal",
    description: "Traditional legal CV with calm hierarchy and formal spacing.",
    recommendedFor: "Law, policy, compliance, and regulatory roles",
    category: "specialized",
    layout: "single",
    accent: "#4b2e2a",
    photo: "none",
    sourceName: "Resume Reviewer Counsel Classic",
    sourceLicense: "Original Resume Reviewer design",
  },
  {
    id: "clinical",
    name: "Clinical Professional",
    shortName: "Clinical",
    description: "Credential-forward format with calm clinical styling.",
    recommendedFor: "Healthcare, medicine, nursing, and allied health",
    category: "specialized",
    layout: "single",
    accent: "#0f766e",
    photo: "none",
    sourceName: "Resume Reviewer Clinical Professional",
    sourceLicense: "Original Resume Reviewer design",
  },
  {
    id: "data",
    name: "Data Signal",
    shortName: "Data",
    description: "Analytical two-column layout for methods, tools, and outcomes.",
    recommendedFor: "Data, analytics, BI, statistics, and machine learning",
    category: "technical",
    layout: "two-column",
    accent: "#0369a1",
    photo: "none",
    sourceName: "Resume Reviewer Data Signal",
    sourceLicense: "Original Resume Reviewer design",
  },
  {
    id: "cyber",
    name: "Security Grid",
    shortName: "Cyber",
    description: "Technical sidebar layout with strong security-focused hierarchy.",
    recommendedFor: "Cybersecurity, infrastructure, cloud, and IT operations",
    category: "technical",
    layout: "two-column",
    accent: "#166534",
    photo: "none",
    sourceName: "Resume Reviewer Security Grid",
    sourceLicense: "Original Resume Reviewer design",
  },
  {
    id: "product",
    name: "Product Narrative",
    shortName: "Product",
    description: "Outcome-led format balancing strategy, delivery, and discovery.",
    recommendedFor: "Product managers, program managers, and product leaders",
    category: "leadership",
    layout: "single",
    accent: "#0e7490",
    photo: "none",
    sourceName: "Resume Reviewer Product Narrative",
    sourceLicense: "Original Resume Reviewer design",
  },
  {
    id: "sales",
    name: "Revenue Impact",
    shortName: "Sales",
    description: "Results-first layout for commercial achievements and growth.",
    recommendedFor: "Sales, marketing, partnerships, and customer success",
    category: "specialized",
    layout: "single",
    accent: "#b42318",
    photo: "none",
    sourceName: "Resume Reviewer Revenue Impact",
    sourceLicense: "Original Resume Reviewer design",
  },
  {
    id: "graduate",
    name: "Graduate Launch",
    shortName: "Graduate",
    description: "Compact education-first design for emerging professionals.",
    recommendedFor: "Students, graduates, apprentices, and career starters",
    category: "early-career",
    layout: "single",
    accent: "#1d4ed8",
    photo: "none",
    sourceName: "Resume Reviewer Graduate Launch",
    sourceLicense: "Original Resume Reviewer design",
  },
  {
    id: "public-service",
    name: "Public Service",
    shortName: "Public",
    description: "Measured, accessible format for mission-driven experience.",
    recommendedFor: "Government, nonprofit, education, and public policy",
    category: "specialized",
    layout: "single",
    accent: "#1e3a5f",
    photo: "none",
    sourceName: "Resume Reviewer Public Service",
    sourceLicense: "Original Resume Reviewer design",
  },
] as const;

const templateIds = new Set<ResumeTemplateId>(
  resumeTemplates.map((template) => template.id)
);

export function isResumeTemplateId(value: unknown): value is ResumeTemplateId {
  return typeof value === "string" && templateIds.has(value as ResumeTemplateId);
}

export function getResumeTemplate(id: ResumeTemplateId): ResumeTemplate {
  return (
    resumeTemplates.find((template) => template.id === id) ??
    resumeTemplates[0]
  );
}

const texCharacterMap: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "{": "\\{",
  "}": "\\}",
  "$": "\\$",
  "&": "\\&",
  "#": "\\#",
  "%": "\\%",
  "_": "\\_",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
  "<": "\\textless{}",
  ">": "\\textgreater{}",
};

export function escapeLatex(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/\r?\n/g, " ")
    .split("")
    .map((character) => texCharacterMap[character] ?? character)
    .join("")
    .trim();
}

function nonEmpty(values: Array<string | null | undefined>): string[] {
  return values.map((value) => (value ?? "").trim()).filter(Boolean);
}

function escapeLatexHref(value: string): string {
  return encodeURI(value)
    .replace(/%/g, "\\%")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/&/g, "\\&");
}

function latexContactItem(item: ResumeContactItem): string {
  const text = escapeLatex(item.text);
  if (!item.href) return text;

  const linkedText = item.kind === "email" ? text : `\\mbox{${text}}`;

  return `\\href{${escapeLatexHref(item.href)}}{\\textcolor{ResumeLink}{${linkedText}}}`;
}

function contactLine(data: ResumeData): string {
  return getResumeContactItems(data.header)
    .map(latexContactItem)
    .join(" \\enspace $\\vert$ \\enspace ");
}

function legacyContactValues(data: ResumeData): string[] {
  return nonEmpty([
    data.header.location,
    data.header.phone,
    data.header.email,
    data.header.linkedin,
    data.header.portfolio,
    ...(data.header.links ?? []),
  ]).map(escapeLatex);
}

function legacyContactLine(data: ResumeData): string {
  return legacyContactValues(data).join(
    " \\enspace $\\vert$ \\enspace "
  );
}

function legacyStackedContact(data: ResumeData): string {
  return legacyContactValues(data).join("\\\\[2pt]\n");
}

function boltachContactEntries(data: ResumeData): string {
  const contactItems = getResumeContactItems(data.header);
  const personalEntries = contactItems.filter(
    (item) =>
      item.kind === "location" ||
      item.kind === "phone" ||
      item.kind === "email"
  );
  const onlineEntries = contactItems.filter(
    (item) =>
      item.kind === "linkedin" ||
      item.kind === "portfolio" ||
      item.kind === "link"
  );
  const personalRows = personalEntries
    .map((item) => {
      const label =
        item.kind === "location"
          ? "Location"
          : item.kind === "phone"
            ? "Phone"
            : "Email";
      return `\\PersonalEntry{${label}}{${latexContactItem(item)}}`;
    })
    .join("\n");
  const onlineRow = onlineEntries.length
    ? `\\PersonalEntry{Online}{${onlineEntries
        .map(latexContactItem)
        .join(" \\enspace $\\vert$ \\enspace ")}}`
    : "";

  return [personalRows, onlineRow].filter(Boolean).join("\n");
}

function legacyBoltachContactEntries(data: ResumeData): string {
  return nonEmpty([
    data.header.location,
    data.header.phone,
    data.header.email,
    data.header.linkedin,
    data.header.portfolio,
  ])
    .map(
      (value, index) =>
        `\\PersonalEntry{${
          ["Location", "Phone", "Email", "LinkedIn", "Portfolio"][index] ??
          "Contact"
        }}{${escapeLatex(value)}}`
    )
    .join("\n");
}

export function upgradeResumeLatexContacts(
  source: string,
  data: ResumeData
): string {
  if (!source) return source;

  let upgraded = source;
  const replacements: Array<[string, string]> = [
    [legacyContactLine(data), contactLine(data)],
    [legacyStackedContact(data), stackedContact(data)],
    [legacyBoltachContactEntries(data), boltachContactEntries(data)],
  ];

  for (const [legacy, current] of replacements) {
    if (legacy && legacy !== current && upgraded.includes(legacy)) {
      upgraded = upgraded.replace(legacy, current);
    }
  }

  const legacySplitHeader = `\\begin{minipage}[t]{0.61\\textwidth}
{\\Huge\\bfseries`;
  const responsiveSplitHeader = `\\begin{minipage}[t]{0.61\\textwidth}
\\raggedright
{\\LARGE\\bfseries`;
  upgraded = upgraded.replace(legacySplitHeader, responsiveSplitHeader);

  const legacySidebarStart = `\\begin{minipage}[t]{0.29\\textwidth}
\\raggedright
\\colorbox{ResumeSoft}{\\parbox[t]{\\dimexpr\\linewidth-2\\fboxsep}{%`;
  const legacySidebarSwitch = `}}
\\end{minipage}\\hfill
\\begin{minipage}[t]{0.67\\textwidth}
\\raggedright`;

  if (
    upgraded.includes(legacySidebarStart) &&
    upgraded.includes(legacySidebarSwitch)
  ) {
    const documentStart = "\\begin{document}\n";
    const sidebarStart = `\\par\\vspace{6pt}\n${legacySidebarStart}`;
    const documentStartIndex = upgraded.indexOf(documentStart);
    const sidebarStartIndex = upgraded.indexOf(sidebarStart);

    if (
      documentStartIndex >= 0 &&
      sidebarStartIndex > documentStartIndex
    ) {
      const headerStartIndex = documentStartIndex + documentStart.length;
      const header = upgraded.slice(headerStartIndex, sidebarStartIndex);
      upgraded = `${upgraded.slice(0, documentStartIndex)}\\setlength{\\columnsep}{0.28in}
\\newcommand{\\ResumeHeader}{%
${header}
}
\\begin{document}
\\twocolumn[\\ResumeHeader\\par\\vspace{6pt}]
\\raggedright${upgraded.slice(
        sidebarStartIndex + sidebarStart.length
      )}`
        .replace(legacySidebarSwitch, "\\newpage\n\\raggedright")
        .replace(
          "\\end{minipage}\n\\end{document}",
          "\\end{document}"
        );
    }
  }

  if (
    upgraded !== source &&
    !upgraded.includes("\\definecolor{ResumeLink}")
  ) {
    upgraded = upgraded.replace(
      "\\usepackage[hidelinks]{hyperref}",
      "\\usepackage[hidelinks]{hyperref}\n\\definecolor{ResumeLink}{HTML}{1D4ED8}"
    );
  }

  return upgraded;
}

function attribution(template: ResumeTemplate): string {
  return `% Resume Reviewer compatible adaptation
% Reference: ${template.sourceName}
${template.sourceUrl ? `% Source: ${template.sourceUrl}\n` : ""}% Source license: ${template.sourceLicense}
% Resume content and generated output belong to the user.`;
}

function basePreamble(
  template: ResumeTemplate,
  options: {
    paper?: "letterpaper" | "a4paper";
    fontSize?: "9pt" | "10pt" | "11pt";
    margin?: string;
  } = {}
): string {
  const paper = options.paper ?? "letterpaper";
  const fontSize = options.fontSize ?? "10pt";
  const margin = options.margin ?? "0.62in";

  return `${attribution(template)}
\\documentclass[${fontSize},${paper}]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=${margin}]{geometry}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage{graphicx}
\\usepackage[hidelinks]{hyperref}
\\definecolor{ResumeLink}{HTML}{1D4ED8}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\setlength{\\tabcolsep}{0pt}
\\renewenvironment{itemize}{%
  \\begin{list}{\\textbullet}{%
    \\setlength{\\leftmargin}{1.2em}%
    \\setlength{\\labelwidth}{0.8em}%
    \\setlength{\\labelsep}{0.4em}%
    \\setlength{\\itemsep}{0pt}%
    \\setlength{\\parsep}{0pt}%
    \\setlength{\\topsep}{2pt}%
  }%
}{\\end{list}}
\\pagestyle{empty}
\\urlstyle{same}
\\emergencystretch=2em`;
}

function standardExperience(
  data: ResumeData,
  width = "\\textwidth"
): string {
  return data.experience
    .map(
      (entry) => `\\begin{tabularx}{${width}}{@{}X@{\\hspace{0.8em}}r@{}}
\\textbf{${escapeLatex(entry.role)}} at \\textbf{${escapeLatex(
        entry.company
      )}} & ${escapeLatex(nonEmpty([entry.start, entry.end]).join(" -- "))} \\\\
\\end{tabularx}
${entry.bullets.length > 0 ? `\\begin{itemize}
${entry.bullets.map((bullet) => `\\item ${escapeLatex(bullet)}`).join("\n")}
\\end{itemize}` : ""}
${entry.tech?.length ? `\\textit{Tools: ${entry.tech.map(escapeLatex).join(", ")}}\\\\[3pt]` : ""}`
    )
    .join("\n\\vspace{4pt}\n");
}

function standardProjects(data: ResumeData): string {
  return data.projects
    .map(
      (project) => `\\textbf{${escapeLatex(project.name)}}${
        project.tech?.length
          ? ` \\hfill \\textit{${project.tech.map(escapeLatex).join(", ")}}`
          : ""
      }\\\\
${project.description ? `${escapeLatex(project.description)}\\\\` : ""}
${project.bullets.length > 0 ? `\\begin{itemize}
${project.bullets.map((bullet) => `\\item ${escapeLatex(bullet)}`).join("\n")}
\\end{itemize}` : ""}`
    )
    .join("\n\\vspace{4pt}\n");
}

function standardEducation(
  data: ResumeData,
  width = "\\textwidth"
): string {
  return data.education
    .map(
      (education) => `\\begin{tabularx}{${width}}{@{}X@{\\hspace{0.8em}}r@{}}
\\textbf{${escapeLatex(education.degree)}} & ${escapeLatex(
        education.year
      )} \\\\
${escapeLatex(education.school)}${
        education.cgpa ? `, ${escapeLatex(education.cgpa)}` : ""
      } & \\\\
\\end{tabularx}`
    )
    .join("\n\\vspace{3pt}\n");
}

function standardSkills(data: ResumeData): string {
  return data.skills
    .map(
      (skill) =>
        `\\textbf{${escapeLatex(skill.group)}:} ${skill.items
          .map(escapeLatex)
          .join(", ")}\\\\`
    )
    .join("\n");
}

function simpleList(items: string[] | undefined): string {
  if (!items?.length) return "";
  return `\\begin{itemize}
${items.map((item) => `\\item ${escapeLatex(item)}`).join("\n")}
\\end{itemize}`;
}

function publications(data: ResumeData): string {
  if (!data.publications?.length) return "";
  return data.publications
    .map(
      (publication) => `\\textbf{${escapeLatex(publication.title)}}${
        publication.venue ? `, ${escapeLatex(publication.venue)}` : ""
      }${publication.year ? ` \\hfill ${escapeLatex(publication.year)}` : ""}\\\\`
    )
    .join("\n\\vspace{2pt}\n");
}

function optionalStandardSections(data: ResumeData): string {
  return `${data.projects.length ? `\\section*{Projects}
${standardProjects(data)}` : ""}
${data.education.length ? `\\section*{Education}
${standardEducation(data)}` : ""}
${data.certifications?.length ? `\\section*{Certifications}
${simpleList(data.certifications)}` : ""}
${data.publications?.length ? `\\section*{Publications}
${publications(data)}` : ""}
${data.awards?.length ? `\\section*{Awards}
${simpleList(data.awards)}` : ""}
${data.languages?.length ? `\\section*{Languages}
${escapeLatex(data.languages.join(", "))}` : ""}
${data.interests?.length ? `\\section*{Interests}
${escapeLatex(data.interests.join(", "))}` : ""}`;
}

type ResumeSectionKey =
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "publications"
  | "awards"
  | "languages"
  | "interests";

const defaultSectionLabels: Record<ResumeSectionKey, string> = {
  summary: "Profile",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  publications: "Publications",
  awards: "Awards",
  languages: "Languages",
  interests: "Interests",
};

function sectionContent(
  data: ResumeData,
  section: ResumeSectionKey,
  width = "\\textwidth"
): string {
  switch (section) {
    case "summary":
      return escapeLatex(data.summary);
    case "skills":
      return data.skills.length ? standardSkills(data) : "";
    case "experience":
      return data.experience.length
        ? standardExperience(data, width)
        : "";
    case "projects":
      return data.projects.length ? standardProjects(data) : "";
    case "education":
      return data.education.length ? standardEducation(data, width) : "";
    case "certifications":
      return simpleList(data.certifications);
    case "publications":
      return publications(data);
    case "awards":
      return simpleList(data.awards);
    case "languages":
      return data.languages?.length
        ? escapeLatex(data.languages.join(", "))
        : "";
    case "interests":
      return data.interests?.length
        ? escapeLatex(data.interests.join(", "))
        : "";
  }
}

function orderedSections(
  data: ResumeData,
  order: readonly ResumeSectionKey[],
  labels: Partial<Record<ResumeSectionKey, string>> = {},
  command = "\\ResumeSection",
  width = "\\textwidth"
): string {
  return order
    .map((section) => {
      const content = sectionContent(data, section, width);
      if (!content) return "";
      return `${command}{${labels[section] ?? defaultSectionLabels[section]}}
${content}`;
    })
    .filter(Boolean)
    .join("\n");
}

function stackedContact(data: ResumeData): string {
  return getResumeContactItems(data.header)
    .map(latexContactItem)
    .join("\\\\[2pt]\n");
}

type OriginalHeaderStyle = "left" | "center" | "split" | "band";
type OriginalSectionStyle = "rule" | "bar" | "caps";

type OriginalSingleConfig = {
  paper?: "letterpaper" | "a4paper";
  fontSize?: "9pt" | "10pt" | "11pt";
  margin: string;
  accent: string;
  soft: string;
  header: OriginalHeaderStyle;
  section: OriginalSectionStyle;
  order: readonly ResumeSectionKey[];
  labels?: Partial<Record<ResumeSectionKey, string>>;
};

function originalHeader(
  data: ResumeData,
  style: OriginalHeaderStyle
): string {
  const name = escapeLatex(data.header.name);
  const title = escapeLatex(data.header.title);

  if (style === "center") {
    return `\\begin{center}
{\\Huge\\bfseries ${name}}\\\\[2pt]
${title ? `{\\large\\color{ResumeAccent}${title}}\\\\[3pt]` : ""}
{\\small ${contactLine(data)}}
\\end{center}`;
  }

  if (style === "split") {
    return `\\begin{minipage}[t]{0.61\\textwidth}
\\raggedright
{\\LARGE\\bfseries ${name}}\\\\[3pt]
${title ? `{\\large\\color{ResumeAccent}${title}}` : ""}
\\end{minipage}\\hfill
\\begin{minipage}[t]{0.35\\textwidth}
\\raggedleft\\small
${stackedContact(data)}
\\end{minipage}
\\par\\vspace{5pt}{\\color{ResumeAccent}\\hrule}`;
  }

  if (style === "band") {
    return `\\noindent\\colorbox{ResumeAccent}{\\parbox{\\dimexpr\\textwidth-2\\fboxsep}{%
\\color{white}{\\LARGE\\bfseries ${name}}${
      title ? `\\\\[2pt]{\\normalsize ${title}}` : ""
    }}}
\\par\\vspace{4pt}{\\small ${contactLine(data)}}`;
  }

  return `{\\Huge\\bfseries ${name}}\\\\[2pt]
${title ? `{\\large\\color{ResumeAccent}${title}}\\\\[3pt]` : ""}
{\\small ${contactLine(data)}}`;
}

function originalSectionCommand(style: OriginalSectionStyle): string {
  if (style === "bar") {
    return `\\newcommand{\\ResumeSection}[1]{\\par\\vspace{8pt}\\colorbox{ResumeSoft}{\\parbox{\\dimexpr\\textwidth-2\\fboxsep}{\\bfseries\\MakeUppercase{#1}}}\\par\\vspace{4pt}}`;
  }

  if (style === "caps") {
    return `\\newcommand{\\ResumeSection}[1]{\\par\\vspace{10pt}{\\small\\bfseries\\color{ResumeAccent}\\MakeUppercase{#1}}\\par\\vspace{2pt}{\\color{ResumeAccent}\\hrule}\\vspace{4pt}}`;
  }

  return `\\newcommand{\\ResumeSection}[1]{\\par\\vspace{9pt}{\\large\\bfseries\\color{ResumeAccent}#1}\\par\\vspace{2pt}{\\color{ResumeAccent}\\hrule}\\vspace{4pt}}`;
}

function renderOriginalSingle(
  template: ResumeTemplate,
  data: ResumeData,
  config: OriginalSingleConfig
): string {
  return `${basePreamble(template, {
    paper: config.paper,
    fontSize: config.fontSize,
    margin: config.margin,
  })}
\\definecolor{ResumeAccent}{HTML}{${config.accent}}
\\definecolor{ResumeSoft}{HTML}{${config.soft}}
${originalSectionCommand(config.section)}
\\begin{document}
${originalHeader(data, config.header)}
${orderedSections(data, config.order, config.labels)}
\\end{document}`;
}

const originalSingleConfigs: Record<
  | "executive"
  | "swiss"
  | "consulting"
  | "finance"
  | "legal"
  | "clinical"
  | "product"
  | "sales"
  | "graduate"
  | "public-service",
  OriginalSingleConfig
> = {
  executive: {
    paper: "letterpaper",
    fontSize: "10pt",
    margin: "0.56in",
    accent: "1F2937",
    soft: "F3F4F6",
    header: "split",
    section: "bar",
    order: [
      "summary",
      "experience",
      "skills",
      "projects",
      "education",
      "awards",
      "certifications",
      "publications",
      "languages",
      "interests",
    ],
    labels: {
      summary: "Executive Profile",
      experience: "Leadership Experience",
      skills: "Leadership and Expertise",
      projects: "Strategic Initiatives",
    },
  },
  swiss: {
    paper: "a4paper",
    fontSize: "10pt",
    margin: "0.72in",
    accent: "C2410C",
    soft: "FFF7ED",
    header: "left",
    section: "caps",
    order: [
      "summary",
      "experience",
      "projects",
      "skills",
      "education",
      "certifications",
      "awards",
      "publications",
      "languages",
      "interests",
    ],
    labels: { summary: "Profile", experience: "Selected Experience" },
  },
  consulting: {
    paper: "letterpaper",
    fontSize: "10pt",
    margin: "0.58in",
    accent: "7C2D12",
    soft: "FDF2F2",
    header: "center",
    section: "rule",
    order: [
      "summary",
      "experience",
      "education",
      "projects",
      "skills",
      "awards",
      "certifications",
      "publications",
      "languages",
      "interests",
    ],
    labels: {
      summary: "Professional Summary",
      experience: "Experience and Impact",
      projects: "Selected Engagements",
      skills: "Core Capabilities",
    },
  },
  finance: {
    paper: "letterpaper",
    fontSize: "9pt",
    margin: "0.50in",
    accent: "0F3D56",
    soft: "EAF2F5",
    header: "band",
    section: "bar",
    order: [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "awards",
      "publications",
      "languages",
      "interests",
    ],
    labels: {
      summary: "Professional Profile",
      skills: "Financial and Technical Skills",
      experience: "Professional Experience",
      projects: "Transactions and Projects",
    },
  },
  legal: {
    paper: "a4paper",
    fontSize: "10pt",
    margin: "0.76in",
    accent: "4B2E2A",
    soft: "F6F1EE",
    header: "center",
    section: "caps",
    order: [
      "summary",
      "experience",
      "education",
      "certifications",
      "publications",
      "awards",
      "languages",
      "skills",
      "projects",
      "interests",
    ],
    labels: {
      summary: "Professional Profile",
      experience: "Legal and Professional Experience",
      skills: "Practice Areas and Skills",
      certifications: "Admissions and Credentials",
    },
  },
  clinical: {
    paper: "a4paper",
    fontSize: "10pt",
    margin: "0.62in",
    accent: "0F766E",
    soft: "ECFDF5",
    header: "split",
    section: "bar",
    order: [
      "summary",
      "certifications",
      "skills",
      "experience",
      "education",
      "publications",
      "awards",
      "languages",
      "projects",
      "interests",
    ],
    labels: {
      summary: "Clinical Profile",
      certifications: "Licensure and Certifications",
      skills: "Clinical Competencies",
      experience: "Clinical Experience",
      education: "Education and Training",
    },
  },
  product: {
    paper: "letterpaper",
    fontSize: "10pt",
    margin: "0.58in",
    accent: "0E7490",
    soft: "ECFEFF",
    header: "left",
    section: "rule",
    order: [
      "summary",
      "skills",
      "experience",
      "projects",
      "awards",
      "education",
      "certifications",
      "publications",
      "languages",
      "interests",
    ],
    labels: {
      summary: "Product Profile",
      skills: "Product Capabilities",
      experience: "Experience and Outcomes",
      projects: "Products and Initiatives",
    },
  },
  sales: {
    paper: "letterpaper",
    fontSize: "10pt",
    margin: "0.55in",
    accent: "B42318",
    soft: "FEF3F2",
    header: "band",
    section: "bar",
    order: [
      "summary",
      "experience",
      "skills",
      "awards",
      "projects",
      "education",
      "certifications",
      "languages",
      "interests",
      "publications",
    ],
    labels: {
      summary: "Commercial Profile",
      experience: "Revenue and Growth Experience",
      skills: "Commercial Strengths",
      projects: "Key Accounts and Initiatives",
      awards: "Recognition",
    },
  },
  graduate: {
    paper: "letterpaper",
    fontSize: "9pt",
    margin: "0.48in",
    accent: "1D4ED8",
    soft: "EFF6FF",
    header: "center",
    section: "bar",
    order: [
      "summary",
      "education",
      "skills",
      "projects",
      "experience",
      "certifications",
      "awards",
      "languages",
      "interests",
      "publications",
    ],
    labels: {
      summary: "Profile",
      projects: "Academic and Personal Projects",
      experience: "Experience and Activities",
      certifications: "Courses and Certifications",
    },
  },
  "public-service": {
    paper: "a4paper",
    fontSize: "10pt",
    margin: "0.68in",
    accent: "1E3A5F",
    soft: "EAF0F6",
    header: "left",
    section: "caps",
    order: [
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "awards",
      "certifications",
      "languages",
      "publications",
      "interests",
    ],
    labels: {
      summary: "Public Service Profile",
      experience: "Service and Professional Experience",
      skills: "Policy and Program Skills",
      projects: "Programs and Initiatives",
    },
  },
};

type OriginalSidebarConfig = {
  accent: string;
  soft: string;
  header: "center" | "band";
  leftOrder: readonly ResumeSectionKey[];
  rightOrder: readonly ResumeSectionKey[];
  labels: Partial<Record<ResumeSectionKey, string>>;
};

function renderOriginalSidebar(
  template: ResumeTemplate,
  data: ResumeData,
  config: OriginalSidebarConfig
): string {
  return `${basePreamble(template, {
    paper: "letterpaper",
    fontSize: "9pt",
    margin: "0.48in",
  })}
\\definecolor{ResumeAccent}{HTML}{${config.accent}}
\\definecolor{ResumeSoft}{HTML}{${config.soft}}
\\newcommand{\\SideSection}[1]{\\par\\vspace{7pt}\\colorbox{ResumeSoft}{\\parbox{\\dimexpr\\linewidth-2\\fboxsep}{\\small\\bfseries\\color{ResumeAccent}\\MakeUppercase{#1}}}\\par\\vspace{3pt}}
\\newcommand{\\MainSection}[1]{\\par\\vspace{8pt}{\\large\\bfseries\\color{ResumeAccent}#1}\\par\\vspace{2pt}{\\color{ResumeAccent}\\hrule}\\vspace{4pt}}
\\setlength{\\columnsep}{0.28in}
\\newcommand{\\ResumeHeader}{%
${originalHeader(data, config.header)}
}
\\begin{document}
\\twocolumn[\\ResumeHeader\\par\\vspace{6pt}]
\\raggedright
${orderedSections(
  data,
  config.leftOrder,
  config.labels,
  "\\SideSection",
  "\\linewidth"
)}
\\newpage
\\raggedright
${orderedSections(
  data,
  config.rightOrder,
  config.labels,
  "\\MainSection",
  "\\linewidth"
)}
\\end{document}`;
}

const originalSidebarConfigs: Record<"data" | "cyber", OriginalSidebarConfig> = {
  data: {
    accent: "0369A1",
    soft: "E0F2FE",
    header: "center",
    leftOrder: ["skills", "education", "certifications", "languages"],
    rightOrder: [
      "summary",
      "experience",
      "projects",
      "publications",
      "awards",
      "interests",
    ],
    labels: {
      summary: "Analytical Profile",
      skills: "Methods and Tools",
      experience: "Experience and Results",
      projects: "Selected Analysis",
      certifications: "Credentials",
    },
  },
  cyber: {
    accent: "166534",
    soft: "F0FDF4",
    header: "band",
    leftOrder: ["skills", "certifications", "education", "languages"],
    rightOrder: [
      "summary",
      "experience",
      "projects",
      "awards",
      "publications",
      "interests",
    ],
    labels: {
      summary: "Security Profile",
      skills: "Security Stack",
      experience: "Security Experience",
      projects: "Systems and Initiatives",
      certifications: "Security Credentials",
    },
  },
};

function renderHarshibar(template: ResumeTemplate, data: ResumeData): string {
  return `${basePreamble(template, { margin: "0.52in" })}
\\definecolor{ResumeAccent}{HTML}{0F766E}
\\definecolor{ResumeText}{HTML}{17212B}
\\color{ResumeText}
\\newcommand{\\ResumeSection}[1]{\\par\\vspace{8pt}{\\large\\bfseries\\MakeUppercase{#1}}\\par\\vspace{2pt}{\\color{ResumeAccent}\\hrule}\\vspace{4pt}}
\\makeatletter
\\renewcommand{\\section}{\\@ifstar{\\ResumeSection}{\\ResumeSection}}
\\makeatother
\\begin{document}
\\begin{center}
{\\Huge\\bfseries ${escapeLatex(data.header.name)}}\\\\[3pt]
${data.header.title ? `{\\large ${escapeLatex(data.header.title)}}\\\\[3pt]` : ""}
{\\small ${contactLine(data)}}
\\end{center}
${data.summary ? `\\section*{Summary}
${escapeLatex(data.summary)}` : ""}
${data.skills.length ? `\\section*{Skills}
${standardSkills(data)}` : ""}
${data.experience.length ? `\\section*{Experience}
${standardExperience(data)}` : ""}
${optionalStandardSections(data)}
\\end{document}`;
}

function renderCurve(template: ResumeTemplate, data: ResumeData): string {
  return `${basePreamble(template, {
    paper: "a4paper",
    fontSize: "11pt",
    margin: "0.72in",
  })}
\\definecolor{ResumeAccent}{HTML}{8B1E3F}
\\definecolor{ResumeSoft}{HTML}{F7EEF1}
\\newcommand{\\ResumeSection}[1]{\\par\\vspace{12pt}{\\Large\\bfseries\\color{ResumeAccent}#1}\\par\\vspace{4pt}}
\\makeatletter
\\renewcommand{\\section}{\\@ifstar{\\ResumeSection}{\\ResumeSection}}
\\makeatother
\\begin{document}
\\begin{minipage}[t]{0.76\\textwidth}
{\\Huge\\bfseries ${escapeLatex(data.header.name)}}\\\\[5pt]
${data.header.title ? `{\\large\\color{ResumeAccent}${escapeLatex(data.header.title)}}\\\\[6pt]` : ""}
{\\small ${contactLine(data)}}
\\end{minipage}\\hfill
\\begin{minipage}[t]{0.19\\textwidth}
\\raggedleft
\\IfFileExists{profile-photo.jpg}{\\includegraphics[width=1.05in,height=1.05in,keepaspectratio]{profile-photo.jpg}}{}
\\end{minipage}
\\vspace{7pt}
\\colorbox{ResumeSoft}{\\parbox{\\dimexpr\\textwidth-2\\fboxsep}{\\small ${escapeLatex(
    data.summary
  )}}}
${data.experience.length ? `\\section*{Experience}
${standardExperience(data)}` : ""}
${data.education.length ? `\\section*{Education}
${standardEducation(data)}` : ""}
${data.skills.length ? `\\section*{Expertise}
${standardSkills(data)}` : ""}
${optionalStandardSections({ ...data, education: [], projects: [] })}
\\end{document}`;
}

function renderNortheastern(
  template: ResumeTemplate,
  data: ResumeData
): string {
  return `${basePreamble(template, {
    paper: "a4paper",
    fontSize: "10pt",
    margin: "0.86in",
  })}
\\definecolor{ResumeAccent}{HTML}{C8102E}
\\newcommand{\\ResumeSection}[1]{\\par\\vspace{14pt}{\\Large\\bfseries #1}\\par\\vspace{2pt}{\\color{ResumeAccent}\\hrule}\\vspace{6pt}}
\\makeatletter
\\renewcommand{\\section}{\\@ifstar{\\ResumeSection}{\\ResumeSection}}
\\makeatother
\\begin{document}
{\\LARGE\\bfseries ${escapeLatex(data.header.name)}}\\\\[2pt]
${data.header.title ? `${escapeLatex(data.header.title)}\\\\[2pt]` : ""}
{\\small ${contactLine(data)}}\\\\[8pt]
${data.summary ? `\\section*{Professional Profile}
${escapeLatex(data.summary)}` : ""}
${data.education.length ? `\\section*{Education}
${standardEducation(data)}` : ""}
${data.experience.length ? `\\section*{Appointments and Experience}
${standardExperience(data)}` : ""}
${data.publications?.length ? `\\section*{Selected Publications}
${publications(data)}` : ""}
${data.projects.length ? `\\section*{Research and Projects}
${standardProjects(data)}` : ""}
${data.awards?.length ? `\\section*{Honors and Awards}
${simpleList(data.awards)}` : ""}
${data.skills.length ? `\\section*{Technical and Professional Skills}
${standardSkills(data)}` : ""}
${data.certifications?.length ? `\\section*{Certifications}
${simpleList(data.certifications)}` : ""}
\\end{document}`;
}

function renderBoltach(template: ResumeTemplate, data: ResumeData): string {
  return `${basePreamble(template, {
    paper: "a4paper",
    fontSize: "11pt",
    margin: "0.78in",
  })}
\\definecolor{ResumeAccent}{HTML}{334155}
\\newcommand{\\CVSection}[1]{\\par\\vspace{10pt}{\\large\\bfseries\\uppercase{#1}}\\par\\color{ResumeAccent}\\hrule\\color{black}\\vspace{5pt}}
\\newcommand{\\PersonalEntry}[2]{\\textit{#1}\\hspace{1em}#2\\par}
\\begin{document}
\\hfill {\\Huge\\bfseries ${escapeLatex(data.header.name)}}\\\\[-1pt]
\\hfill {\\large\\itshape ${escapeLatex(data.header.title)}}\\\\[8pt]
${boltachContactEntries(data)}
${data.summary ? `\\CVSection{Profile}
${escapeLatex(data.summary)}` : ""}
${data.experience.length ? `\\CVSection{Experience}
${standardExperience(data)}` : ""}
${data.education.length ? `\\CVSection{Education}
${standardEducation(data)}` : ""}
${data.skills.length ? `\\CVSection{Skills}
${standardSkills(data)}` : ""}
${data.projects.length ? `\\CVSection{Projects}
${standardProjects(data)}` : ""}
${data.certifications?.length ? `\\CVSection{Certifications}
${simpleList(data.certifications)}` : ""}
\\end{document}`;
}

function renderPortrait(template: ResumeTemplate, data: ResumeData): string {
  return `${basePreamble(template, {
    paper: "a4paper",
    fontSize: "10pt",
    margin: "0.66in",
  })}
\\definecolor{ResumeAccent}{HTML}{0F4C5C}
\\definecolor{ResumeSoft}{HTML}{E7F1F3}
\\newcommand{\\ResumeSection}[1]{\\par\\vspace{9pt}{\\large\\bfseries\\color{ResumeAccent}#1}\\par\\vspace{2pt}\\hrule\\vspace{4pt}}
\\makeatletter
\\renewcommand{\\section}{\\@ifstar{\\ResumeSection}{\\ResumeSection}}
\\makeatother
\\begin{document}
\\begin{minipage}[c]{0.20\\textwidth}
\\IfFileExists{profile-photo.jpg}{\\includegraphics[width=1.12in,height=1.12in,keepaspectratio]{profile-photo.jpg}}{\\colorbox{ResumeSoft}{\\rule{0pt}{1.08in}\\rule{1.08in}{0pt}}}
\\end{minipage}
\\begin{minipage}[c]{0.77\\textwidth}
{\\Huge\\bfseries\\color{ResumeAccent}${escapeLatex(data.header.name)}}\\\\[4pt]
${data.header.title ? `{\\large ${escapeLatex(data.header.title)}}\\\\[5pt]` : ""}
{\\small ${contactLine(data)}}
\\end{minipage}
\\vspace{8pt}
${data.summary ? `\\section*{Profile}
${escapeLatex(data.summary)}` : ""}
${data.experience.length ? `\\section*{Professional Experience}
${standardExperience(data)}` : ""}
${data.projects.length ? `\\section*{Selected Projects}
${standardProjects(data)}` : ""}
${data.education.length ? `\\section*{Education}
${standardEducation(data)}` : ""}
${data.skills.length ? `\\section*{Skills}
${standardSkills(data)}` : ""}
${data.certifications?.length ? `\\section*{Credentials}
${simpleList(data.certifications)}` : ""}
\\end{document}`;
}

function renderIiit(template: ResumeTemplate, data: ResumeData): string {
  return `${basePreamble(template, {
    paper: "a4paper",
    fontSize: "9pt",
    margin: "0.46in",
  })}
\\definecolor{ResumeBar}{HTML}{E5E7EB}
\\newcommand{\\BarSection}[1]{\\par\\vspace{5pt}\\colorbox{ResumeBar}{\\parbox{\\dimexpr\\textwidth-2\\fboxsep}{\\textbf{\\uppercase{#1}}}}\\par\\vspace{3pt}}
\\begin{document}
\\begin{center}
{\\LARGE\\bfseries ${escapeLatex(data.header.name)}}\\\\[2pt]
${data.header.title ? `\\textbf{${escapeLatex(data.header.title)}}\\\\[2pt]` : ""}
{\\small ${contactLine(data)}}
\\end{center}
${data.summary ? `\\BarSection{Profile}
${escapeLatex(data.summary)}` : ""}
${data.education.length ? `\\BarSection{Education}
${standardEducation(data)}` : ""}
${data.skills.length ? `\\BarSection{Technical Skills}
${standardSkills(data)}` : ""}
${data.experience.length ? `\\BarSection{Experience}
${standardExperience(data)}` : ""}
${data.projects.length ? `\\BarSection{Projects}
${standardProjects(data)}` : ""}
${data.certifications?.length ? `\\BarSection{Achievements and Certifications}
${simpleList(data.certifications)}` : ""}
\\end{document}`;
}

function renderDeedy(template: ResumeTemplate, data: ResumeData): string {
  return `${basePreamble(template, {
    paper: "letterpaper",
    fontSize: "9pt",
    margin: "0.45in",
  })}
\\definecolor{ResumeAccent}{HTML}{111827}
\\newcommand{\\ColumnSection}[1]{\\par\\vspace{6pt}{\\large\\bfseries\\uppercase{#1}}\\par\\vspace{2pt}}
\\begin{document}
\\begin{center}
{\\Huge\\bfseries ${escapeLatex(data.header.name)}}\\\\[2pt]
${data.header.title ? `${escapeLatex(data.header.title)}\\\\[2pt]` : ""}
{\\small ${contactLine(data)}}
\\end{center}
\\vspace{3pt}
\\begin{minipage}[t]{0.31\\textwidth}
\\raggedright
${data.summary ? `\\ColumnSection{Profile}
${escapeLatex(data.summary)}` : ""}
${data.skills.length ? `\\ColumnSection{Skills}
${standardSkills(data)}` : ""}
${data.education.length ? `\\ColumnSection{Education}
${data.education
  .map(
    (education) => `\\textbf{${escapeLatex(education.degree)}}\\\\
${escapeLatex(education.school)}\\\\
${escapeLatex(education.year)}${
      education.cgpa ? `, ${escapeLatex(education.cgpa)}` : ""
    }\\\\[4pt]`
  )
  .join("\n")}` : ""}
${data.certifications?.length ? `\\ColumnSection{Credentials}
${simpleList(data.certifications)}` : ""}
${data.languages?.length ? `\\ColumnSection{Languages}
${escapeLatex(data.languages.join(", "))}` : ""}
\\end{minipage}\\hfill
\\begin{minipage}[t]{0.65\\textwidth}
\\raggedright
${data.experience.length ? `\\ColumnSection{Experience}
${standardExperience(data)}` : ""}
${data.projects.length ? `\\ColumnSection{Projects}
${standardProjects(data)}` : ""}
${data.publications?.length ? `\\ColumnSection{Publications}
${publications(data)}` : ""}
${data.awards?.length ? `\\ColumnSection{Awards}
${simpleList(data.awards)}` : ""}
\\end{minipage}
\\end{document}`;
}

function renderEngineer(template: ResumeTemplate, data: ResumeData): string {
  return `${basePreamble(template, {
    paper: "a4paper",
    fontSize: "10pt",
    margin: "0.58in",
  })}
\\definecolor{ResumeAccent}{HTML}{1D4ED8}
\\newcommand{\\ResumeSection}[1]{\\par\\vspace{8pt}{\\large\\bfseries\\color{ResumeAccent}\\MakeUppercase{#1}}\\par\\vspace{2pt}\\hrule\\vspace{4pt}}
\\makeatletter
\\renewcommand{\\section}{\\@ifstar{\\ResumeSection}{\\ResumeSection}}
\\makeatother
\\begin{document}
{\\Huge\\bfseries ${escapeLatex(data.header.name)}}\\\\[2pt]
${data.header.title ? `{\\large\\color{ResumeAccent}${escapeLatex(data.header.title)}}\\\\[4pt]` : ""}
${contactLine(data)}\\\\[6pt]
${data.summary ? `\\section*{Engineering Profile}
${escapeLatex(data.summary)}` : ""}
${data.skills.length ? `\\section*{Technical Strengths}
${standardSkills(data)}` : ""}
${data.experience.length ? `\\section*{Professional Experience}
${standardExperience(data)}` : ""}
${data.projects.length ? `\\section*{Selected Engineering Projects}
${standardProjects(data)}` : ""}
${data.education.length ? `\\section*{Education}
${standardEducation(data)}` : ""}
${data.certifications?.length ? `\\section*{Certifications}
${simpleList(data.certifications)}` : ""}
${data.awards?.length ? `\\section*{Honors}
${simpleList(data.awards)}` : ""}
\\end{document}`;
}

function renderResearcher(template: ResumeTemplate, data: ResumeData): string {
  return `${basePreamble(template, {
    paper: "a4paper",
    fontSize: "10pt",
    margin: "0.72in",
  })}
\\definecolor{ResumeAccent}{HTML}{2563EB}
\\newcommand{\\AcademicSection}[1]{\\par\\vspace{11pt}{\\Large\\bfseries\\color{ResumeAccent}#1}\\par\\vspace{2pt}\\hrule\\vspace{5pt}}
\\begin{document}
{\\Huge\\bfseries ${escapeLatex(data.header.name)}}\\\\[2pt]
${data.header.title ? `{\\large\\color{ResumeAccent}${escapeLatex(data.header.title)}}\\\\[4pt]` : ""}
${contactLine(data)}\\\\[7pt]
${data.summary ? `${escapeLatex(data.summary)}` : ""}
${data.education.length ? `\\AcademicSection{Education}
${standardEducation(data)}` : ""}
${data.experience.length ? `\\AcademicSection{Research and Appointments}
${standardExperience(data)}` : ""}
${data.publications?.length ? `\\AcademicSection{Selected Publications}
${publications(data)}` : ""}
${data.projects.length ? `\\AcademicSection{Projects}
${standardProjects(data)}` : ""}
${data.awards?.length ? `\\AcademicSection{Awards and Grants}
${simpleList(data.awards)}` : ""}
${data.skills.length ? `\\AcademicSection{Methods and Skills}
${standardSkills(data)}` : ""}
${data.certifications?.length ? `\\AcademicSection{Professional Development}
${simpleList(data.certifications)}` : ""}
\\end{document}`;
}

const renderers: Record<
  ResumeTemplateId,
  (template: ResumeTemplate, data: ResumeData) => string
> = {
  harshibar: renderHarshibar,
  curve: renderCurve,
  northeastern: renderNortheastern,
  boltach: renderBoltach,
  portrait: renderPortrait,
  iiit: renderIiit,
  deedy: renderDeedy,
  engineer: renderEngineer,
  researcher: renderResearcher,
  executive: (template, data) =>
    renderOriginalSingle(template, data, originalSingleConfigs.executive),
  swiss: (template, data) =>
    renderOriginalSingle(template, data, originalSingleConfigs.swiss),
  consulting: (template, data) =>
    renderOriginalSingle(template, data, originalSingleConfigs.consulting),
  finance: (template, data) =>
    renderOriginalSingle(template, data, originalSingleConfigs.finance),
  legal: (template, data) =>
    renderOriginalSingle(template, data, originalSingleConfigs.legal),
  clinical: (template, data) =>
    renderOriginalSingle(template, data, originalSingleConfigs.clinical),
  data: (template, data) =>
    renderOriginalSidebar(template, data, originalSidebarConfigs.data),
  cyber: (template, data) =>
    renderOriginalSidebar(template, data, originalSidebarConfigs.cyber),
  product: (template, data) =>
    renderOriginalSingle(template, data, originalSingleConfigs.product),
  sales: (template, data) =>
    renderOriginalSingle(template, data, originalSingleConfigs.sales),
  graduate: (template, data) =>
    renderOriginalSingle(template, data, originalSingleConfigs.graduate),
  "public-service": (template, data) =>
    renderOriginalSingle(
      template,
      data,
      originalSingleConfigs["public-service"]
    ),
};

export function generateResumeLatex(
  templateId: ResumeTemplateId,
  data: ResumeData
): string {
  const template = getResumeTemplate(templateId);
  return renderers[template.id](template, data).trim();
}

export function generateResumeMarkdown(data: ResumeData): string {
  const lines: string[] = [`# ${data.header.name}`];
  const headerDetails = nonEmpty([
    data.header.title,
    ...getResumeContactItems(data.header).map((item) =>
      item.href ? `[${item.text}](${item.href})` : item.text
    ),
  ]);

  if (headerDetails.length) lines.push("", headerDetails.join(" | "));
  if (data.summary) lines.push("", "## Summary", "", data.summary);

  if (data.skills.length) {
    lines.push("", "## Skills", "");
    for (const skill of data.skills) {
      lines.push(`**${skill.group}:** ${skill.items.join(", ")}`);
    }
  }

  if (data.experience.length) {
    lines.push("", "## Experience", "");
    for (const experience of data.experience) {
      lines.push(
        `### ${experience.role} at ${experience.company}`,
        "",
        `${experience.start} - ${experience.end}`,
        "",
        ...experience.bullets.map((bullet) => `- ${bullet}`),
        ""
      );
    }
  }

  if (data.projects.length) {
    lines.push("", "## Projects", "");
    for (const project of data.projects) {
      lines.push(
        `### ${project.name}`,
        "",
        project.description,
        ...project.bullets.map((bullet) => `- ${bullet}`),
        ""
      );
    }
  }

  if (data.education.length) {
    lines.push("", "## Education", "");
    for (const education of data.education) {
      lines.push(
        `- **${education.degree}**, ${education.school}${
          education.year ? ` (${education.year})` : ""
        }${education.cgpa ? `, ${education.cgpa}` : ""}`
      );
    }
  }

  const listSections: Array<[string, string[] | undefined]> = [
    ["Certifications", data.certifications],
    [
      "Publications",
      data.publications?.map((item) =>
        nonEmpty([item.title, item.venue, item.year]).join(", ")
      ),
    ],
    ["Awards", data.awards],
    ["Languages", data.languages],
    ["Interests", data.interests],
  ];

  for (const [title, items] of listSections) {
    if (items?.length) {
      lines.push("", `## ${title}`, "", ...items.map((item) => `- ${item}`));
    }
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
