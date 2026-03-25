import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #003d80 0%, #0060c9 50%, #0078ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Bold T monogram — crisp at 32px */}
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 22,
            fontWeight: 900,
            color: 'white',
            lineHeight: 1,
            marginTop: -1,
          }}
        >
          T
        </div>
        {/* Subtle accent bar at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            left: 8,
            right: 8,
            height: 2,
            borderRadius: 1,
            background: 'rgba(255,255,255,0.4)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
