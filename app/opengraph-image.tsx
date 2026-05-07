import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export const alt = 'MysticalPIECES social preview card'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: '#f4f4f5',
          color: '#18181b',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 18%, rgba(63,63,70,0.12), transparent 45%), radial-gradient(circle at 82% 82%, rgba(113,113,122,0.1), transparent 40%)',
          }}
        />

        <div
          style={{
            width: '50%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 56px',
            borderRight: '1px solid rgba(63,63,70,0.2)',
            background: 'linear-gradient(160deg, #fafafa 0%, #f4f4f5 100%)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 20, letterSpacing: 2, color: '#3f3f46' }}>LIGHT MODE</div>
            <img
              src="https://www.mysticalpieces.com/assets/images/branding/logo-dark.png"
              alt="MysticalPIECES logo dark"
              style={{
                width: 420,
                height: 140,
                objectFit: 'contain',
                objectPosition: 'left',
              }}
            />
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.25, color: '#3f3f46' }}>
            Mystical Thrift Fashion & Soulful Style Curators
          </div>
        </div>

        <div
          style={{
            width: '50%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 56px',
            background: 'linear-gradient(160deg, #18181b 0%, #09090b 100%)',
            color: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 20, letterSpacing: 2, color: '#a1a1aa' }}>DARK MODE</div>
            <img
              src="https://www.mysticalpieces.com/assets/images/branding/logo-light.png"
              alt="MysticalPIECES logo light"
              style={{
                width: 420,
                height: 140,
                objectFit: 'contain',
                objectPosition: 'left',
              }}
            />
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.25, color: '#d4d4d8' }}>
            Mystical Thrift Fashion & Soulful Style Curators
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 32,
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            borderRadius: 9999,
            border: '1px solid rgba(63,63,70,0.28)',
            background: 'rgba(255,255,255,0.85)',
            color: '#3f3f46',
            fontSize: 17,
            letterSpacing: 1,
          }}
        >
          www.mysticalpieces.com
        </div>
      </div>
    ),
    size
  )
}
