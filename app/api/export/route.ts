import { NextRequest, NextResponse } from "next/server";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { ExportRequestSchema, type ResumeData } from "@/lib/schemas";

export const runtime = "nodejs";

function sectionHeading(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 8,
        color: "0F766E",
      },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 22,
        color: "0F766E",
      }),
    ],
  });
}

function bullet(text: string) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 60 },
  });
}

function generateDocx(data: ResumeData): Promise<Buffer> {
  const contacts = [
    data.header.location,
    data.header.phone,
    data.header.email,
    data.header.linkedin,
    data.header.portfolio,
  ].filter(Boolean);

  const content: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: data.header.name,
          bold: true,
          size: 34,
          color: "17212B",
        }),
      ],
    }),
  ];

  if (data.header.title) {
    content.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: data.header.title,
            bold: true,
            size: 22,
            color: "0F766E",
          }),
        ],
      })
    );
  }

  if (contacts.length) {
    content.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 140 },
        children: [new TextRun({ text: contacts.join(" | "), size: 18 })],
      })
    );
  }

  if (data.summary) {
    content.push(
      sectionHeading("Summary"),
      new Paragraph({ text: data.summary, spacing: { after: 80 } })
    );
  }

  if (data.skills.length) {
    content.push(sectionHeading("Skills"));
    for (const skill of data.skills) {
      content.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${skill.group}: `, bold: true }),
            new TextRun(skill.items.join(", ")),
          ],
        })
      );
    }
  }

  if (data.experience.length) {
    content.push(sectionHeading("Experience"));
    for (const experience of data.experience) {
      content.push(
        new Paragraph({
          spacing: { before: 100, after: 20 },
          children: [
            new TextRun({
              text: `${experience.role} at ${experience.company}`,
              bold: true,
              size: 21,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: [experience.start, experience.end]
                .filter(Boolean)
                .join(" - "),
              italics: true,
              color: "64748B",
            }),
          ],
        }),
        ...experience.bullets.map(bullet)
      );
    }
  }

  if (data.projects.length) {
    content.push(sectionHeading("Projects"));
    for (const project of data.projects) {
      content.push(
        new Paragraph({
          spacing: { before: 80, after: 30 },
          children: [
            new TextRun({ text: project.name, bold: true, size: 21 }),
            ...(project.tech?.length
              ? [
                  new TextRun({
                    text: ` | ${project.tech.join(", ")}`,
                    italics: true,
                    color: "64748B",
                  }),
                ]
              : []),
          ],
        })
      );
      if (project.description) {
        content.push(
          new Paragraph({
            text: project.description,
            spacing: { after: 40 },
          })
        );
      }
      content.push(...project.bullets.map(bullet));
    }
  }

  if (data.education.length) {
    content.push(sectionHeading("Education"));
    for (const education of data.education) {
      content.push(
        new Paragraph({
          spacing: { before: 60, after: 20 },
          children: [
            new TextRun({ text: education.degree, bold: true }),
            new TextRun(
              `${education.school ? `, ${education.school}` : ""}${
                education.year ? ` | ${education.year}` : ""
              }${education.cgpa ? ` | ${education.cgpa}` : ""}`
            ),
          ],
        })
      );
    }
  }

  const additionalSections: Array<[string, string[] | undefined]> = [
    ["Certifications", data.certifications],
    [
      "Publications",
      data.publications?.map((publication) =>
        [publication.title, publication.venue, publication.year]
          .filter(Boolean)
          .join(", ")
      ),
    ],
    ["Awards", data.awards],
    ["Languages", data.languages],
    ["Interests", data.interests],
  ];

  for (const [title, items] of additionalSections) {
    if (items?.length) {
      content.push(sectionHeading(title), ...items.map(bullet));
    }
  }

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 540,
              right: 620,
              bottom: 540,
              left: 620,
            },
          },
        },
        children: content,
      },
    ],
  });

  return Packer.toBuffer(document).then((buffer) => Buffer.from(buffer));
}

export async function POST(request: NextRequest) {
  try {
    const parsed = ExportRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Only DOCX export is available through this endpoint." },
        { status: 400 }
      );
    }

    const buffer = await generateDocx(parsed.data.rewriteJson);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="resume-${Date.now()}.docx"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("DOCX export error:", error);
    return NextResponse.json(
      { error: "Resume export failed. Please try again." },
      { status: 500 }
    );
  }
}
