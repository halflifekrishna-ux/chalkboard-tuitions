"use client";

import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}

export default function ShimmerButton({
  children = "Shimmer",
  className,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-12 animate-shimmer2 items-center justify-center rounded-xl border px-6 font-semibold transition-all focus:outline-none focus-visible:ring-2",
        "border-chalk-yellow/40 bg-[linear-gradient(110deg,#1e3a2f,45%,#2a5040,55%,#1e3a2f)] bg-[length:200%_100%] text-chalk-yellow",
        "hover:border-chalk-yellow/70 hover:shadow-lg hover:shadow-chalk-yellow/20",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
