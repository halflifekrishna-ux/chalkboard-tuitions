/* eslint-disable @next/next/no-img-element */
export function Avatar({
  name,
  photoUrl,
  size = 40,
}: {
  name: string;
  photoUrl?: string | null;
  size?: number;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size, border: "1px solid rgba(201,162,39,0.3)" }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: "rgba(201,162,39,0.18)",
        color: "#f4c430",
        border: "1px solid rgba(201,162,39,0.3)",
      }}
    >
      {initials || "?"}
    </div>
  );
}
