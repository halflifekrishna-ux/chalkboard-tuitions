import { Hammer } from "lucide-react";

export function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <div className="space-y-5">
      <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
        {title}
      </h1>
      <div
        className="rounded-2xl p-10 text-center"
        style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}
      >
        <Hammer size={28} className="mx-auto mb-3" style={{ color: "#c9a227" }} />
        <p className="text-sm max-w-sm mx-auto" style={{ color: "rgba(245,240,232,0.55)" }}>
          {note}
        </p>
      </div>
    </div>
  );
}
