import React from 'react'

const Logo: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e40af, #8b4513, #d4af37)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 16,
        }}
      >
        ✂
      </div>
      <span style={{ fontWeight: 700 }}>Modern Men</span>
    </div>
  )
}

export default Logo

