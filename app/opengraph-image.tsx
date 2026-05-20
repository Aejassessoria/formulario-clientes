import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = {
  width: 400,
  height: 400,
}

export const contentType = 'image/png'

export default function Image() {
  const logoData = readFileSync(join(process.cwd(), 'public/logo-aj-transparente.png'))
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '32px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoBase64}
          width={220}
          height={220}
          alt="AJ Assessoria Contábil"
          style={{ objectFit: 'contain' }}
        />
        <div
          style={{
            color: '#1a1a1a',
            fontSize: '26px',
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: '1.2',
          }}
        >
          AJ Assessoria Contábil
        </div>
      </div>
    ),
    { ...size }
  )
}
