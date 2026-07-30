"use client";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const OUTPUT_SIZE = 900;
const ACCEPTED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function prepareResumePhoto(file: File): Promise<Blob> {
  if (!ACCEPTED_PHOTO_TYPES.has(file.type)) {
    throw new Error("Use a JPG, PNG, or WebP image.");
  }

  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error("Photo must be 5MB or smaller.");
  }

  const image = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext("2d");
  if (!context) {
    image.close();
    throw new Error("This browser cannot prepare the photo.");
  }

  const cropSize = Math.min(image.width, image.height);
  const sourceX = (image.width - cropSize) / 2;
  const sourceY = (image.height - cropSize) / 2;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropSize,
    cropSize,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE
  );
  image.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9)
  );

  if (!blob) {
    throw new Error("The photo could not be prepared.");
  }

  return blob;
}

export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}
