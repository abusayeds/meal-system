export interface MemberColorTheme {
  header: string;
  headerSub: string;
  cell: string;
  cellText: string;
  total: string;
  totalText: string;
  badge: string;
}

const MEMBER_COLORS: Record<string, MemberColorTheme> = {
  Mahim: {
    header: "bg-emerald-700",
    headerSub: "bg-emerald-600",
    cell: "bg-emerald-100",
    cellText: "text-emerald-950",
    total: "bg-emerald-200",
    totalText: "text-emerald-950",
    badge: "bg-emerald-200 text-emerald-950 ring-1 ring-emerald-400",
  },
  Ashiq: {
    header: "bg-rose-600",
    headerSub: "bg-rose-500",
    cell: "bg-rose-100",
    cellText: "text-rose-950",
    total: "bg-rose-200",
    totalText: "text-rose-950",
    badge: "bg-rose-200 text-rose-950 ring-1 ring-rose-400",
  },
  Sabbir: {
    header: "bg-amber-600",
    headerSub: "bg-amber-500",
    cell: "bg-amber-100",
    cellText: "text-amber-950",
    total: "bg-amber-200",
    totalText: "text-amber-950",
    badge: "bg-amber-200 text-amber-950 ring-1 ring-amber-400",
  },
  Jamil: {
    header: "bg-sky-700",
    headerSub: "bg-sky-600",
    cell: "bg-sky-100",
    cellText: "text-sky-950",
    total: "bg-sky-200",
    totalText: "text-sky-950",
    badge: "bg-sky-200 text-sky-950 ring-1 ring-sky-400",
  },
};

const FALLBACK_COLORS: MemberColorTheme[] = [
  {
    header: "bg-violet-700",
    headerSub: "bg-violet-600",
    cell: "bg-violet-100",
    cellText: "text-violet-950",
    total: "bg-violet-200",
    totalText: "text-violet-950",
    badge: "bg-violet-200 text-violet-950 ring-1 ring-violet-400",
  },
  {
    header: "bg-teal-700",
    headerSub: "bg-teal-600",
    cell: "bg-teal-100",
    cellText: "text-teal-950",
    total: "bg-teal-200",
    totalText: "text-teal-950",
    badge: "bg-teal-200 text-teal-950 ring-1 ring-teal-400",
  },
];

export function getMemberColor(name: string, index = 0): MemberColorTheme {
  return MEMBER_COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function getMemberColorMap(members: { name: string }[]) {
  return Object.fromEntries(
    members.map((m, i) => [m.name, getMemberColor(m.name, i)])
  );
}
