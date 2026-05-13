'use client'
import { useState } from 'react'
import { apiService } from '@/services/api'

const mockFlights = [
  { id: 1, from: 'Cairo', to: 'Dubai', date: '2026-05-15', time: '08:30', airline: 'Emirates', seats: 180, price: '$299' },
  { id: 2, from: 'Cairo', to: 'London', date: '2026-05-18', time: '14:00', airline: 'British Airways', seats: 220, price: '$650' },
  { id: 3, from: 'Dubai', to: 'New York', date: '2026-05-20', time: '22:15', airline: 'Emirates', seats: 300, price: '$890' },
]

type Modal = 'none' | 'add' | 'edit' | 'users' | 'bookingId' | 'bookingUser'

export default function AdminPage() {
  const [modal, setModal] = useState<Modal>('none')
  const [flights, setFlights] = useState(mockFlights)
  const [selectedFlight, setSelectedFlight] = useState<typeof mockFlights[0] | null>(null)
  const [searchBookingId, setSearchBookingId] = useState('')
  const [searchUser, setSearchUser] = useState('')
  const [form, setForm] = useState({ from: '', to: '', date: '', time: '', airline: '', seats: '', price: '' })
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  function openEdit(flight: typeof mockFlights[0]) {
    setSelectedFlight(flight)
    setForm({ from: flight.from, to: flight.to, date: flight.date, time: flight.time, airline: flight.airline, seats: String(flight.seats), price: flight.price })
    setModal('edit')
  }

  function openAdd() {
    setSelectedFlight(null)
    setForm({ from: '', to: '', date: '', time: '', airline: '', seats: '', price: '' })
    setModal('add')
  }

  async function openUsers() {
    setModal('users')
    setLoadingUsers(true)
    try {
      const data = await apiService.getUsers()
      setUsers(data)
    } catch {
      console.error('Failed to fetch users')
    } finally {
      setLoadingUsers(false)
    }
  }

  async function handleDeleteUser(userId: string, role: string) {
    // Safety check remains: even though button is visible, action is blocked for Admins
    if (role === 'ADMIN') return 
    
    if (!confirm('Are you sure you want to delete this user?')) return
    const ok = await apiService.deleteUser(userId)
    if (ok) {
      setUsers(prev => prev.filter(u => u.id !== userId))
    }
  }

  const inputStyle = {
    padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0',
    fontSize: 14, width: '100%', outline: 'none', background: '#fafafa',
    fontFamily: 'inherit', boxSizing: 'border-box' as const,
  }

  const now = new Date()

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 4 }}>Admin Panel</h1>
      <p style={{ color: '#666', marginBottom: 28 }}>Manage flights, bookings and users</p>

      <div style={{ background: 'white', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

        {/* top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={openAdd} style={{
            padding: '12px 20px', background: '#1a1a2e', color: 'white',
            border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14,
            fontWeight: 600, fontFamily: 'inherit',
          }}>
            ➕ Add / Modify Flight
          </button>

          <div style={{ flex: 1 }} />

          <button onClick={() => setModal('bookingId')} style={{
            padding: '12px 20px', background: '#f0f4ff', color: '#378ADD',
            border: '1.5px solid #378ADD', borderRadius: 10, cursor: 'pointer',
            fontSize: 14, fontFamily: 'inherit',
          }}>
            🔍 Search by Booking ID
          </button>

          <button onClick={() => setModal('bookingUser')} style={{
            padding: '12px 20px', background: '#f0f4ff', color: '#378ADD',
            border: '1.5px solid #378ADD', borderRadius: 10, cursor: 'pointer',
            fontSize: 14, fontFamily: 'inherit',
          }}>
            👤 Search by User
          </button>

          <button onClick={openUsers} style={{
            padding: '12px 20px', background: '#fff0f0', color: '#e74c3c',
            border: '1.5px solid #e74c3c', borderRadius: 10, cursor: 'pointer',
            fontSize: 14, fontFamily: 'inherit',
          }}>
            👥 View All Users
          </button>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {/* left — admin badge */}
          <div style={{
            width: 200, flexShrink: 0, background: 'linear-gradient(135deg, #1a1a2e, #378ADD)',
            borderRadius: 14, padding: '2rem 1rem', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12, color: 'white',
          }}>
            <div style={{ fontSize: 52 }}>🛡️</div>
            <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center' }}>Admin</div>
            <div style={{ fontSize: 11, opacity: 0.7, textAlign: 'center', lineHeight: 1.6 }}>
              {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              <br />
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 20,
              padding: '4px 14px', fontSize: 11, fontWeight: 600, letterSpacing: 1,
            }}>
              FULL ACCESS
            </div>
          </div>

          {/* right — flights list */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {flights.map(flight => (
              <div key={flight.id} style={{
                border: '1.5px solid #eee', borderRadius: 10, padding: '14px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#fafafa',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>{flight.from} → {flight.to}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#999' }}>{flight.airline} · {flight.date} · {flight.time}</p>
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <span>💺 {flight.seats} seats</span>
                    <span style={{ marginLeft: 12, fontWeight: 600, color: '#1a1a2e' }}>{flight.price}</span>
                  </div>
                </div>
                <button onClick={() => openEdit(flight)} style={{
                  padding: '8px 16px', background: '#378ADD', color: 'white',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                  fontFamily: 'inherit',
                }}>
                  ✏️ Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}

      {/* Add/Edit Flight Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setModal('none')}>
          <div style={{
            background: 'white', borderRadius: 16, padding: '2rem', width: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: 20 }}>
              {modal === 'add' ? '➕ Add New Flight' : '✏️ Edit Flight'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'From', key: 'from', placeholder: 'Cairo' },
                { label: 'To', key: 'to', placeholder: 'Dubai' },
                { label: 'Date', key: 'date', placeholder: '2026-05-15', type: 'date' },
                { label: 'Time', key: 'time', placeholder: '08:30', type: 'time' },
                { label: 'Airline', key: 'airline', placeholder: 'Emirates' },
                { label: 'Seats', key: 'seats', placeholder: '180', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={(form as any)[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Price</label>
                <input placeholder="$299" value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setModal('none')} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #eee',
                background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
              }}>Cancel</button>
              <button style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                background: '#1a1a2e', color: 'white', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
              }}>{modal === 'add' ? 'Add Flight' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Search Modals (ID and User) */}
      {(modal === 'bookingId' || modal === 'bookingUser') && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setModal('none')}>
          <div style={{
            background: 'white', borderRadius: 16, padding: '2rem', width: 420,
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px' }}>
              {modal === 'bookingId' ? '🔍 Search by Booking ID' : '👤 Search by User'}
            </h3>
            <input 
              placeholder={modal === 'bookingId' ? "Enter booking ID..." : "Enter username..."} 
              value={modal === 'bookingId' ? searchBookingId : searchUser}
              onChange={e => modal === 'bookingId' ? setSearchBookingId(e.target.value) : setSearchUser(e.target.value)}
              style={{ ...inputStyle, marginBottom: 12 }} 
            />
            <button style={{
              width: '100%', padding: '12px', background: '#378ADD', color: 'white',
              border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 14, fontWeight: 600,
            }}>Search</button>
          </div>
        </div>
      )}

      {/* View All Users Modal */}
      {modal === 'users' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setModal('none')}>
          <div style={{
            background: 'white', borderRadius: 16, padding: '2rem', width: 620,
            maxHeight: '80vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px' }}>👥 All Users</h3>

            {loadingUsers ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Loading users...</p>
            ) : users.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>No users found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {users.map(user => (
                  <div key={user.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', border: '1.5px solid #eee', borderRadius: 10,
                    background: '#fafafa',
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{user.fullName}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                        @{user.username} · {user.email} · ✈️ {user.totalFlights} flights
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 20,
                    background: user.role === 'ADMIN' ? '#fff0f0' : '#f0f4ff',
                    color: user.role === 'ADMIN' ? '#e74c3c' : '#378ADD',
                    fontWeight: 600,
                  }}>{user.role}</span>

                  {user.role === 'CUSTOMER' && (
                    <button onClick={() => handleDeleteUser(user.id, user.role)} style={{
                      padding: '6px 12px', background: '#fff0f0', color: '#e74c3c',
                      border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8,
                      cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                    }}>
                      Delete
                    </button>
                  )}
                </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}