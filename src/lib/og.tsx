import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

// Share card: a heading and a subheading in the paper, ink and pencil colours (the site is light only).
export function ogImage(heading: string, subheading: string): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#f3f4f0",
          color: "#1a1e1c",
        }}
      >
        <div style={{ fontSize: 68, fontWeight: 600, letterSpacing: -2, lineHeight: 1.1 }}>{heading}</div>
        <div style={{ marginTop: 28, fontSize: 34, color: "#575e59" }}>{subheading}</div>
      </div>
    ),
    ogSize,
  );
}
