'use client'
import { useState, useEffect } from 'react'
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
      
      // Stable sorting by Flight Number to prevent list "jumping"
      const sortedData = [...data].sort((a, b) => 
        a.flightNumber.localeCompare(b.flightNumber)
      )
      
      setFlights(sortedData)
    } catch (e) {
      console.error("Failed to load flights", e)
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
      // Create copy and format dates for backend
      const payload = {
        ...form,
        departure: { ...form.departure, time: new Date(form.departure.time).toISOString() },
        arrival: { ...form.arrival, time: new Date(form.arrival.time).toISOString() },
      }

      if (modal === 'add') {
        // Remove flightId entirely for new flight POST requests
        delete payload.flightId 
        await apiService.addFlight(payload)
      } else if (modal === 'edit' && selectedFlight?.flightId) {
        await apiService.modifyFlight(selectedFlight.flightId, payload)
      }
      
      setModal('none')
      // Refresh list using the current search term to stay on the same view
      await loadFlights(searchFlightNumber || undefined)
    } catch (e: any) {
      console.error('Failed to save flight', e)
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
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 14, fontFamily: 'inherit',
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
            border: 'none', borderRadius: 10, cursor: 'pointer',
            fontSize: 14, fontWeight: 'bold', fontFamily: 'inherit',
          }}>🔍 Search by Booking ID</button>

          <button onClick={() => setModal('bookingUser')} style={{
            padding: '12px 20px', background: '#378ADD', color: 'white',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            fontSize: 14, fontWeight: 'bold', fontFamily: 'inherit',
          }}>👤 Search by User</button>

          <button onClick={openUsers} style={{
            padding: '12px 20px', background: '#e74c3c', color: 'white',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            fontSize: 14, fontWeight: 'bold', fontFamily: 'inherit',
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
                    fontFamily: 'inherit', boxShadow: '0 2px 6px rgba(55,138,221,0.4)',
                  }}>✏️ Edit</button>
                  <button onClick={() => flight.flightId && handleDeleteFlight(flight.flightId)} style={{
                    padding: '8px 14px', background: '#e74c3c', color: 'white',
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontFamily: 'inherit', boxShadow: '0 2px 6px rgba(231,76,60,0.4)',
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
                  <input type={(field as any).type || 'text'} value={field.val} maxLength={10}
                    onChange={e => field.onChange(e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>

            <p style={{ fontSize: 14, fontWeight: 800, color: '#000', marginBottom: 10 }}>Fare Options</p>
            {form.fareOptions.map((fare, i) => (
              <div key={i} style={{ border: '1.5px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 10, background: '#fafafa' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#000', fontWeight: 'bold' }}>Fare Name</label>
                    <input value={fare.fareName} onChange={e => {
                      const updated = [...form.fareOptions]
                      updated[i] = { ...updated[i], fareName: e.target.value }
                      setForm({ ...form, fareOptions: updated })
                    }} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#000', fontWeight: 'bold' }}>Price</label>
                    <input type="number" value={fare.pricePerSeat} onChange={e => {
                      const updated = [...form.fareOptions]
                      updated[i] = { ...updated[i], pricePerSeat: Number(e.target.value) }
                      setForm({ ...form, fareOptions: updated })
                    }} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#000', fontWeight: 'bold' }}>Seats</label>
                    <input type="number" value={fare.availableSeats} onChange={e => {
                      const updated = [...form.fareOptions]
                      updated[i] = { ...updated[i], availableSeats: Number(e.target.value) }
                      setForm({ ...form, fareOptions: updated })
                    }} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#000', fontWeight: 'bold' }}>Benefits (split by ,)</label>
                    <input value={fare.benefits.join(', ')} onChange={e => {
                      const updated = [...form.fareOptions]
                      updated[i] = { ...updated[i], benefits: e.target.value.split(',').map(b => b.trim()) }
                      setForm({ ...form, fareOptions: updated })
                    }} style={inputStyle} />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => setForm({ ...form, fareOptions: [...form.fareOptions, { fareName: '', pricePerSeat: 0, benefits: [], availableSeats: 0 }] })}
              style={{ fontSize: 14, color: '#378ADD', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, fontWeight: 'bold' }}>
              + Add Fare Option
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal('none')} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #ccc', background: 'white', fontWeight: 'bold' }}>Cancel</button>
              <button onClick={handleSaveFlight} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: saving ? '#999' : '#1a1a2e', color: 'white', fontWeight: 700 }}>
                {saving ? 'Saving...' : modal === 'add' ? 'Add Flight' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}