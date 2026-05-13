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
    padding: '11px 14px', borderRadius: 8, border: '1.5px solid #e8e8f0',
    fontSize: 14, width: '100%', outline: 'none', background: 'white',
    fontFamily: 'inherit', boxSizing: 'border-box' as const, transition: 'all 0.15s'
  }

  const now = new Date()

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Admin Dashboard</h1>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Manage flights, monitor bookings, and oversee users.</p>
        </div>
        <div style={{ textAlign: 'right', color: '#4B3BF5', fontSize: 13, fontWeight: 700 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#991b1b', fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats / Quick Actions Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <button onClick={openAdd} className="card-hover" style={{
          background: '#4B3BF5', color: 'white', border: 'none', borderRadius: 14, padding: '1.5rem',
          textAlign: 'left', cursor: 'pointer', boxShadow: '0 4px 12px rgba(75,59,245,0.2)'
        }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>✈️</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Add New Flight</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Create a new scheduled route</div>
        </button>

        <button onClick={() => setModal('bookingId')} className="card-hover" style={{
          background: 'white', border: '1px solid #e8e8f0', borderRadius: 14, padding: '1.5rem',
          textAlign: 'left', cursor: 'pointer'
        }}>
          <div style={{ fontSize: 24, marginBottom: 12, color: '#4B3BF5' }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Find Booking</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Search by Reservation ID</div>
        </button>

        <button onClick={() => setModal('bookingUser')} className="card-hover" style={{
          background: 'white', border: '1px solid #e8e8f0', borderRadius: 14, padding: '1.5rem',
          textAlign: 'left', cursor: 'pointer'
        }}>
          <div style={{ fontSize: 24, marginBottom: 12, color: '#4B3BF5' }}>👤</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>User History</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>View bookings by username</div>
        </button>

        <button onClick={openUsers} className="card-hover" style={{
          background: 'white', border: '1px solid #e8e8f0', borderRadius: 14, padding: '1.5rem',
          textAlign: 'left', cursor: 'pointer'
        }}>
          <div style={{ fontSize: 24, marginBottom: 12, color: '#4B3BF5' }}>👥</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Manage Users</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>View and delete accounts</div>
        </button>
      </div>

      {/* Flight Search & List Section */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f4f4fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Active Flights</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              placeholder="Filter by flight number..." 
              value={searchFlightNumber}
              onChange={e => setSearchFlightNumber(e.target.value)}
              style={{ ...inputStyle, width: 220, padding: '8px 12px', fontSize: 13 }} 
            />
            <button 
              onClick={() => loadFlights(searchFlightNumber || undefined)} 
              style={{ padding: '8px 16px', background: '#4B3BF5', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >Search</button>
            {searchFlightNumber && (
              <button 
                onClick={() => { setSearchFlightNumber(''); loadFlights() }} 
                style={{ padding: '8px 12px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
              >✕</button>
            )}
          </div>
        </div>

        <div style={{ padding: '8px 0' }}>
          {loadingFlights ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
              <p>Loading flight data…</p>
            </div>
          ) : flights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
              <p>No flights found matching your criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {flights.map((flight, i) => (
                <div key={flight.flightId || i} style={{
                  padding: '16px 24px', borderBottom: i === flights.length - 1 ? 'none' : '1px solid #f4f4fb',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.15s'
                }} className="hover-bg">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{flight.flightNumber}</span>
                      <span style={{ fontSize: 14, color: '#4b5563', fontWeight: 500 }}>{flight.departure.airport} → {flight.arrival.airport}</span>
                      <span style={{ fontSize: 11, background: '#eeeaff', color: '#4B3BF5', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{flight.aircraft}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280' }}>
                      <span>🕒 Dep: {new Date(flight.departure.time).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>📍 Terminal {flight.departure.terminal}</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>
                        {flight.fareOptions?.map(f => `${f.fareName}: $${f.pricePerSeat}`).join(' | ')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(flight)} style={{
                      padding: '8px 16px', background: 'white', color: '#4b5563',
                      border: '1.5px solid #e8e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                      fontWeight: 600, transition: 'all 0.15s'
                    }} onMouseEnter={e => e.currentTarget.style.borderColor = '#4B3BF5'} onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8f0'}>
                      Edit
                    </button>
                    <button onClick={() => flight.flightId && handleDeleteFlight(flight.flightId)} style={{
                      padding: '8px 12px', background: 'white', color: '#ef4444',
                      border: '1.5px solid #fee2e2', borderRadius: 8, cursor: 'pointer', fontSize: 13
                    }} onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      🗑️
                    </button>
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
          <div className="modal-content animate-in" style={{ width: 640 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>
                {modal === 'add' ? 'Create New Flight' : `Edit Flight ${form.flightNumber}`}
              </h3>
              <button onClick={() => setModal('none')} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Flight Number', val: form.flightNumber, placeholder: 'e.g. TA102', onChange: (v: string) => setForm({ ...form, flightNumber: v }) },
                { label: 'Aircraft Type', val: form.aircraft, placeholder: 'e.g. Boeing 787', onChange: (v: string) => setForm({ ...form, aircraft: v }) },
                { label: 'Origin Airport', val: form.departure.airport, placeholder: 'e.g. CAI', onChange: (v: string) => setForm({ ...form, departure: { ...form.departure, airport: v } }) },
                { label: 'Departure Terminal', val: form.departure.terminal, placeholder: 'e.g. 3', onChange: (v: string) => setForm({ ...form, departure: { ...form.departure, terminal: v } }) },
                { label: 'Departure Time', val: form.departure.time, type: 'datetime-local', onChange: (v: string) => setForm({ ...form, departure: { ...form.departure, time: v } }) },
                { label: 'Destination Airport', val: form.arrival.airport, placeholder: 'e.g. LHR', onChange: (v: string) => setForm({ ...form, arrival: { ...form.arrival, airport: v } }) },
                { label: 'Arrival Time', val: form.arrival.time, type: 'datetime-local', onChange: (v: string) => setForm({ ...form, arrival: { ...form.arrival, time: v } }) },
              ].map((field, idx) => (
                <div key={idx} style={{ gridColumn: idx === 0 ? 'span 1' : '' }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>{field.label}</label>
                  <input type={(field as any).type || 'text'} value={field.val} placeholder={(field as any).placeholder}
                    onChange={e => field.onChange(e.target.value)} className="input" />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', margin: 0 }}>FARE OPTIONS</p>
                <button onClick={() => setForm({ ...form, fareOptions: [...form.fareOptions, { fareName: '', pricePerSeat: 0, benefits: [], availableSeats: 0 }] })}
                  style={{ fontSize: 12, color: '#4B3BF5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  + Add Option
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {form.fareOptions.map((fare, i) => (
                  <div key={i} style={{ padding: 16, borderRadius: 12, border: '1px solid #e8e8f0', background: '#fafafa', position: 'relative' }}>
                    {form.fareOptions.length > 1 && (
                      <button onClick={() => { const u = [...form.fareOptions]; u.splice(i, 1); setForm({ ...form, fareOptions: u }) }}
                        style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18 }}>×</button>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 4, display: 'block' }}>Class Name</label>
                        <input value={fare.fareName} onChange={e => { const u = [...form.fareOptions]; u[i].fareName = e.target.value; setForm({ ...form, fareOptions: u }) }} className="input" style={{ background: 'white' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 4, display: 'block' }}>Price ($)</label>
                        <input type="number" value={fare.pricePerSeat} onChange={e => { const u = [...form.fareOptions]; u[i].pricePerSeat = Number(e.target.value); setForm({ ...form, fareOptions: u }) }} className="input" style={{ background: 'white' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 4, display: 'block' }}>Seats</label>
                        <input type="number" value={fare.availableSeats} onChange={e => { const u = [...form.fareOptions]; u[i].availableSeats = Number(e.target.value); setForm({ ...form, fareOptions: u }) }} className="input" style={{ background: 'white' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 4, display: 'block' }}>Benefits (comma separated)</label>
                      <input value={fare.benefits.join(', ')} onChange={e => { const u = [...form.fareOptions]; u[i].benefits = e.target.value.split(',').map(b => b.trim()); setForm({ ...form, fareOptions: u }) }} className="input" style={{ background: 'white' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button onClick={() => setModal('none')} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #e8e8f0', background: 'white', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveFlight} disabled={saving} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: '#4B3BF5', color: 'white', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(75,59,245,0.3)' }}>
                {saving ? 'Processing...' : modal === 'add' ? 'Create Flight Route' : 'Update Flight Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modals (ID / User) */}
      {(modal === 'bookingId' || modal === 'bookingUser') && (
        <div className="modal-overlay" onClick={() => setModal('none')}>
          <div className="modal-content animate-in" style={{ width: 400, padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800 }}>
              {modal === 'bookingId' ? 'Find by Booking ID' : 'Find by Username'}
            </h3>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
              {modal === 'bookingId' ? 'Enter the full UUID of the reservation.' : 'Enter a customer username to see their history.'}
            </p>
            <input 
              placeholder={modal === 'bookingId' ? "e.g. 550e8400-e29b..." : "e.g. johndoe"}
              value={modal === 'bookingId' ? searchBookingId : searchUser}
              onChange={e => modal === 'bookingId' ? setSearchBookingId(e.target.value) : setSearchUser(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (modal === 'bookingId' ? handleBookingSearch() : handleUserSearch())}
              className="input" style={{ marginBottom: 20 }}
            />
            <button onClick={modal === 'bookingId' ? handleBookingSearch : handleUserSearch} style={{
              width: '100%', padding: '13px', background: '#4B3BF5', color: 'white',
              border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700,
            }}>Search Records →</button>
          </div>
        </div>
      )}

      {/* View All Users Modal */}
      {modal === 'users' && (
        <div className="modal-overlay" onClick={() => setModal('none')}>
          <div className="modal-content animate-in" style={{ width: 680, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f4f4fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Registered Users</h3>
              <button onClick={() => setModal('none')} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {loadingUsers ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>Loading user directory…</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {users.map(user => (
                    <div key={user.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px', border: '1px solid #e8e8f0', borderRadius: 12, background: 'white'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: '#111827' }}>{user.fullName}</span>
                          <span style={{ fontSize: 11, background: user.role === 'ADMIN' ? '#111827' : '#eeeaff', color: user.role === 'ADMIN' ? 'white' : '#4B3BF5', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{user.role}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          @{user.username} • {user.email} • ✈️ {user.totalFlights} flights
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setModal('none'); router.push(`/admin/reservations?username=${user.username}`) }} style={{
                          padding: '6px 12px', background: '#f3f4f6', color: '#4b5563',
                          border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600
                        }}>Bookings</button>
                        {user.role === 'CUSTOMER' && (
                          <button onClick={() => handleDeleteUser(user.id, user.role)} style={{
                            padding: '6px 10px', background: 'white', color: '#ef4444',
                            border: '1px solid #fee2e2', borderRadius: 8, cursor: 'pointer', fontSize: 12
                          }}>🗑️</button>
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