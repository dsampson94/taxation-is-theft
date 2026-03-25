import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TIT Tax — AI-Powered Tax Assistant for South Africans";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #003d80 0%, #0060c9 40%, #0078ff 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          color: "white",
          padding: "60px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 100,
            height: 100,
            borderRadius: 24,
            background: "rgba(255,255,255,0.15)",
            fontSize: 48,
            fontWeight: 900,
            marginBottom: 32,
            letterSpacing: -2,
          }}
        >
          TIT
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: 16,
            maxWidth: 900,
          }}
        >
          AI-Powered Tax Assistant
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            textAlign: "center",
            opacity: 0.85,
            maxWidth: 700,
            marginBottom: 40,
          }}
        >
          Upload bank statements. Find deductions. Pay less tax — legally.
        </div>

        {/* Features row */}
        <div
          style={{
            display: "flex",
            gap: 32,
            fontSize: 18,
            fontWeight: 500,
            opacity: 0.75,
          }}
        >
          <span>🇿🇦 South African Tax</span>
          <span>•</span>
          <span>SARS Compliant</span>
          <span>•</span>
          <span>Free First Analysis</span>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            fontSize: 16,
            opacity: 0.5,
          }}
        >
          taxationistheft.co.za
        </div>
      </div>
    ),
    { ...size }
  );
}
