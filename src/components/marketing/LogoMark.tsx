import Image from "next/image";

/**
 * LogoMark — the Chalkboard "C" on its own.
 *
 * The logo file carries a "Chalkboard Tuitions" wordmark beneath the mark,
 * which is wrong on Learning Studio surfaces and illegible at small sizes
 * anywhere, so every use crops to the mark itself. The crop window (top 70% of
 * the square, nudged down 10%) clears the divider rule above the wordmark.
 *
 * Sizing is done by the caller through className — width drives height via the
 * aspect ratio, so it works fluidly for a hero watermark and fixed for a
 * lockup tile.
 */
export function LogoMark({
  className,
  sizes = "120px",
  priority,
}: {
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={`relative block overflow-hidden ${className ?? ""}`}
      style={{ aspectRatio: "1 / 0.7" }}
      aria-hidden
    >
      <Image
        src="/logo-dark.png"
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: "cover", objectPosition: "center 10%" }}
      />
    </span>
  );
}
