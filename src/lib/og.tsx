import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

// Placeholder share card: a heading and a subheading on the site's light background.
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
          background: "#fafaf8",
          color: "#0f0f0e",
        }}
      >
        <div style={{ fontSize: 68, fontWeight: 600, letterSpacing: -2, lineHeight: 1.1 }}>{heading}</div>
        <div style={{ marginTop: 28, fontSize: 34, color: "#6b6b69" }}>{subheading}</div>
      </div>
    ),
    ogSize,
  );
}
