import { ImageResponse } from 'next/og';
import { siteData } from '../data/site';

export const alt = siteData.seoTitle;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0D0E10',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(26,34,48,0.8) 0%, rgba(13,14,16,0) 70%)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <div style={{ fontSize: 120, fontWeight: 900, color: '#DCE6F2', letterSpacing: '-0.02em', lineHeight: 1 }}>
            ARHAM SUHAIL
          </div>
          <div style={{ fontSize: 32, color: '#7F93AB', marginTop: 20, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            AI Automation • AI Calling Agents • Web Development
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
