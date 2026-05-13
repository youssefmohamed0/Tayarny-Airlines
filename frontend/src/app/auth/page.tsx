'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/services/api'
import { signIn, getSession } from 'next-auth/react'

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [signupData, setSignupData] = useState({ fullName: '', username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true); setError('')
    try {
      const res = await signIn('credentials', {
        username: loginData.username, password: loginData.password, redirect: false,
      })
      if (res?.ok) {
        const session = await getSession()
        if (session?.user?.role === 'ADMIN') router.push('/admin')
        else router.push('/dashboard')
      } else {
        setError('Invalid username or password')
      }
    } catch {
      setError('Network error. Is the backend running?')
    } finally { setLoading(false) }
  }

  async function handleSignup() {
    setLoading(true); setError('')
    try {
      const data = await apiService.signup(signupData.username, signupData.password, signupData.fullName, signupData.email)
      if (!data.accessToken) { setError(data.message || 'Signup failed'); return }
      await signIn('credentials', {
        username: signupData.username, password: signupData.password, redirect: false,
      })
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed to backend')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'inherit' }}>

      {/* Left side (Branding) */}
      <div style={{
        flex: 1, background: 'linear-gradient(135deg, #4B3BF5 0%, #7c3aed 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -100, top: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', left: -50, bottom: -50, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        
        <div style={{ fontSize: 72, marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>✈️</div>
        <h1 style={{ fontSize: 44, fontWeight: 800, marginBottom: '1rem', textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
          Elevate Your<br />Journey
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center', maxWidth: 360, lineHeight: 1.6, marginBottom: '3rem' }}>
          Experience premium flight bookings with Tayarny-Airlines. Seamless, reliable, and tailored for you.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: '🌍', text: 'Access to 150+ global destinations' },
            { icon: '💎', text: 'Premium service & best price guarantee' },
            { icon: '🛡️', text: 'Secure booking & 24/7 priority support' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.95)' }}>
              <span>{item.icon}</span> {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right side (Form) */}
      <div style={{
        width: 520, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '4rem', background: 'white', overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: '#111827', letterSpacing: '-0.5px' }}>
            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: '2.5rem' }}>
            {tab === 'login' ? 'Sign in to manage your bookings and explore new destinations.' : 'Join Tayarny-Airlines and elevate your travel experience.'}
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '2rem', background: '#f4f4fb', borderRadius: 12, padding: 4 }}>
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                  cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                  background: tab === t ? 'white' : 'transparent',
                  color: tab === t ? '#111827' : '#6b7280',
                  boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s',
                }}>
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {tab === 'signup' && (
              <div>
                <label className="field-label" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Full Name</label>
                <input placeholder="e.g. Jane Doe" value={signupData.fullName}
                  onChange={e => setSignupData({ ...signupData, fullName: e.target.value })}
                  className="input" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '1.5px solid #e8e8f0', fontSize: 15, outline: 'none', transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = '#4B3BF5'} onBlur={e => e.target.style.borderColor = '#e8e8f0'}
                />
              </div>
            )}
            
            <div>
              <label className="field-label" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Username</label>
              <input placeholder="e.g. jane_doe" value={tab === 'login' ? loginData.username : signupData.username}
                onChange={e => tab === 'login' ? setLoginData({ ...loginData, username: e.target.value }) : setSignupData({ ...signupData, username: e.target.value })}
                className="input" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '1.5px solid #e8e8f0', fontSize: 15, outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = '#4B3BF5'} onBlur={e => e.target.style.borderColor = '#e8e8f0'}
              />
            </div>

            {tab === 'signup' && (
              <div>
                <label className="field-label" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Email Address</label>
                <input placeholder="jane@example.com" type="email" value={signupData.email}
                  onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                  className="input" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '1.5px solid #e8e8f0', fontSize: 15, outline: 'none', transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = '#4B3BF5'} onBlur={e => e.target.style.borderColor = '#e8e8f0'}
                />
              </div>
            )}

            <div>
              <label className="field-label" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Password</label>
              <input placeholder="••••••••" type="password" value={tab === 'login' ? loginData.password : signupData.password}
                onChange={e => tab === 'login' ? setLoginData({ ...loginData, password: e.target.value }) : setSignupData({ ...signupData, password: e.target.value })}
                className="input" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '1.5px solid #e8e8f0', fontSize: 15, outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = '#4B3BF5'} onBlur={e => e.target.style.borderColor = '#e8e8f0'}
              />
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 14 }}>
                {error}
              </div>
            )}

            <button onClick={tab === 'login' ? handleLogin : handleSignup} disabled={loading}
              style={{
                width: '100%', padding: '15px', background: loading ? '#a5b4fc' : '#4B3BF5', color: 'white',
                border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 16, fontWeight: 700, marginTop: 8, fontFamily: 'inherit',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(75,59,245,0.3)', transition: 'all 0.15s',
              }}>
              {loading ? 'Processing…' : (tab === 'login' ? 'Sign In →' : 'Create Account →')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}