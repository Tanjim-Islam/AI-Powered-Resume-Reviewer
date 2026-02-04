export interface ParsedResume {
  text: string;
  fileName: string;
  fileType: string;
}

const MAX_RESUME_BYTES = 4 * 1024 * 1024;

export async function parseResumeFile(file: File): Promise<ParsedResume> {
  const fileName = file.name;
  const fileType = file.type;

  try {
    if (file.size > MAX_RESUME_BYTES) {
      throw new Error("File size must be less than 4MB.");
    }

    if (fileType === "application/pdf") {
      const pdfModule = (await import("pdf-parse")) as unknown;
      const pdfFn =
        (pdfModule as { pdf?: (data: Buffer) => Promise<unknown> }).pdf ??
        (pdfModule as { default?: (data: Buffer) => Promise<unknown> }).default ??
        (pdfModule as (data: Buffer) => Promise<unknown>);
      const arrayBuffer = await file.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);
      const data = await (pdfFn as (
        data: Buffer
      ) => Promise<{ text?: string } | string>)(pdfBuffer);
      const text = typeof data === "string" ? data : data.text;

      return {
        text: text?.trim() || "",
        fileName,
        fileType,
      };
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.default.extractRawText({
        buffer: Buffer.from(arrayBuffer),
      });

      return {
        text: result.value.trim(),
        fileName,
        fileType,
      };
    } else {
      throw new Error(
        "Unsupported file type. Please upload a PDF or DOCX file."
      );
    }
  } catch (error) {
    console.error("File parsing error:", error);
    if (error instanceof Error) {
      if (
        error.message === "File size must be less than 4MB." ||
        error.message.startsWith("Unsupported file type")
      ) {
        throw error;
      }
    }

    throw new Error(
      "Failed to parse the file. Please try uploading a different file or paste the text instead."
    );
  }
}

export function validateJobDescription(jobDescription: string): {
  isValid: boolean;
  error?: string;
} {
  if (!jobDescription || jobDescription.trim().length === 0) {
    return { isValid: true }; // Job description is optional
  }

  if (jobDescription.length < 50) {
    return {
      isValid: false,
      error:
        "Job description is too short. Please provide at least 50 characters.",
    };
  }

  if (jobDescription.length > 5000) {
    return {
      isValid: false,
      error:
        "Job description is too long. Please keep it under 5000 characters.",
    };
  }

  return { isValid: true };
}
