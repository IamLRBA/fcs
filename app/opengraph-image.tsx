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
          background: '#f3f0eb',
          color: '#262424',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 18%, rgba(111,78,55,0.16), transparent 45%), radial-gradient(circle at 82% 82%, rgba(151,116,88,0.14), transparent 40%)',
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
            borderRight: '1px solid rgba(111,78,55,0.25)',
            background: 'linear-gradient(160deg, #f7f4ef 0%, #ede7df 100%)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 20, letterSpacing: 2, color: '#6f4e37' }}>LIGHT MODE</div>
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
          <div style={{ fontSize: 30, lineHeight: 1.25, color: '#3a2f28' }}>
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
            background: 'linear-gradient(160deg, #171a1f 0%, #0f1115 100%)',
            color: '#f7f6f3',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 20, letterSpacing: 2, color: '#c9b5a3' }}>DARK MODE</div>
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
          <div style={{ fontSize: 30, lineHeight: 1.25, color: '#dfd4c8' }}>
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
            border: '1px solid rgba(111,78,55,0.32)',
            background: 'rgba(255,255,255,0.72)',
            color: '#6f4e37',
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

