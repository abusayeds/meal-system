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
    header: "bg-emerald-600",
    headerSub: "bg-emerald-500",
    cell: "bg-emerald-50/80",
    cellText: "text-emerald-900",
    total: "bg-emerald-100",
    totalText: "text-emerald-900",
    badge: "bg-emerald-100 text-emerald-800",
  },
  Ashiq: {
    header: "bg-rose-500",
    headerSub: "bg-rose-400",
    cell: "bg-rose-50/80",
    cellText: "text-rose-900",
    total: "bg-rose-100",
    totalText: "text-rose-900",
    badge: "bg-rose-100 text-rose-800",
  },
  Sabbir: {
    header: "bg-amber-500",
    headerSub: "bg-amber-400",
    cell: "bg-amber-50/80",
    cellText: "text-amber-900",
    total: "bg-amber-100",
    totalText: "text-amber-900",
    badge: "bg-amber-100 text-amber-800",
  },
  Jamil: {
    header: "bg-sky-600",
    headerSub: "bg-sky-500",
    cell: "bg-sky-50/80",
    cellText: "text-sky-900",
    total: "bg-sky-100",
    totalText: "text-sky-900",
    badge: "bg-sky-100 text-sky-800",
  },
};

const FALLBACK_COLORS: MemberColorTheme[] = [
  {
    header: "bg-violet-600",
    headerSub: "bg-violet-500",
    cell: "bg-violet-50/80",
    cellText: "text-violet-900",
    total: "bg-violet-100",
    totalText: "text-violet-900",
    badge: "bg-violet-100 text-violet-800",
  },
  {
    header: "bg-teal-600",
    headerSub: "bg-teal-500",
    cell: "bg-teal-50/80",
    cellText: "text-teal-900",
    total: "bg-teal-100",
    totalText: "text-teal-900",
    badge: "bg-teal-100 text-teal-800",
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
