import { LearningError } from "@/lib/learning";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { AppError, getData, mutate } from "@/lib/service";
import { readJsonObject, RequestBodyError } from "@/lib/request-body";
export const dynamic = "force-dynamic";
function failure(error: unknown) {
  if (error instanceof LearningError || error instanceof AppError || error instanceof RequestBodyError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof z.ZodError)
    return NextResponse.json(
      {
        error: error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      },
      { status: 400 },
    );
  const code = (error as { code?: string }).code;
  if (code === "P2002")
    return NextResponse.json(
      {
        error:
          "This record already exists. An active request or review may already exist.",
      },
      { status: 409 },
    );
  if (code === "P2025")
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  console.error(error);
  return NextResponse.json(
    { error: "Unable to complete this request. Please try again." },
    { status: 500 },
  );
}
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    const user = await currentUser();
    if (!user)
      throw new AppError("Please log in with a verified account.", 401);
    const { resource } = await params;
    return NextResponse.json(
      await getData(user, resource, req.nextUrl.searchParams),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    if (
      req.headers.get("origin") &&
      req.headers.get("origin") !==
        new URL(process.env.APP_URL || req.url).origin
    )
      throw new AppError("Request origin rejected.", 403);
    if (Number(req.headers.get("content-length")) > 64000)
      throw new AppError("Request is too large.", 413);
    const user = await currentUser();
    if (!user)
      throw new AppError("Please log in with a verified account.", 401);
    const { resource } = await params;
    if (resource === "upload")
      throw new AppError(
        "Image uploads are not enabled. Please publish a text post.",
        415,
      );
    return NextResponse.json(
      await mutate(user, resource, await readJsonObject(req)),
    );
  } catch (error) {
    return failure(error);
  }
}
