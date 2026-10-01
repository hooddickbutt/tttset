import { ImageResponse } from "next/og";

export const alt = "Keel — Payments, built onchain.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#f3f0e8",
          color: "#1b1e18",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#5c6158" }}>KEEL</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 84, fontFamily: "Georgia", lineHeight: 0.95 }}>Payments, built onchain.</div>
          <div style={{ fontSize: 28, color: "#5c6158", maxWidth: 760 }}>
            An independent, non-custodial payment app. Not affiliated with Robinhood or X.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
