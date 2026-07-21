import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/auth";

export default async function Home() {
  const session = await getActiveSession();
  if (session) {
    redirect("/dashboard");
  }
  redirect("/login");
}
