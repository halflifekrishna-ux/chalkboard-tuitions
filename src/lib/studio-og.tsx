import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Share cards for Learning Studio pages. Each Studio route has its own
 * opengraph-image.tsx that calls this with its own words, so a link pasted
 * into LinkedIn or Slack says what that page is, not "tuitions in
 * Kammanahalli". Brand fonts are vendored (src/assets/fonts, SIL OFL) because
 * the card is drawn at build time, outside the browser's next/font.
 */

export const OG_SIZE = { width: 1200, height: 630 };

const file = (p: string) => readFile(join(process.cwd(), p));

export async function studioOgImage({ eyebrow, title, line }: { eyebrow: string; title: string; line: string }) {
  const [playfair, dmSans, dmSansMedium, emblem] = await Promise.all([
    file("src/assets/fonts/playfair-display-latin-700-normal.woff"),
    file("src/assets/fonts/dm-sans-latin-400-normal.woff"),
    file("src/assets/fonts/dm-sans-latin-500-normal.woff"),
    file("public/studio-emblem.png"),
  ]);
  const emblemSrc = `data:image/png;base64,${emblem.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1E3A2F",
          padding: "64px 80px",
          fontFamily: "DM Sans",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            display: "flex",
            background: "linear-gradient(90deg, #C9A227 0%, #F4C430 45%, rgba(244,196,48,0) 100%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={emblemSrc} width={72} height={72} alt="" />
          <div style={{ display: "flex", fontFamily: "Playfair Display", fontSize: 32, color: "#F5F0E8" }}>
            Chalkboard Learning Studio
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#F4C430",
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Playfair Display",
              color: "#F5F0E8",
              fontSize: 64,
              lineHeight: 1.08,
              marginTop: 22,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", color: "rgba(245,240,232,0.72)", fontSize: 30, lineHeight: 1.35, marginTop: 22, maxWidth: 940 }}>
            {line}
          </div>
        </div>

        <div style={{ display: "flex", color: "#7A8A81", fontSize: 22 }}>chalkboardlearning.in/learning-studio</div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Playfair Display", data: playfair, weight: 700, style: "normal" },
        { name: "DM Sans", data: dmSans, weight: 400, style: "normal" },
        { name: "DM Sans", data: dmSansMedium, weight: 500, style: "normal" },
      ],
    }
  );
}
