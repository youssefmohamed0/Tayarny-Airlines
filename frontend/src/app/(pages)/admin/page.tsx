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

type Modal = 'none' | 'add' | 'edit' | 'users'

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
    if (!confirm('Are you sure you want to delete this flight route?')) return
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

  const now = new Date()

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: '0 0 6px', letterSpacing: '-0.8px' }}>Admin Dashboard</h1>
          <p style={{ color: '#6b7280', fontSize: 16, margin: 0 }}>Operational control center for Tayarny-Airlines.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#4B3BF5' }}>
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>System Status: Online</div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 18px', marginBottom: 24, color: '#991b1b', fontSize: 14, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 32 }}>
        <button onClick={openAdd} className="card card-hover" style={{
          background: 'linear-gradient(135deg, #4B3BF5 0%, #3a2de0 100%)', color: 'white', border: 'none', padding: '2.5rem 2rem',
          textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 24, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 120, opacity: 0.1, transform: 'rotate(-15deg)' }}>✈️</div>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>➕</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Add New Flight</div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Schedule a new route and aircraft</div>
          </div>
        </button>

        <button onClick={openUsers} className="card card-hover" style={{
          background: 'white', padding: '2.5rem 2rem',
          textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 24
        }}>
          <div style={{ background: '#eeeaff', width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#4B3BF5' }}>👥</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Manage Users</div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>View directory and booking history</div>
          </div>
        </button>
      </div>

      {/* Flight Search & List Section */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8e8f0', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f4f4fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Active Routes</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <input 
              placeholder="Search flight #..." 
              value={searchFlightNumber}
              onChange={e => setSearchFlightNumber(e.target.value)}
              className="input"
              style={{ width: 200, padding: '9px 12px', fontSize: 13 }} 
            />
            <button 
              onClick={() => loadFlights(searchFlightNumber || undefined)} 
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 8 }}
            >Search</button>
            {searchFlightNumber && (
              <button 
                onClick={() => { setSearchFlightNumber(''); loadFlights() }} 
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: 8, padding: '0 12px' }}
              >✕</button>
            )}
          </div>
        </div>

        <div style={{ padding: '8px 0' }}>
          {loadingFlights ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: '#9ca3af' }}>
              <div style={{ marginBottom: 12 }}>⏳</div>
              <p>Synchronizing flight data…</p>
            </div>
          ) : flights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: '#9ca3af' }}>
              <p>No flight records found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {flights.map((flight, i) => (
                <div key={flight.flightId || i} style={{
                  padding: '20px 24px', borderBottom: i === flights.length - 1 ? 'none' : '1px solid #f4f4fb',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }} className="hover-bg">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 17, color: '#111827' }}>{flight.flightNumber}</span>
                      <span style={{ fontSize: 15, color: '#4b5563', fontWeight: 500 }}>{flight.departure.airport} → {flight.arrival.airport}</span>
                      <span className="badge badge-primary">{flight.aircraft}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#6b7280' }}>
                      <span>🕒 Dep: {new Date(flight.departure.time).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>📍 Terminal {flight.departure.terminal}</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>
                        {flight.fareOptions?.map(f => `${f.fareName}: $${f.pricePerSeat}`).join(' | ')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => openEdit(flight)} className="btn btn-outline btn-sm">Edit</button>
                    <button onClick={() => flight.flightId && handleDeleteFlight(flight.flightId)} className="btn btn-ghost btn-sm" style={{ color: '#ef4444', borderColor: '#fee2e2' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal('none')}>
          <div className="modal-content animate-in" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111827' }}>
                {modal === 'add' ? 'Create New Flight' : `Modify Flight ${form.flightNumber}`}
              </h3>
              <button onClick={() => setModal('none')} style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
              {[
                { label: 'Flight Number', val: form.flightNumber, placeholder: 'e.g. TA102', onChange: (v: string) => setForm({ ...form, flightNumber: v }) },
                { label: 'Aircraft Type', val: form.aircraft, placeholder: 'e.g. Airbus A350', onChange: (v: string) => setForm({ ...form, aircraft: v }) },
                { label: 'Origin Airport', val: form.departure.airport, placeholder: 'e.g. CAI', onChange: (v: string) => setForm({ ...form, departure: { ...form.departure, airport: v } }) },
                { label: 'Departure Terminal', val: form.departure.terminal, placeholder: 'e.g. 2', onChange: (v: string) => setForm({ ...form, departure: { ...form.departure, terminal: v } }) },
                { label: 'Departure Time', val: form.departure.time, type: 'datetime-local', onChange: (v: string) => setForm({ ...form, departure: { ...form.departure, time: v } }) },
                { label: 'Destination Airport', val: form.arrival.airport, placeholder: 'e.g. DXB', onChange: (v: string) => setForm({ ...form, arrival: { ...form.arrival, airport: v } }) },
                { label: 'Arrival Time', val: form.arrival.time, type: 'datetime-local', onChange: (v: string) => setForm({ ...form, arrival: { ...form.arrival, time: v } }) },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="field-label">{field.label}</label>
                  <input type={(field as any).type || 'text'} value={field.val} placeholder={(field as any).placeholder}
                    onChange={e => field.onChange(e.target.value)} className="input" />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fare Inventory</p>
                <button onClick={() => setForm({ ...form, fareOptions: [...form.fareOptions, { fareName: '', pricePerSeat: 0, benefits: [], availableSeats: 0 }] })}
                  className="link" style={{ fontWeight: 700, fontSize: 13 }}>
                  + Add Fare Class
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {form.fareOptions.map((fare, i) => (
                  <div key={i} style={{ padding: 20, borderRadius: 12, border: '1px solid #e8e8f0', background: '#f9fafb', position: 'relative' }}>
                    {form.fareOptions.length > 1 && (
                      <button onClick={() => { const u = [...form.fareOptions]; u.splice(i, 1); setForm({ ...form, fareOptions: u }) }}
                        style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 20 }}>×</button>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 5, display: 'block' }}>Class Name</label>
                        <input value={fare.fareName} onChange={e => { const u = [...form.fareOptions]; u[i].fareName = e.target.value; setForm({ ...form, fareOptions: u }) }} className="input" style={{ background: 'white' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 5, display: 'block' }}>Price ($)</label>
                        <input type="number" value={fare.pricePerSeat} onChange={e => { const u = [...form.fareOptions]; u[i].pricePerSeat = Number(e.target.value); setForm({ ...form, fareOptions: u }) }} className="input" style={{ background: 'white' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 5, display: 'block' }}>Available Seats</label>
                        <input type="number" value={fare.availableSeats} onChange={e => { const u = [...form.fareOptions]; u[i].availableSeats = Number(e.target.value); setForm({ ...form, fareOptions: u }) }} className="input" style={{ background: 'white' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 5, display: 'block' }}>Benefits (comma separated)</label>
                      <input value={fare.benefits.join(', ')} onChange={e => { const u = [...form.fareOptions]; u[i].benefits = e.target.value.split(',').map(b => b.trim()); setForm({ ...form, fareOptions: u }) }} className="input" style={{ background: 'white' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
              <button onClick={() => setModal('none')} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSaveFlight} disabled={saving} className="btn btn-primary" style={{ flex: 2 }}>
                {saving ? 'Processing...' : modal === 'add' ? 'Confirm & Create Flight' : 'Save Route Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Users Modal */}
      {modal === 'users' && (
        <div className="modal-overlay" onClick={() => setModal('none')}>
          <div className="modal-content animate-in" style={{ maxWidth: 720, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '0 0 20px', borderBottom: '1px solid #f4f4fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>User Directory</h3>
              <button onClick={() => setModal('none')} style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            
            <div style={{ padding: '24px 0', overflowY: 'auto', flex: 1 }}>
              {loadingUsers ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '3rem' }}>Loading directory…</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {users.map(user => (
                    <div key={user.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '18px 20px', border: '1px solid #e8e8f0', borderRadius: 16, background: 'white'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, color: '#111827', fontSize: 16 }}>{user.fullName}</span>
                          <span className={`badge ${user.role === 'ADMIN' ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: 10 }}>{user.role}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>
                          @{user.username} • {user.email} • <strong style={{ color: '#4B3BF5' }}>{user.totalFlights}</strong> total flights
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => { setModal('none'); router.push(`/admin/reservations?username=${user.username}`) }} className="btn btn-outline btn-sm">
                          View Bookings
                        </button>
                        {user.role === 'CUSTOMER' && (
                          <button onClick={() => handleDeleteUser(user.id, user.role)} className="btn btn-ghost btn-sm" style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
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
        </div>
      )}
    </div>
  )
}