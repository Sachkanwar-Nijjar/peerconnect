import { describe, it, expect } from "vitest";
import { readJsonObject } from "../lib/request-body";
import { apiResponse } from "../lib/api-response";

describe("Request and response failure handling", () => {
  it("rejects malformed and non-object JSON", async () => {
    for (const body of ["{", "null", "[]", '"hello"'])
      await expect(
        readJsonObject(
          new Request("http://localhost", { method: "POST", body }),
        ),
      ).rejects.toMatchObject({ status: 400 });
  });
  it("bounds streamed UTF-8 bytes without trusting Content-Length", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"value":"'));
        controller.enqueue(new TextEncoder().encode("é".repeat(100)));
        controller.close();
      },
    });
    const request = new Request("http://localhost", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit);
    await expect(readJsonObject(request, 100)).rejects.toMatchObject({
      status: 413,
    });
  });
  it("preserves unicode objects and provides useful errors for HTML failures", async () => {
    await expect(
      readJsonObject(
        new Request("http://localhost", {
          method: "POST",
          body: '{"name":"ਸਤਿ"}',
        }),
      ),
    ).resolves.toEqual({ name: "ਸਤਿ" });
    await expect(
      apiResponse(new Response("<!DOCTYPE html>", { status: 503 })),
    ).rejects.toThrow("Please refresh");
    await expect(
      apiResponse(Response.json({ error: "Please log in." }, { status: 401 })),
    ).rejects.toThrow("Please log in.");
  });
});
