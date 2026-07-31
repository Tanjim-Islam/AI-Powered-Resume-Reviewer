import type { ResumeData } from "@/lib/schemas";

export const templatePreviewResumeData: ResumeData = {
  header: {
    name: "Jordan Alexandra Lee",
    title: "Senior Product and Security Engineer",
    location: "Toronto, Canada",
    phone: "+1 555 014 8820",
    email: "jordan.lee@example.com",
    linkedin: "linkedin.com/in/jordan-lee",
    portfolio: "jordanlee.dev",
    links: [
      "github.com/jordanlee",
      "huggingface.co/jordanlee",
      "scholar.google.com/citations?user=JordanLee",
    ],
  },
  summary:
    "Product-minded engineer with eight years of experience building secure, accessible platforms. Leads cross-functional delivery, improves reliability, and turns complex customer needs into clear product outcomes.",
  skills: [
    {
      group: "Engineering",
      items: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"],
    },
    {
      group: "Security",
      items: ["Threat modeling", "OAuth", "OWASP", "Cloud security"],
    },
    {
      group: "Leadership",
      items: ["Roadmaps", "Mentoring", "Stakeholder communication"],
    },
  ],
  experience: [
    {
      company: "Northstar Systems",
      role: "Senior Product Engineer",
      start: "2022",
      end: "Present",
      bullets: [
        "Led a four-person team that shipped a self-service onboarding flow and reduced setup time by 42 percent.",
        "Introduced threat modeling and automated security checks across the release process.",
      ],
      tech: ["Next.js", "TypeScript", "PostgreSQL", "AWS"],
    },
    {
      company: "Signal Works",
      role: "Software Engineer",
      start: "2018",
      end: "2022",
      bullets: [
        "Built analytics and workflow tools used by more than 12,000 monthly users.",
        "Partnered with design and support teams to improve accessibility and task completion.",
      ],
      tech: ["React", "Node.js", "Python"],
    },
  ],
  projects: [
    {
      name: "Open Risk Atlas",
      description:
        "An open-source library for documenting product risks and mitigations.",
      bullets: [
        "Designed the schema, contributor workflow, and searchable documentation site.",
      ],
      tech: ["TypeScript", "MDX", "GitHub Actions"],
    },
  ],
  education: [
    {
      school: "University of Toronto",
      degree: "B.Sc. in Computer Science",
      year: "2018",
    },
  ],
  certifications: ["Certified Cloud Security Professional, 2024"],
  publications: [
    {
      title: "Practical Threat Modeling for Product Teams",
      venue: "Secure Systems Review",
      year: "2023",
    },
  ],
  awards: ["Northstar Engineering Impact Award, 2024"],
  languages: ["English", "French"],
  interests: ["Open source", "Mentoring", "Urban photography"],
};
