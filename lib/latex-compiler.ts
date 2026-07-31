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

function recordCompilerLog(message: string) {
  compilerLogBuffer.push(message);
  if (compilerLogBuffer.length > 500) {
    compilerLogBuffer = compilerLogBuffer.slice(-500);
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
    enableDocCache: true,
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
  void getCompiler().catch(() => {
    compilerPromise = null;
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
    const compiler = await getCompiler();
    const result = await compiler.compile(source, {
      engine: "pdflatex",
      useCache: true,
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

    return {
      pdf: new Uint8Array(result.pdf),
      log: result.log ?? "",
    };
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
