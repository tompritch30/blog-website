import { ImageResponse } from "next/og";

// Favicon: the initials in paper on the ink colour.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1e1c",
          color: "#f3f4f0",
          fontSize: 16,
          fontWeight: 700,
          borderRadius: 4,
        }}
      >
        TP
      </div>
    ),
    size,
  );
}
