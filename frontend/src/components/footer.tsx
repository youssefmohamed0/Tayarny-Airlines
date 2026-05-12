'use client'

export default function Footer({ onLogout }: { onLogout?: () => void }) {
  return (
    <footer style={{
      background: '#0f172a',
      color: '#94a3b8',
      fontFamily: 'inherit',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* main content */}
      <div style={{
        padding: '3rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '2rem',
      }}>

        {/* brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>✈️</span>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>Flights</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.8, maxWidth: 220, marginBottom: 20 }}>
            Search and book flights to anywhere in the world. Fast, easy, and reliable.
          </p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {['𝕏', 'in', 'f'].map(icon => (
              <div key={icon} style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 13, color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>{icon}</div>
            ))}
            </div>
        </div>

        {/* company */}
        <div>
          <h4 style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Company</h4>
          {['About Us', 'Careers', 'Press', 'Blog', 'Partners'].map(item => (
            <div key={item} style={{ marginBottom: 10 }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                {item}
              </a>
            </div>
          ))}
        </div>

        {/* support */}
        <div>
          <h4 style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Support</h4>
          {['Help Center', 'Contact Us', 'Cancellation Policy', 'Refunds', 'Report an Issue'].map(item => (
            <div key={item} style={{ marginBottom: 10 }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                {item}
              </a>
            </div>
          ))}
        </div>

        {/* legal */}
        <div>
          <h4 style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Legal</h4>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Accessibility'].map(item => (
            <div key={item} style={{ marginBottom: 10 }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                {item}
              </a>
            </div>
          ))}
        </div>

        {/* newsletter */}
        <div>
          <h4 style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Newsletter</h4>
          <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            Get the best flight deals delivered to your inbox.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input placeholder="your@email.com" style={{
              padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, outline: 'none',
            }} />
            <button style={{
              padding: '10px', borderRadius: 8, border: 'none',
              background: '#378ADD', color: 'white', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '1.25rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <span style={{ fontSize: 12 }}>© {new Date().getFullYear()} Flights. All rights reserved.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#2ecc71', display: 'inline-block',
            boxShadow: '0 0 6px #2ecc71'
          }} />
          All systems operational
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['🇺🇸 English', '💳 USD'].map(item => (
            <span key={item} style={{
              fontSize: 12, padding: '4px 10px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
            }}>{item}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}