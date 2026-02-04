import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { ExportRequestSchema, RewriteResponse } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rewriteJson, format } = ExportRequestSchema.parse(body);

    if (format === "docx") {
      const docxBuffer = await generateDocx(rewriteJson);

      return new NextResponse(new Uint8Array(docxBuffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="resume-${Date.now()}.docx"`,
        },
      });
    } else if (format === "pdf") {
      const pdfBuffer = await generatePdf(rewriteJson);

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="resume-${Date.now()}.pdf"`,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid format. Use 'docx' or 'pdf'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Export error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateDocx(
  resumeData: RewriteResponse["json"]
): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header with proper spacing
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.header.name,
                bold: true,
                size: 32,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
          }),

          ...(resumeData.header.title
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: resumeData.header.title,
                      bold: true,
                      size: 24,
                    }),
                  ],
                }),
              ]
            : []),

          ...(resumeData.header.location
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: resumeData.header.location,
                      size: 20,
                    }),
                  ],
                }),
              ]
            : []),

          ...(() => {
            const contacts = [
              resumeData.header.phone,
              resumeData.header.email,
              resumeData.header.linkedin,
              resumeData.header.portfolio,
            ].filter(Boolean);

            if (contacts.length === 0) {
              return [];
            }

            return [
              new Paragraph({
                children: [
                  new TextRun({
                    text: contacts.join(" | "),
                    size: 18,
                  }),
                ],
              }),
            ];
          })(),

          // Separator line after header
          new Paragraph({
            children: [
              new TextRun({
                text: "-".repeat(50),
                size: 16,
              }),
            ],
          }),

          // Summary
          new Paragraph({
            children: [
              new TextRun({
                text: "SUMMARY",
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              after: 300,
              before: 200,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.summary,
                size: 22,
              }),
            ],
            spacing: {
              after: 400,
            },
          }),

          // Skills
          new Paragraph({
            children: [
              new TextRun({
                text: "SKILLS",
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              after: 300,
              before: 200,
            },
          }),
          ...resumeData.skills.flatMap(
            (skillGroup: { group: string; items: string[] }) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${skillGroup.group}: `,
                    bold: true,
                    size: 20,
                  }),
                  new TextRun({
                    text: skillGroup.items.join(", "),
                    size: 20,
                  }),
                ],
              }),
            ]
          ),

          // Experience
          new Paragraph({
            children: [
              new TextRun({
                text: "EXPERIENCE",
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              after: 300,
              before: 200,
            },
          }),
          ...resumeData.experience.flatMap(
            (exp: {
              company: string;
              role: string;
              start: string;
              end: string;
              bullets: string[];
              tech?: string[];
            }) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.role} at ${exp.company}`,
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.start} - ${exp.end}`,
                    size: 18,
                  }),
                ],
              }),
              ...exp.bullets.map(
                (bullet: string) =>
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `• ${bullet}`,
                        size: 20,
                      }),
                    ],
                  })
              ),
            ]
          ),

          // Projects
          ...(resumeData.projects.length > 0
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "PROJECTS",
                      bold: true,
                      size: 28,
                    }),
                  ],
                  heading: HeadingLevel.HEADING_2,
                  spacing: {
                    after: 300,
                    before: 200,
                  },
                }),
                ...resumeData.projects.flatMap(
                  (project: {
                    name: string;
                    description: string;
                    bullets: string[];
                    tech?: string[];
                  }) => [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: project.name,
                          bold: true,
                          size: 20,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: project.description,
                          size: 20,
                        }),
                      ],
                    }),
                    ...project.bullets.map(
                      (bullet: string) =>
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `• ${bullet}`,
                              size: 20,
                            }),
                          ],
                        })
                    ),
                  ]
                ),
              ]
            : []),

          // Education
          new Paragraph({
            children: [
              new TextRun({
                text: "EDUCATION",
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              after: 300,
              before: 200,
            },
          }),
          ...resumeData.education.map(
            (edu: {
              school: string;
              degree: string;
              year?: string;
              cgpa?: string;
            }) => {
              let eduText = `${edu.degree} - ${edu.school}`;
              if (edu.cgpa) {
                eduText += ` (CGPA: ${edu.cgpa})`;
              }
              return new Paragraph({
                children: [
                  new TextRun({
                    text: eduText,
                    bold: true,
                    size: 20,
                  }),
                ],
              });
            }
          ),

          // Certifications
          ...(resumeData.certifications && resumeData.certifications.length > 0
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "CERTIFICATIONS",
                      bold: true,
                      size: 28,
                    }),
                  ],
                  heading: HeadingLevel.HEADING_2,
                  spacing: {
                    after: 300,
                    before: 200,
                  },
                }),
                ...resumeData.certifications.map(
                  (cert: string) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${cert}`,
                          size: 20,
                        }),
                      ],
                    })
                ),
              ]
            : []),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

async function generatePdf(
  resumeData: RewriteResponse["json"]
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const pageSize: [number, number] = [612, 792]; // Letter size
  let page = pdfDoc.addPage(pageSize);
  let { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = height - 50;
  const lineHeight = 20;
  const sectionSpacing = 30;
  const bottomMargin = 50;

  const addPage = () => {
    page = pdfDoc.addPage(pageSize);
    ({ width, height } = page.getSize());
    yPosition = height - 50;
  };

  const ensureSpace = (linesNeeded: number) => {
    if (yPosition - linesNeeded * lineHeight < bottomMargin) {
      addPage();
    }
  };

  const addText = (
    text: string,
    x: number,
    y: number,
    fontSize: number = 12,
    isBold: boolean = false
  ) => {
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font: isBold ? boldFont : font,
      color: rgb(0, 0, 0),
    });
  };

  const wrapText = (
    text: string,
    maxWidth: number,
    fontSize: number = 12
  ): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  // Header with proper spacing
  addText(resumeData.header.name, 50, yPosition, 24, true);
  yPosition -= 30;

  if (resumeData.header.title) {
    ensureSpace(1.5);
    addText(resumeData.header.title, 50, yPosition, 16, true);
    yPosition -= 20;
  }

  if (resumeData.header.location) {
    ensureSpace(1.5);
    addText(resumeData.header.location, 50, yPosition, 14);
    yPosition -= 20;
  }

  const contacts = [
    resumeData.header.phone,
    resumeData.header.email,
    resumeData.header.linkedin,
    resumeData.header.portfolio,
  ].filter(Boolean);

  if (contacts.length > 0) {
    ensureSpace(1.5);
    addText(contacts.join(" | "), 50, yPosition, 12);
    yPosition -= 20;
  }

  // Separator line after header
  ensureSpace(2);
  yPosition -= 10;
  addText(
    "--------------------------------------------------",
    50,
    yPosition,
    12
  );
  yPosition -= 30;

  ensureSpace(3);
  addText("SUMMARY", 50, yPosition, 20, true);
  yPosition -= 30;

  const summaryLines = wrapText(resumeData.summary, width - 100, 12);
  for (const line of summaryLines) {
    ensureSpace(1);
    addText(line, 50, yPosition, 12);
    yPosition -= lineHeight;
  }

  yPosition -= 40;

  ensureSpace(3);
  addText("SKILLS", 50, yPosition, 20, true);
  yPosition -= 30;

  for (const skillGroup of resumeData.skills) {
    const skillText = `${skillGroup.group}: ${skillGroup.items.join(", ")}`;
    const skillLines = wrapText(skillText, width - 100, 12);
    ensureSpace(skillLines.length + 1);
    for (const line of skillLines) {
      addText(line, 50, yPosition, 12);
      yPosition -= lineHeight;
    }
  }

  yPosition -= sectionSpacing;

  ensureSpace(3);
  addText("EXPERIENCE", 50, yPosition, 20, true);
  yPosition -= 30;

  for (const exp of resumeData.experience) {
    ensureSpace(3);
    addText(`${exp.role} at ${exp.company}`, 50, yPosition, 14, true);
    yPosition -= 15;
    addText(`${exp.start} - ${exp.end}`, 50, yPosition, 12);
    yPosition -= 15;

    for (const bullet of exp.bullets) {
      const bulletLines = wrapText(`• ${bullet}`, width - 100, 12);
      ensureSpace(bulletLines.length + 1);
      for (const line of bulletLines) {
        addText(line, 50, yPosition, 12);
        yPosition -= lineHeight;
      }
    }
    yPosition -= 10;
  }

  yPosition -= sectionSpacing;

  if (resumeData.projects.length > 0) {
    ensureSpace(3);
    addText("PROJECTS", 50, yPosition, 20, true);
    yPosition -= 30;

    for (const project of resumeData.projects) {
      ensureSpace(3);
      addText(project.name, 50, yPosition, 14, true);
      yPosition -= 15;

      const descLines = wrapText(project.description, width - 100, 12);
      ensureSpace(descLines.length + 1);
      for (const line of descLines) {
        addText(line, 50, yPosition, 12);
        yPosition -= lineHeight;
      }

      for (const bullet of project.bullets) {
        const bulletLines = wrapText(`• ${bullet}`, width - 100, 12);
        ensureSpace(bulletLines.length + 1);
        for (const line of bulletLines) {
          addText(line, 50, yPosition, 12);
          yPosition -= lineHeight;
        }
      }
      yPosition -= 10;
    }

    yPosition -= sectionSpacing;
  }

  ensureSpace(3);
  addText("EDUCATION", 50, yPosition, 20, true);
  yPosition -= 30;

  for (const edu of resumeData.education) {
    ensureSpace(1.5);
    let eduText = `${edu.degree} - ${edu.school}`;
    if (edu.cgpa) {
      eduText += ` (CGPA: ${edu.cgpa})`;
    }
    addText(eduText, 50, yPosition, 12, true);
    yPosition -= lineHeight;
  }

  yPosition -= sectionSpacing;

  if (resumeData.certifications && resumeData.certifications.length > 0) {
    ensureSpace(3);
    addText("CERTIFICATIONS", 50, yPosition, 20, true);
    yPosition -= 30;

    for (const cert of resumeData.certifications) {
      ensureSpace(1.5);
      addText(`• ${cert}`, 50, yPosition, 12);
      yPosition -= lineHeight;
    }
  }

  return Buffer.from(await pdfDoc.save());
}
