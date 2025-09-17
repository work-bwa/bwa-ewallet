import { getServerSession } from "@/lib/get-session";
import { DashboardClient } from "./DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardClient userId={session.user.id} userName={session.user.name} />
  );
}
