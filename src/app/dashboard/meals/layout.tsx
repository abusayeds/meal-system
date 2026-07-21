import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/auth";

export default async function MealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getActiveSession();
  if (session?.role === "admin") redirect("/dashboard");
  return children;
}
