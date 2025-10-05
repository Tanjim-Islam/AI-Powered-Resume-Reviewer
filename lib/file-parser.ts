export interface ParsedResume {
  text: string;
  fileName: string;
  fileType: string;
}

export async function parseResumeFile(file: File): Promise<ParsedResume> {
  const fileName = file.name;
  const fileType = file.type;

  try {
    if (fileType === "application/pdf") {
      const { pdf } = await import("pdf-parse");
      const arrayBuffer = await file.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);
      const data = await pdf(pdfBuffer);

      return {
        text: data.text.trim(),
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
        buffer: arrayBuffer,
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
