import AppShell from "@/components/AppShell";
import { MonthProvider } from "@/components/MonthProvider";

export default function DashboardShell({
  user,
  children,
}: {
  user: { id: string; name: string; email: string; role: "admin" | "member" };
  children: React.ReactNode;
}) {
  return (
    <MonthProvider>
      <AppShell user={user}>{children}</AppShell>
    </MonthProvider>
  );
}
