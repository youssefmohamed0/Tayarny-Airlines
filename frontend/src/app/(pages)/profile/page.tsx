'use client'
import { useEffect, useState } from 'react'
import { apiService } from '@/services/api'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '' // Optional password change
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const data = await apiService.getProfile()
      setUser(data)
      setFormData({ fullName: data.fullName, email: data.email, password: '' })
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      // Send everything to the PUT endpoint
      const updatedUser = await apiService.updateProfile(formData)
      setUser(updatedUser)
      setFormData({ ...formData, password: '' }) // Clear password field after success
      setIsEditing(false)
      alert('Profile updated successfully! ✨')
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>✈️ Loading...</div>

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>👤 Account Settings</h1>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            style={{ 
              padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
              border: '1px solid #378ADD', background: isEditing ? 'white' : '#378ADD',
              color: isEditing ? '#378ADD' : 'white', fontWeight: 'bold'
            }}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {error && <div style={{ color: 'red', background: '#fff0f0', padding: '10px', borderRadius: '8px', marginBottom: '1rem' }}>⚠️ {error}</div>}

        {!isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ProfileField label="Full Name" value={user?.fullName} />
            <ProfileField label="Email Address" value={user?.email} />
            <ProfileField label="Username" value={user?.username} />
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
               <span>Role: <strong>{user?.role}</strong></span>
               <span>Flights: <strong>{user?.totalFlights}</strong></span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input 
                style={inputStyle}
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input 
                style={inputStyle}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div style={{ padding: '15px', background: '#f1f3f5', borderRadius: '10px' }}>
              <label style={labelStyle}>New Password (Leave blank to keep current)</label>
              <input 
                style={inputStyle}
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <button type="submit" style={saveButtonStyle}>Save All Changes</button>
          </form>
        )}
      </div>
    </div>
  )
}

const labelStyle = { fontSize: '13px', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '8px', textTransform: 'uppercase' as const }
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' as const }
const saveButtonStyle = { background: '#2ecc71', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }

function ProfileField({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ fontSize: '18px', paddingBottom: '8px', borderBottom: '1px solid #eee', color: '#333' }}>{value}</div>
    </div>
  )
}