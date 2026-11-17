import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { Workspace } from "@/components/workspace";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { path } = await params;
  return (
    <Workspace
      key={path?.join("/") || "dashboard"}
      user={{
        id: user.id,
        name: user.name,
        role: user.role,
        requestedFaculty: user.requestedFaculty,
      }}
    />
  );
}
