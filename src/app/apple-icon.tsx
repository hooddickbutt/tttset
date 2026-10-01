import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "180px",
          height: "180px",
          background: "#10130f",
          color: "#e3926c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 96,
          fontFamily: "Georgia",
        }}
      >
        K
      </div>
    ),
    size,
  );
}
