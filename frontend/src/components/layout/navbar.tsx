'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { apiService } from '@/services/api'
import Footer from '@/components/footer'

export default function Navbar({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  async function logout() {
    try { await apiService.logout() } catch {}
    await signOut({ redirect: false })
    router.push('/auth')
  }

  const links = [
    { label: '🏠 Dashboard', path: '/dashboard' },
    { label: '🔍 Search flights', path: '/dashboard/search' },
    { label: '👤 Profile', path: '/dashboard/profile' },
    ...(isAdmin ? [{ label: '🛡️ Admin', path: '/dashboard/admin' }] : []),
  ]

  if (pathname === '/auth') return <>{children}</>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: 280, background: '#1a1a2e', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem' }}>
          <h2 style={{ color: 'white', fontSize: 36, marginBottom: '3rem', paddingLeft: 12 }}>✈️ Flights</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {links.map(link => (
              <Link key={link.path} href={link.path}
                style={{
                  padding: '14px 16px', borderRadius: 10,
                  textDecoration: 'none', fontSize: 17, display: 'block',
                  fontFamily: 'inherit',
                  background: pathname === link.path ? '#378ADD' : 'transparent',
                  color: pathname === link.path ? 'white' : '#aaa',
                }}>
                {link.label}
              </Link>
            ))}
          </nav>
          <button onClick={logout} style={{
            padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,100,100,0.2)',
            cursor: 'pointer', textAlign: 'left', fontSize: 16,
            background: 'rgba(255,100,100,0.06)', color: '#ff6b6b',
            fontFamily: 'inherit', marginTop: 16,
          }}>
            🚪 Logout
          </button>
        </aside>
        <main style={{ flex: 1, padding: '3rem', background: '#f5f5f5', fontFamily: 'inherit' }}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}