"use client";

import type { SiglumCompiler } from "@siglum/engine";

export type LatexCompileProgress = {
  stage: string;
  detail: string;
};

export class LatexCompileError extends Error {
  log: string;

  constructor(message: string, log = "") {
    super(message);
    this.name = "LatexCompileError";
    this.log = log;
  }
}

let compilerPromise: Promise<SiglumCompiler> | null = null;
let compileQueue: Promise<void> = Promise.resolve();
let progressListener:
  | ((progress: LatexCompileProgress) => void)
  | null = null;
let compilerLogBuffer: string[] = [];
const SESSION_PDF_CACHE_KEY = "resumePdfPreview";
const MAX_SESSION_PDF_BYTES = 1_000_000;

// Packages shared by the default resume template and most other templates.
// Load them while the rewrite request is still in flight.
const COMMON_RESUME_BUNDLES = [
  "tex-latex-misc",
  "graphics",
  "xcolor",
  "tables",
  "hyperref",
  "tex-generic",
  "fonts-lm-type1",
];

function recordCompilerLog(message: string) {
  compilerLogBuffer.push(message);
  if (compilerLogBuffer.length > 500) {
    compilerLogBuffer = compilerLogBuffer.slice(-500);
  }
}

async function pdfCacheHash(source: string): Promise<string | null> {
  if (!crypto.subtle) return null;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(source),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function readSessionPdf(hash: string): Uint8Array | null {
  try {
    const stored = sessionStorage.getItem(SESSION_PDF_CACHE_KEY);
    if (!stored) return null;
    const entry = JSON.parse(stored) as { hash: string; pdf: string };
    if (entry.hash !== hash) return null;
    const bytes = Uint8Array.from(atob(entry.pdf), (char) => char.charCodeAt(0));
    return bytes[0] === 37 && bytes[1] === 80 && bytes[2] === 68 && bytes[3] === 70
      ? bytes
      : null;
  } catch {
    return null;
  }
}

function saveSessionPdf(hash: string, pdf: Uint8Array) {
  if (pdf.byteLength > MAX_SESSION_PDF_BYTES) return;
  try {
    let binary = "";
    for (let offset = 0; offset < pdf.length; offset += 32_768) {
      binary += String.fromCharCode(...pdf.subarray(offset, offset + 32_768));
    }
    sessionStorage.setItem(
      SESSION_PDF_CACHE_KEY,
      JSON.stringify({ hash, pdf: btoa(binary) }),
    );
  } catch {
    // Storage limits must never prevent the PDF from being displayed.
  }
}

async function createCompiler(): Promise<SiglumCompiler> {
  const { SiglumCompiler } = await import("@siglum/engine");
  const compiler = new SiglumCompiler({
    bundlesUrl: "https://cdn.siglum.org/tl2025/bundles",
    wasmUrl: "https://cdn.siglum.org/tl2025/busytex.wasm",
    jsUrl: "https://cdn.siglum.org/tl2025/busytex.js",
    workerUrl: "/siglum-worker.js",
    enableCtan: false,
    enableLazyFS: true,
    enableDocCache: false,
    maxRetries: 6,
    verbose: false,
    onLog: recordCompilerLog,
    onProgress: (stage, detail) => {
      progressListener?.({ stage, detail });
    },
  });

  await compiler.init();
  return compiler;
}

function getCompiler(): Promise<SiglumCompiler> {
  if (!compilerPromise) {
    compilerPromise = createCompiler().catch((error) => {
      compilerPromise = null;
      throw error;
    });
  }

  return compilerPromise;
}

export function prewarmLatexCompiler() {
  void getCompiler()
    .then((compiler) => compiler.preloadBundles(COMMON_RESUME_BUNDLES))
    .catch(() => {
      // A preview can still retry initialization or load bundles on demand.
    });
}

export async function compileLatexToPdf({
  source,
  photo,
  onProgress,
}: {
  source: string;
  photo?: Uint8Array | null;
  onProgress?: (progress: LatexCompileProgress) => void;
}): Promise<{ pdf: Uint8Array; log: string }> {
  let releaseCompile = () => {};
  const previousCompile = compileQueue;
  compileQueue = new Promise<void>((resolve) => {
    releaseCompile = resolve;
  });
  await previousCompile;

  progressListener = onProgress ?? null;
  compilerLogBuffer = [];

  try {
    // Guest PDFs stay in this tab's session, and photo bytes cannot be ignored.
    const cacheHash = photo ? null : await pdfCacheHash(source);
    const cachedPdf = cacheHash ? readSessionPdf(cacheHash) : null;
    if (cachedPdf) return { pdf: cachedPdf, log: "" };

    const compiler = await getCompiler();
    const result = await compiler.compile(source, {
      engine: "pdflatex",
      useCache: false,
      additionalFiles: photo ? { "profile-photo.jpg": photo } : undefined,
    });

    if (!result.success || !result.pdf) {
      const message =
        result.error || "The LaTeX code could not be compiled.";
      throw new LatexCompileError(
        message,
        result.log || compilerLogBuffer.join("\n") || message,
      );
    }

    const pdf = new Uint8Array(result.pdf);
    if (cacheHash) saveSessionPdf(cacheHash, pdf);

    return { pdf, log: result.log ?? "" };
  } catch (error) {
    if (error instanceof LatexCompileError) throw error;
    const message =
      error instanceof Error
        ? error.message
        : "The LaTeX compiler could not start.";
    throw new LatexCompileError(
      message,
      compilerLogBuffer.join("\n") || message,
    );
  } finally {
    progressListener = null;
    releaseCompile();
  }
}

export async function unloadLatexCompiler() {
  if (!compilerPromise) return;
  const compiler = await compilerPromise;
  compiler.unload();
  compilerPromise = null;
}
