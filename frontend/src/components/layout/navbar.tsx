'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { apiService } from '@/services/api'

const LOGO = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ display: 'inline' }}>
    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z" fill="#4B3BF5"/>
  </svg>
)

export default function Navbar({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  async function logout() {
    try { await apiService.logout() } catch {}
    await signOut({ redirect: false })
    router.push('/auth')
  }

  const links = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Search', path: '/search' },
    { label: 'My Flights', path: '/reservationhistory' },
    { label: 'Profile', path: '/profile' },
  ]

  const hideNav = ['/auth', '/results', '/booking', '/payment', '/confirmation'].some(p =>
    pathname === p || pathname.startsWith(p + '/')
  )

  if (hideNav) return <>{children}</>

  const isAdmin = pathname.startsWith('/admin')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e8e8f0',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 24px', height: 62,
          display: 'flex', alignItems: 'center', gap: 32,
        }}>
          {/* Logo */}
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <LOGO />
            <span style={{ fontWeight: 800, fontSize: 20, color: '#4B3BF5', letterSpacing: '-0.3px' }}>Tayarny-Airlines</span>
          </Link>

          {/* Nav links */}
          {!isAdmin && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
              {links.map(link => {
                const active = pathname === link.path
                return (
                  <Link key={link.path} href={link.path} style={{
                    padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
                    fontSize: 14, fontWeight: active ? 700 : 500,
                    color: active ? '#4B3BF5' : '#6b7280',
                    borderBottom: active ? '2px solid #4B3BF5' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}>
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          )}
          {isAdmin && (
            <nav style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Link href="/admin" style={{ padding: '6px 14px', fontSize: 14, fontWeight: 600, color: '#4B3BF5', textDecoration: 'none', borderBottom: '2px solid #4B3BF5', borderRadius: 0 }}>
                Admin Panel
              </Link>
              <Link href="/admin/reservations" style={{ padding: '6px 14px', fontSize: 14, fontWeight: 500, color: '#6b7280', textDecoration: 'none', borderBottom: '2px solid transparent', borderRadius: 0 }}>
                Reservations
              </Link>
              <Link href="/dashboard" style={{ padding: '6px 14px', fontSize: 14, fontWeight: 500, color: '#6b7280', textDecoration: 'none', borderBottom: '2px solid transparent', borderRadius: 0 }}>
                ← User View
              </Link>
            </nav>
          )}

          {/* Right side */}
          <button onClick={logout} style={{
            padding: '8px 18px', borderRadius: 8, border: '1.5px solid #e8e8f0',
            background: 'white', color: '#6b7280', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ef4444'; (e.currentTarget as HTMLElement).style.color = '#ef4444' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e8e8f0'; (e.currentTarget as HTMLElement).style.color = '#6b7280' }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, background: '#f4f4fb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
