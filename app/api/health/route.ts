import { db } from "@/lib/db";
import { runtimeId } from "@/scripts/runtime-id.mjs";
export const dynamic = "force-dynamic";
export async function GET() {
  const identity = { service: "peerconnect", instance: runtimeId() };
  try {
    await db.user.count();
    return Response.json(
      { ...identity, status: "ready" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { ...identity, status: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
