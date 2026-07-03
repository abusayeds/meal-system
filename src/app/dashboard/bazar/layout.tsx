import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function BazarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session?.role === "admin") redirect("/dashboard");
  return children;
}
