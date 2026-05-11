'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { apiService } from '@/services/api'

export default function Navbar({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  async function logout() {
    try {
      await apiService.logout()
    } catch {
      // continue logout even if api call fails
    }
    await signOut({ redirect: false })
    router.push('/auth')
  }

  const links = [
    { label: '🏠 Dashboard', path: '/dashboard' },
    { label: '🔍 Search flights', path: '/dashboard/search' },
    { label: '👤 Profile', path: '/dashboard/profile' },
  ]

  if (pathname === '/auth') {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'inherit' }}>
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
        <button onClick={logout}
          style={{ padding: '14px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 17, background: 'transparent', color: '#ff6b6b', fontFamily: 'inherit' }}>
          🚪 Logout
        </button>
      </aside>

      <main style={{ flex: 1, padding: '3rem', background: '#f5f5f5', fontFamily: 'inherit' }}>
        {children}
      </main>
    </div>
  )
}