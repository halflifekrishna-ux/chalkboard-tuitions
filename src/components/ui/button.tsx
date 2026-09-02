import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Button — the one CTA primitive. Renders an <a>/<Link> when `href` is set,
 * otherwise a <button>. Keeps every call-to-action visually consistent.
 * Props:
 *   variant: "primary" (gold gradient) | "secondary" (outline) | "ghost"
 *   size: "md" | "lg"
 *   href?  internal path (Link) or absolute URL; external? opens in new tab
 * Used in: Hero, CTASection, JourneyStrip, navbars, pages.
 */
type Common = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  children: React.ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chalk-yellow focus-visible:ring-offset-2";

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const variants = {
  primary:
    "text-chalk-dark shadow-md hover:shadow-lg hover:shadow-chalk-yellow/30 hover:scale-[1.02] bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)]",
  secondary:
    "border-2 border-board/25 text-board hover:border-board hover:bg-board hover:text-chalk dark:border-chalk/30 dark:text-chalk dark:hover:bg-chalk dark:hover:text-board-deep",
  ghost:
    "text-board/70 hover:text-board hover:bg-board/5 dark:text-chalk/70 dark:hover:text-chalk dark:hover:bg-chalk/10",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  external,
  className,
  children,
  ...rest
}: Common &
  (
    | ({ href: string; external?: boolean } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ href?: undefined; external?: never } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  )) {
  const classes = cn(base, sizes[size], variants[variant], className);

  if (href) {
    if (external || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel")) {
      return (
        <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
