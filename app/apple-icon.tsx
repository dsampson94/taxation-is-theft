import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #003d80 0%, #0060c9 50%, #0078ff 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* TIT text — Apple icons are large enough for full text */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: 'white',
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          TIT
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: 3,
            marginTop: 4,
            textTransform: 'uppercase',
          }}
        >
          TAX
        </div>
        {/* Accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 40,
            right: 40,
            height: 3,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.3)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
