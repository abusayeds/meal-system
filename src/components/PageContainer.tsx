export default function PageContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-4 sm:p-6 lg:p-8 ${className}`}>{children}</div>
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

export function MobileScrollTable({
  children,
  hint = "Swipe left to see more →",
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-center text-[10px] text-slate-400 md:hidden">
        {hint}
      </p>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {children}
      </div>
    </div>
  );
}
