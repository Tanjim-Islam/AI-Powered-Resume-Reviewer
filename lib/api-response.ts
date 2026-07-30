type ApiErrorBody = {
  error?: unknown;
};

export async function readApiResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<T> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    await response.text();
    throw new Error(fallbackMessage);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }

  if (!response.ok) {
    const error =
      body && typeof body === "object"
        ? (body as ApiErrorBody).error
        : undefined;
    throw new Error(typeof error === "string" ? error : fallbackMessage);
  }

  return body as T;
}
