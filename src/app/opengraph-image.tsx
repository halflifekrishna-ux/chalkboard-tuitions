import { ImageResponse } from "next/og";

export const alt = "Chalkboard Tuitions — small-batch tuitions in Kammanahalli & Kalyan Nagar, Bengaluru";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card every page falls back to. Built rather than shipped as a flat
 * asset so the wording stays in sync with the site, and so it is a real 1200×630
 * landscape card — the square logo we used before cropped badly everywhere.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1a3329",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* chalk rule, echoing the board texture on the site */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #c9a227 0%, #f4c430 45%, rgba(244,196,48,0) 100%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "#f4c430",
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            <div style={{ display: "flex", width: 46, height: 2, background: "rgba(244,196,48,0.55)" }} />
            Kammanahalli · Kalyan Nagar · Bengaluru
          </div>

          <div
            style={{
              display: "flex",
              color: "#f5f0e8",
              fontSize: 86,
              fontWeight: 700,
              lineHeight: 1.06,
              marginTop: 30,
              maxWidth: 900,
            }}
          >
            Small batches. Real attention.
          </div>

          <div
            style={{
              display: "flex",
              color: "rgba(245,240,232,0.68)",
              fontSize: 34,
              lineHeight: 1.35,
              marginTop: 26,
              maxWidth: 820,
            }}
          >
            Daily tuitions for Grades 1–10 in Kammanahalli &amp; Kalyan Nagar.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", color: "#f5f0e8", fontSize: 32, fontWeight: 700 }}>
            Chalkboard Tuitions
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {["Max 8 per batch", "CBSE · ICSE · State"].map((chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  padding: "12px 22px",
                  borderRadius: 999,
                  border: "1px solid rgba(244,196,48,0.4)",
                  color: "#f4c430",
                  fontSize: 24,
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
