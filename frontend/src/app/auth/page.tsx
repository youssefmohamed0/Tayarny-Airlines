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
  setLoading(true)
  setError('')
  try {
    const res = await signIn('credentials', {
      username: loginData.username,
      password: loginData.password,
      redirect: false,
    })
    if (res?.ok) {
      const session = await getSession()
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      setError('Invalid username or password')
    }
  } catch {
    setError('Network error. Is the backend running?')
  } finally {
    setLoading(false)
  }
}
  async function handleSignup() {
    setLoading(true)
    setError('')
    try {
      const data = await apiService.signup(signupData.username, signupData.password, signupData.fullName, signupData.email)
      if (!data.accessToken) { setError(data.message || 'Signup failed'); return }
      await signIn('credentials', {
        username: signupData.username,
        password: signupData.password,
        redirect: false,
      })
      router.push('/dashboard')
    }catch (err) {
      console.error("SIGNUP ERROR:", err);
      // Change this line to show the actual message
      setError(err instanceof Error ? err.message : "Connection failed to backend");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    padding: '14px 16px',
    borderRadius: 10,
    border: '1.5px solid #e0e0e0',
    fontSize: 16,
    width: '100%',
    outline: 'none',
    background: '#fafafa',
    color: '#111',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* left side */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        color: 'white',
      }}>
        <div style={{ fontSize: 80, marginBottom: '1.5rem' }}>✈️</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: '1rem', textAlign: 'center', lineHeight: 1.2 }}>
          Your Journey<br />Starts Here
        </h1>
        <p style={{ fontSize: 18, color: '#a0c4d8', textAlign: 'center', maxWidth: 340, lineHeight: 1.7 }}>
          Search and book flights to anywhere in the world. Fast, easy, and reliable.
        </p>
        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['🌍 Flights to 150+ destinations', '💺 Best prices guaranteed', '🕐 24/7 customer support'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#cde' }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* right side */}
      <div style={{
        width: 480,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem',
        background: 'white',
        overflowY: 'auto',
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, color: '#111' }}>
          {tab === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p style={{ fontSize: 15, color: '#888', marginBottom: '2rem' }}>
          {tab === 'login' ? 'Sign in to your account' : 'Join us and start booking'}
        </p>

        {/* tabs */}
        <div style={{ display: 'flex', marginBottom: '2rem', background: '#f5f5f5', borderRadius: 10, padding: 4 }}>
          {(['login', 'signup'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontSize: 15, fontWeight: 500,
                background: tab === t ? 'white' : 'transparent',
                color: tab === t ? '#111' : '#888',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}>
              {t === 'login' ? 'Login' : 'Sign up'}
            </button>
          ))}
        </div>

        {tab === 'login' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#444', display: 'block', marginBottom: 6 }}>Username</label>
              <input placeholder="john_doe" value={loginData.username}
                onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#444', display: 'block', marginBottom: 6 }}>Password</label>
              <input placeholder="••••••••" type="password" value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                style={inputStyle} />
            </div>
            {error && <p style={{ color: '#e74c3c', fontSize: 14, margin: 0 }}>{error}</p>}
            <button onClick={handleLogin} disabled={loading}
              style={{ padding: '14px', background: '#378ADD', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 16, fontWeight: 600, marginTop: 4, fontFamily: 'inherit' }}>
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#444', display: 'block', marginBottom: 6 }}>Full name</label>
              <input placeholder="John Ahmed Doe" value={signupData.fullName}
                onChange={e => setSignupData({ ...signupData, fullName: e.target.value })}
                style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#444', display: 'block', marginBottom: 6 }}>Username</label>
              <input placeholder="john_doe" value={signupData.username}
                onChange={e => setSignupData({ ...signupData, username: e.target.value })}
                style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#444', display: 'block', marginBottom: 6 }}>Email</label>
              <input placeholder="john@example.com" type="email" value={signupData.email}
                onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#444', display: 'block', marginBottom: 6 }}>Password</label>
              <input placeholder="••••••••" type="password" value={signupData.password}
                onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                style={inputStyle} />
            </div>
            {error && <p style={{ color: '#e74c3c', fontSize: 14, margin: 0 }}>{error}</p>}
            <button onClick={handleSignup} disabled={loading}
              style={{ padding: '14px', background: '#378ADD', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 16, fontWeight: 600, marginTop: 4, fontFamily: 'inherit' }}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}