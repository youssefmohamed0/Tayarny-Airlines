'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/services/api'

type FareOption = {
  fareName: string
  pricePerSeat: number
  benefits: string[]
  availableSeats: number
}

type Flight = {
  flightId?: string
  flightNumber: string
  aircraft: string
  departure: { airport: string; terminal: string; time: string }
  arrival: { airport: string; time: string }
  fareOptions: FareOption[]
}

type Modal = 'none' | 'add' | 'edit' | 'users' | 'bookingId' | 'bookingUser'

const emptyFlight: Flight = {
  flightNumber: '',
  aircraft: '',
  departure: { airport: '', terminal: '', time: '' },
  arrival: { airport: '', time: '' },
  fareOptions: [{ fareName: '', pricePerSeat: 0, benefits: [], availableSeats: 0 }],
}

export default function AdminPage() {
  const router = useRouter()
  const [modal, setModal] = useState<Modal>('none')
  const [flights, setFlights] = useState<Flight[]>([])
  const [loadingFlights, setLoadingFlights] = useState(true)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [searchBookingId, setSearchBookingId] = useState('')
  const [searchUser, setSearchUser] = useState('')
  const [searchFlightNumber, setSearchFlightNumber] = useState('')
  const [form, setForm] = useState<Flight>(emptyFlight)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadFlights() }, [])

  async function loadFlights(flightNumber?: string) {
    setLoadingFlights(true)
    try {
      const data = await apiService.getSingleFlight(flightNumber)
      const arr = Array.isArray(data) ? data : [data]
      const sorted = [...arr].sort((a, b) => a.flightNumber.localeCompare(b.flightNumber))
      setFlights(sorted)
    } catch (e) {
      console.error('Failed to load flights', e)
      setFlights([])
    } finally {
      setLoadingFlights(false)
    }
  }

  function openEdit(flight: Flight) {
    setSelectedFlight(flight)
    setForm(JSON.parse(JSON.stringify(flight)))
    setModal('edit')
  }

  function openAdd() {
    setSelectedFlight(null)
    setForm(JSON.parse(JSON.stringify(emptyFlight)))
    setModal('add')
  }

  async function handleSaveFlight() {
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        departure: { ...form.departure, time: new Date(form.departure.time).toISOString() },
        arrival: { ...form.arrival, time: new Date(form.arrival.time).toISOString() },
      }
      if (modal === 'add') {
        delete payload.flightId
        await apiService.addFlight(payload)
      } else if (modal === 'edit' && selectedFlight?.flightId) {
        await apiService.modifyFlight(selectedFlight.flightId, payload)
      }
      setModal('none')
      await loadFlights(searchFlightNumber || undefined)
    } catch (e: any) {
      setError(e.message || 'Failed to save flight.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteFlight(flightId: string) {
    if (!confirm('Delete this flight?')) return
    const ok = await apiService.deleteFlight(flightId)
    if (ok) setFlights(prev => prev.filter(f => f.flightId !== flightId))
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
    if (role === 'ADMIN') return
    if (!confirm('Are you sure you want to delete this user?')) return
    const ok = await apiService.deleteUser(userId)
    if (ok) setUsers(prev => prev.filter(u => u.id !== userId))
  }

  function handleBookingSearch() {
    if (searchBookingId.trim()) {
      router.push(`/admin/reservation/${searchBookingId.trim()}`)
    }
  }

  function handleUserSearch() {
    if (searchUser.trim()) {
      router.push(`/admin/reservations?username=${searchUser.trim()}`)
    }
  }

  const inputStyle = {
    padding: '10px 14px', borderRadius: 8, border: '1.5px solid #000',
    fontSize: 14, width: '100%', outline: 'none', background: '#fafafa',
    fontFamily: 'inherit', boxSizing: 'border-box' as const, color: '#000'
  }

  const now = new Date()

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 4, color: '#000' }}>Admin Panel</h1>
      <p style={{ color: '#000', marginBottom: 28, fontWeight: 500 }}>Manage flights, bookings and users</p>

      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #e74c3c', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#e74c3c', fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={openAdd} style={{
            padding: '12px 20px', background: '#1a1a2e', color: 'white',
            border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14,
            fontWeight: 600, fontFamily: 'inherit',
          }}>➕ Add Flight</button>

          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            <input placeholder="Search by flight number..." value={searchFlightNumber}
              onChange={e => setSearchFlightNumber(e.target.value)}
              style={{ ...inputStyle, maxWidth: 260 }} />
            <button onClick={() => loadFlights(searchFlightNumber || undefined)} style={{
              padding: '10px 16px', background: '#378ADD', color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
            }}>Search</button>
            {searchFlightNumber && (
              <button onClick={() => { setSearchFlightNumber(''); loadFlights() }} style={{
                padding: '10px 16px', background: '#555', color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
              }}>✕ Clear</button>
            )}
          </div>

          <button onClick={() => setModal('bookingId')} style={{
            padding: '12px 20px', background: '#378ADD', color: 'white',
            border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 'bold', fontFamily: 'inherit',
          }}>🔍 Search by Booking ID</button>

          <button onClick={() => setModal('bookingUser')} style={{
            padding: '12px 20px', background: '#378ADD', color: 'white',
            border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 'bold', fontFamily: 'inherit',
          }}>👤 Search by User</button>

          <button onClick={openUsers} style={{
            padding: '12px 20px', background: '#e74c3c', color: 'white',
            border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 'bold', fontFamily: 'inherit',
          }}>👥 View All Users</button>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{
            width: 200, flexShrink: 0, background: 'linear-gradient(135deg, #1a1a2e, #378ADD)',
            borderRadius: 14, padding: '2rem 1rem', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12, color: 'white',
          }}>
            <div style={{ fontSize: 52 }}>🛡️</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Admin</div>
            <div style={{ fontSize: 11, textAlign: 'center', lineHeight: 1.6, fontWeight: 'bold' }}>
              {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              <br />
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
            {loadingFlights ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Loading flights...</p>
            ) : flights.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>No flights found.</p>
            ) : flights.map((flight, i) => (
              <div key={flight.flightId || i} style={{
                border: '1.5px solid #e0e0e0', borderRadius: 10, padding: '14px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#1a1a2e' }}>
                    {flight.flightNumber} · {flight.departure.airport} → {flight.arrival.airport}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#666', marginTop: 3 }}>
                    {flight.aircraft} · Dep: {new Date(flight.departure.time).toLocaleString()} · Terminal {flight.departure.terminal}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#378ADD', marginTop: 3 }}>
                    {flight.fareOptions?.map(f => `${f.fareName}: $${f.pricePerSeat} (${f.availableSeats} seats)`).join(' · ')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => openEdit(flight)} style={{
                    padding: '8px 14px', background: '#378ADD', color: 'white',
                    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                    fontFamily: 'inherit',
                  }}>✏️ Edit</button>
                  <button onClick={() => flight.flightId && handleDeleteFlight(flight.flightId)} style={{
                    padding: '8px 14px', background: '#e74c3c', color: 'white',
                    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                  }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModal('none')}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: 560, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: 22, color: '#000' }}>
              {modal === 'add' ? '➕ Add New Flight' : '✏️ Edit Flight'}
            </h3>
            {error && <div style={{ background: '#fff0f0', border: '1px solid #e74c3c', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#e74c3c', fontSize: 13 }}>⚠️ {error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Flight Number', val: form.flightNumber, onChange: (v: string) => setForm({ ...form, flightNumber: v }) },
                { label: 'Aircraft', val: form.aircraft, onChange: (v: string) => setForm({ ...form, aircraft: v }) },
                { label: 'Departure Airport', val: form.departure.airport, onChange: (v: string) => setForm({ ...form, departure: { ...form.departure, airport: v } }) },
                { label: 'Departure Terminal', val: form.departure.terminal, onChange: (v: string) => setForm({ ...form, departure: { ...form.departure, terminal: v } }) },
                { label: 'Departure Time', val: form.departure.time, type: 'datetime-local', onChange: (v: string) => setForm({ ...form, departure: { ...form.departure, time: v } }) },
                { label: 'Arrival Airport', val: form.arrival.airport, onChange: (v: string) => setForm({ ...form, arrival: { ...form.arrival, airport: v } }) },
                { label: 'Arrival Time', val: form.arrival.time, type: 'datetime-local', onChange: (v: string) => setForm({ ...form, arrival: { ...form.arrival, time: v } }) },
              ].map((field, idx) => (
                <div key={idx}>
                  <label style={{ fontSize: 13, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>{field.label}</label>
                  <input type={(field as any).type || 'text'} value={field.val}
                    onChange={e => field.onChange(e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>

            <p style={{ fontSize: 14, fontWeight: 800, color: '#000', marginBottom: 10 }}>Fare Options</p>
            {form.fareOptions.map((fare, i) => (
              <div key={i} style={{ border: '1.5px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 10, background: '#fafafa' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Fare Name', val: fare.fareName, onChange: (v: string) => { const u = [...form.fareOptions]; u[i] = { ...u[i], fareName: v }; setForm({ ...form, fareOptions: u }) } },
                    { label: 'Price', val: String(fare.pricePerSeat), type: 'number', onChange: (v: string) => { const u = [...form.fareOptions]; u[i] = { ...u[i], pricePerSeat: Number(v) }; setForm({ ...form, fareOptions: u }) } },
                    { label: 'Seats', val: String(fare.availableSeats), type: 'number', onChange: (v: string) => { const u = [...form.fareOptions]; u[i] = { ...u[i], availableSeats: Number(v) }; setForm({ ...form, fareOptions: u }) } },
                    { label: 'Benefits (split by ,)', val: fare.benefits.join(', '), onChange: (v: string) => { const u = [...form.fareOptions]; u[i] = { ...u[i], benefits: v.split(',').map(b => b.trim()) }; setForm({ ...form, fareOptions: u }) } },
                  ].map((f, j) => (
                    <div key={j}>
                      <label style={{ fontSize: 12, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 3 }}>{f.label}</label>
                      <input type={(f as any).type || 'text'} value={f.val} onChange={e => f.onChange(e.target.value)} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={() => setForm({ ...form, fareOptions: [...form.fareOptions, { fareName: '', pricePerSeat: 0, benefits: [], availableSeats: 0 }] })}
              style={{ fontSize: 14, color: '#378ADD', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, fontWeight: 'bold' }}>
              + Add Fare Option
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setModal('none'); setError('') }} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #ccc', background: 'white', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleSaveFlight} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: saving ? '#999' : '#1a1a2e', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Saving...' : modal === 'add' ? 'Add Flight' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search by Booking ID */}
      {modal === 'bookingId' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModal('none')}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', color: '#000' }}>🔍 Search by Booking ID</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Enter a reservation ID to view its full details and tickets.</p>
            <input placeholder="e.g. 219f4c34-d92f-4dca-b822..." value={searchBookingId}
              onChange={e => setSearchBookingId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBookingSearch()}
              style={{ ...inputStyle, marginBottom: 12 }} />
            <button onClick={handleBookingSearch} style={{
              width: '100%', padding: '12px', background: '#378ADD', color: 'white',
              border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
            }}>Go to Reservation →</button>
          </div>
        </div>
      )}

      {/* Search by User */}
      {modal === 'bookingUser' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModal('none')}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', color: '#000' }}>👤 Search by User</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Enter a username to view all their reservations.</p>
            <input placeholder="e.g. john_doe" value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUserSearch()}
              style={{ ...inputStyle, marginBottom: 12 }} />
            <button onClick={handleUserSearch} style={{
              width: '100%', padding: '12px', background: '#378ADD', color: 'white',
              border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
            }}>View Reservations →</button>
          </div>
        </div>
      )}

      {/* View All Users */}
      {modal === 'users' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModal('none')}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: 620, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', color: '#000' }}>👥 All Users</h3>
            {loadingUsers ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Loading users...</p>
            ) : users.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>No users found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {users.map(user => (
                  <div key={user.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', border: '1.5px solid #e0e0e0', borderRadius: 10,
                    background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{user.fullName}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                        @{user.username} · {user.email} · ✈️ {user.totalFlights} flights
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => { setModal('none'); router.push(`/admin/reservations?username=${user.username}`) }} style={{
                        padding: '6px 12px', background: '#1a1a2e', color: 'white',
                        border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                      }}>📋 Reservations</button>
                      <span style={{
                        fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 700,
                        background: user.role === 'ADMIN' ? '#1a1a2e' : '#378ADD', color: 'white',
                      }}>{user.role}</span>
                      {user.role === 'CUSTOMER' && (
                        <button onClick={() => handleDeleteUser(user.id, user.role)} style={{
                          padding: '6px 12px', background: '#e74c3c', color: 'white',
                          border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                        }}>🗑️ Delete</button>
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