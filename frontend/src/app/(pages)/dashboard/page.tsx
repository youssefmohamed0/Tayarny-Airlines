'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const name = session?.user?.name || 'Traveler'

  return (
    <div className="animate-in">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #4B3BF5 0%, #7c3aed 100%)',
        borderRadius: 20, padding: '3rem 2.5rem', marginBottom: 32,
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: 40, top: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', right: 100, bottom: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.75, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Welcome back</p>
        <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
          {name} ✈️
        </h1>
        <p style={{ fontSize: 16, opacity: 0.8, marginBottom: 28 }}>
          Where will your next journey take you?
        </p>
        <button
          onClick={() => router.push('/search')}
          className="btn"
          style={{ background: 'white', color: '#4B3BF5', fontWeight: 700, padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <span>🔍</span> Search Flights
        </button>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: '🧾', label: 'My Reservations', sub: 'View and manage bookings', path: '/reservationhistory' },
          { icon: '✈️', label: 'Search Flights', sub: 'Find your next trip', path: '/search' },
          { icon: '👤', label: 'My Profile', sub: 'Manage account details', path: '/profile' },
        ].map(item => (
          <button key={item.path} onClick={() => router.push(item.path)}
            style={{
              textAlign: 'left', padding: '20px', background: 'white', borderRadius: 14,
              border: '1.5px solid #e8e8f0', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#4B3BF5'; el.style.boxShadow = '0 4px 16px rgba(75,59,245,0.12)'; el.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#e8e8f0'; el.style.boxShadow = 'none'; el.style.transform = 'none' }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>{item.label}</p>
            <p style={{ fontSize: 13, color: '#9ca3af' }}>{item.sub}</p>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
        Tayarny-Airlines — Elevating your journey with premium travel experiences.
      </div>
    </div>
  )
}