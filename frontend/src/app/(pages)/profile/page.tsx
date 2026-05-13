'use client'
import { useEffect, useState } from 'react'
import { apiService } from '@/services/api'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: ''
  })

  useEffect(() => { fetchProfile() }, [])

  async function fetchProfile() {
    try {
      const data = await apiService.getProfile()
      setUser(data)
      setFormData({ fullName: data.fullName, email: data.email, password: '' })
    } catch (err) {
      setError('Failed to load profile')
    } finally { setLoading(false) }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('')
    try {
      const updatedUser = await apiService.updateProfile(formData)
      setUser(updatedUser)
      setFormData({ ...formData, password: '' })
      setIsEditing(false)
      setSuccess('Profile updated successfully ✨')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return (
    <div className="animate-in" style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>
      <p style={{ fontSize: 32, marginBottom: 12 }}>✈️</p>
      <p>Loading profile...</p>
    </div>
  )

  return (
    <div className="animate-in" style={{ maxWidth: 700, margin: '0 auto', padding: '16px 0' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.5px' }}>My Profile</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Manage your account settings and preferences.</p>
      </div>

      {success && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#d1fae5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>✓</span> {success}
        </div>
      )}

      {/* Main Card */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        
        {/* Banner area */}
        <div style={{ height: 100, background: 'linear-gradient(135deg, #4B3BF5 0%, #7c3aed 100%)', position: 'relative' }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: '50%', background: 'white', 
            position: 'absolute', bottom: -40, left: 24, border: '4px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: '#4B3BF5', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || '👤'}
          </div>
          <button onClick={() => setIsEditing(!isEditing)} style={{
            position: 'absolute', right: 24, bottom: -20, padding: '8px 16px', borderRadius: 8,
            border: '1.5px solid #e8e8f0', background: 'white', color: '#374151',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.15s'
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4B3BF5'; (e.currentTarget as HTMLElement).style.color = '#4B3BF5' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e8e8f0'; (e.currentTarget as HTMLElement).style.color = '#374151' }}>
            {isEditing ? 'Cancel Editing' : '✎ Edit Profile'}
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '60px 24px 32px' }}>
          
          {error && <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 14, marginBottom: 20 }}>{error}</div>}

          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Full Name</label>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>{user?.fullName}</p>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Username</label>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>@{user?.username}</p>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Email Address</label>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>{user?.email}</p>
                </div>
              </div>

              <div style={{ height: 1, background: '#e8e8f0' }} />

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, padding: '16px', borderRadius: 12, background: '#f4f4fb', border: '1px solid #e8e8f0' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px', fontWeight: 500 }}>Account Role</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#4B3BF5', margin: 0 }}>{user?.role}</p>
                </div>
                <div style={{ flex: 1, padding: '16px', borderRadius: 12, background: '#f4f4fb', border: '1px solid #e8e8f0' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px', fontWeight: 500 }}>Total Flights</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{user?.totalFlights || 0}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Full Name</label>
                  <input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required className="input" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="input" />
                </div>
              </div>
              
              <div style={{ padding: '16px', borderRadius: 12, background: '#f4f4fb', border: '1px solid #e8e8f0' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>New Password (Optional)</label>
                <input type="password" placeholder="Leave blank to keep current password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="input" style={{ background: 'white' }} />
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '8px 0 0' }}>If you don't want to change your password, just leave this field empty.</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="submit" style={{
                  padding: '12px 28px', borderRadius: 10, border: 'none', background: '#4B3BF5', color: 'white',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 12px rgba(75,59,245,0.3)', transition: 'transform 0.15s'
                }}>
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}