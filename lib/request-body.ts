export class RequestBodyError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

// Bound the actual bytes, including streamed requests without Content-Length.
export async function readJsonObject(
  request: Request,
  limit = 64000,
): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length")) > limit)
    throw new RequestBodyError("Request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError("Send a valid JSON object.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        throw new RequestBodyError("Request is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  let input: unknown;
  try {
    input = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new RequestBodyError("Send a valid JSON object.");
  }
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new RequestBodyError("Send a valid JSON object.");
  return input as Record<string, unknown>;
}
