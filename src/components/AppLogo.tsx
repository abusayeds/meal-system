import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AppLogo({
  size = 48,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.svg"
      alt="Gana Bhaban"
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 rounded-2xl shadow-sm", className)}
    />
  );
}
