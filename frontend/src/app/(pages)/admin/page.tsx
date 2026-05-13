'use client'
import { useState, useEffect, useMemo } from 'react'
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

type Modal = 'none' | 'add' | 'edit' | 'users' | 'bookingId' | 'bookingUser' | 'airports' | 'airplanes'

const FARE_CLASS_OPTIONS = ['Economy Standard', 'Business Flex', 'First Class']

const DEFAULT_BENEFITS: Record<string, string[]> = {
  'Economy Standard': ['Carry-on bag', 'Seat selection'],
  'Business Flex': ['Priority boarding', 'Extra legroom', 'Meal included', 'Lounge access'],
  'First Class': ['Lie-flat seat', 'Fine dining', 'Dedicated lounge', 'Chauffeur service', 'Premium amenity kit'],
}

const emptyFlight: Flight = {
  flightNumber: '',
  aircraft: '',
  departure: { airport: '', terminal: '', time: '' },
  arrival: { airport: '', time: '' },
  fareOptions: [{ fareName: 'Economy Standard', pricePerSeat: 0, benefits: DEFAULT_BENEFITS['Economy Standard'], availableSeats: 0 }],
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

  // Airport/Airplane state
  const [airports, setAirports] = useState<any[]>([])
  const [airplanes, setAirplanes] = useState<any[]>([])
  // airplaneModels now have shape: { id: string, name: string }
  const [airplaneModels, setAirplaneModels] = useState<{ id: string; name: string }[]>([])

  // Users state
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Airport modal state
  const [airportForm, setAirportForm] = useState({ name: '', city: '', country: '', iataCode: '' })
  const [savingAirport, setSavingAirport] = useState(false)

  // Airplane modal state
  const [airplaneForm, setAirplaneForm] = useState({ modelId: '', condition: 'NEW', numberOfFlights: 0 })
  const [savingAirplane, setSavingAirplane] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadFlights()
    loadFormResources()
  }, [])

  async function loadFormResources() {
    try {
      const [apData, plData] = await Promise.all([
        apiService.getAirports(),
        apiService.getAirplanes(),
      ])
      setAirports(apData)
      setAirplanes(plData)

      // Derive unique models from the airplanes list: { id: modelId, name: modelName }
      const seen = new Set<string>()
      const models: { id: string; name: string }[] = []
      for (const plane of plData) {
        if (plane.modelId && !seen.has(plane.modelId)) {
          seen.add(plane.modelId)
          models.push({ id: plane.modelId, name: plane.modelName })
        }
      }
      setAirplaneModels(models)
    } catch (e) {
      console.error('Failed to load airports or airplanes', e)
    }
  }

  async function loadFlights() {
    setLoadingFlights(true)
    try {
      const data = await apiService.getSingleFlight()
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

  // Live in-page filtering
  const filteredFlights = useMemo(() => {
    if (!searchFlightNumber.trim()) return flights
    return flights.filter(f =>
      f.flightNumber.toLowerCase().includes(searchFlightNumber.trim().toLowerCase())
    )
  }, [flights, searchFlightNumber])

  function openEdit(flight: Flight) {
    setSelectedFlight(flight)
    const formattedFlight = JSON.parse(JSON.stringify(flight))
    if (formattedFlight.departure.time) {
      formattedFlight.departure.time = new Date(formattedFlight.departure.time).toISOString().slice(0, 16)
    }
    if (formattedFlight.arrival.time) {
      formattedFlight.arrival.time = new Date(formattedFlight.arrival.time).toISOString().slice(0, 16)
    }
    setForm(formattedFlight)
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
      await loadFlights()
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

  // Fare helpers
  function updateFareName(i: number, fareName: string) {
    const u = [...form.fareOptions]
    u[i] = { ...u[i], fareName, benefits: DEFAULT_BENEFITS[fareName] || [] }
    setForm({ ...form, fareOptions: u })
  }

  function addFareOption() {
    const usedNames = form.fareOptions.map(f => f.fareName)
    const nextName = FARE_CLASS_OPTIONS.find(n => !usedNames.includes(n)) || 'Economy Standard'
    setForm({
      ...form,
      fareOptions: [
        ...form.fareOptions,
        { fareName: nextName, pricePerSeat: 0, benefits: DEFAULT_BENEFITS[nextName] || [], availableSeats: 0 },
      ],
    })
  }

  function removeFareOption(i: number) {
    const u = [...form.fareOptions]
    u.splice(i, 1)
    setForm({ ...form, fareOptions: u })
  }

  // Airport handlers
  async function handleAddAirport() {
    if (!airportForm.name || !airportForm.iataCode) return
    setSavingAirport(true)
    try {
      const created = await apiService.addAirport(airportForm)
      setAirports(prev => [...prev, created])
      setAirportForm({ name: '', city: '', country: '', iataCode: '' })
    } catch (e: any) {
      alert(e.message || 'Failed to add airport')
    } finally {
      setSavingAirport(false)
    }
  }

  async function handleDeleteAirport(id: string) {
    if (!confirm('Delete this airport?')) return
    const ok = await apiService.deleteAirport(id)
    if (ok) setAirports(prev => prev.filter(a => a.id !== id))
  }

  // Airplane handlers — after adding, refresh both airplanes & derived models
  async function handleAddAirplane() {
    if (!airplaneForm.modelId) return
    setSavingAirplane(true)
    try {
      const created = await apiService.addAirplane(airplaneForm)
      const updatedPlanes = [...airplanes, created]
      setAirplanes(updatedPlanes)

      // Re-derive models list so a newly added model shows up in the dropdown
      const seen = new Set<string>(airplaneModels.map(m => m.id))
      if (created.modelId && !seen.has(created.modelId)) {
        setAirplaneModels(prev => [...prev, { id: created.modelId, name: created.modelName }])
      }

      setAirplaneForm({ modelId: '', condition: 'NEW', numberOfFlights: 0 })
    } catch (e: any) {
      alert(e.message || 'Failed to add airplane')
    } finally {
      setSavingAirplane(false)
    }
  }

  async function handleDeleteAirplane(id: string) {
    if (!confirm('Delete this airplane?')) return
    const ok = await apiService.deleteAirplane(id)
    if (ok) setAirplanes(prev => prev.filter(a => a.id !== id))
  }

  const inputStyle = {
    padding: '10px 14px', borderRadius: 8, border: '1.5px solid #000',
    fontSize: 14, width: '100%', outline: 'none', background: '#fafafa',
    fontFamily: 'inherit', boxSizing: 'border-box' as const, color: '#000',
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
        {/* Action bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={openAdd} style={{
            padding: '12px 20px', background: '#1a1a2e', color: 'white',
            border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14,
            fontWeight: 600, fontFamily: 'inherit',
          }}>➕ Add Flight</button>

          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            <input
              placeholder="Search by flight number..."
              value={searchFlightNumber}
              onChange={e => setSearchFlightNumber(e.target.value)}
              style={{ ...inputStyle, maxWidth: 260 }}
            />
            {searchFlightNumber && (
              <button onClick={() => setSearchFlightNumber('')} style={{
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

          <button onClick={() => setModal('airports')} style={{
            padding: '12px 20px', background: '#2ecc71', color: 'white',
            border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 'bold', fontFamily: 'inherit',
          }}>🛬 Manage Airports</button>

          <button onClick={() => setModal('airplanes')} style={{
            padding: '12px 20px', background: '#9b59b6', color: 'white',
            border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 'bold', fontFamily: 'inherit',
          }}>✈️ Manage Airplanes</button>
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
            <div style={{ fontSize: 12, textAlign: 'center', marginTop: 8, opacity: 0.85 }}>
              {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''}
              {searchFlightNumber ? ' found' : ' total'}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
            {loadingFlights ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Loading flights...</p>
            ) : filteredFlights.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>
                {searchFlightNumber ? `No flights matching "${searchFlightNumber}".` : 'No flights found.'}
              </p>
            ) : filteredFlights.map((flight, i) => (
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
                    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
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

      {/* ── Add/Edit Flight Modal ── */}
      {(modal === 'add' || modal === 'edit') && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModal('none')}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: 580, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: 22, color: '#000' }}>
              {modal === 'add' ? '➕ Add New Flight' : '✏️ Edit Flight'}
            </h3>
            {error && <div style={{ background: '#fff0f0', border: '1px solid #e74c3c', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#e74c3c', fontSize: 13 }}>⚠️ {error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>Flight Number</label>
                <input type="text" value={form.flightNumber}
                  onChange={e => setForm({ ...form, flightNumber: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>Aircraft</label>
                <select value={form.aircraft} onChange={e => setForm({ ...form, aircraft: e.target.value })} style={inputStyle}>
                  <option value="">Select Airplane</option>
                  {airplanes.map(plane => (
                    <option key={plane.id} value={plane.modelName}>{plane.modelName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>Departure Airport</label>
                <select value={form.departure.airport} onChange={e => setForm({ ...form, departure: { ...form.departure, airport: e.target.value } })} style={inputStyle}>
                  <option value="">Select Airport</option>
                  {airports.map(ap => (
                    <option key={ap.id} value={ap.iataCode}>{ap.name} ({ap.iataCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>Departure Terminal</label>
                <input type="text" value={form.departure.terminal}
                  onChange={e => setForm({ ...form, departure: { ...form.departure, terminal: e.target.value } })} style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>Departure Time</label>
                <input type="datetime-local" value={form.departure.time}
                  onChange={e => setForm({ ...form, departure: { ...form.departure, time: e.target.value } })} style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>Arrival Airport</label>
                <select value={form.arrival.airport} onChange={e => setForm({ ...form, arrival: { ...form.arrival, airport: e.target.value } })} style={inputStyle}>
                  <option value="">Select Airport</option>
                  {airports.map(ap => (
                    <option key={ap.id} value={ap.iataCode}>{ap.name} ({ap.iataCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>Arrival Time</label>
                <input type="datetime-local" value={form.arrival.time}
                  onChange={e => setForm({ ...form, arrival: { ...form.arrival, time: e.target.value } })} style={inputStyle} />
              </div>
            </div>

            {/* Fare Options */}
            <p style={{ fontSize: 14, fontWeight: 800, color: '#000', marginBottom: 10 }}>Fare Options</p>
            {form.fareOptions.map((fare, i) => (
              <div key={i} style={{ border: '1.5px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 10, background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>Fare {i + 1}</span>
                  {form.fareOptions.length > 1 && (
                    <button onClick={() => removeFareOption(i)} style={{
                      background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                    }}>✕ Remove</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 3 }}>Fare Class</label>
                    <select value={fare.fareName} onChange={e => updateFareName(i, e.target.value)} style={inputStyle}>
                      {FARE_CLASS_OPTIONS.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 3 }}>Price per Seat ($)</label>
                    <input type="number" value={fare.pricePerSeat}
                      onChange={e => { const u = [...form.fareOptions]; u[i] = { ...u[i], pricePerSeat: Number(e.target.value) }; setForm({ ...form, fareOptions: u }) }}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 3 }}>Available Seats</label>
                    <input type="number" value={fare.availableSeats}
                      onChange={e => { const u = [...form.fareOptions]; u[i] = { ...u[i], availableSeats: Number(e.target.value) }; setForm({ ...form, fareOptions: u }) }}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#000', fontWeight: 'bold', display: 'block', marginBottom: 3 }}>Benefits (comma-separated)</label>
                    <input type="text" value={fare.benefits.join(', ')}
                      onChange={e => { const u = [...form.fareOptions]; u[i] = { ...u[i], benefits: e.target.value.split(',').map(b => b.trim()) }; setForm({ ...form, fareOptions: u }) }}
                      style={inputStyle} />
                  </div>
                </div>
              </div>
            ))}

            {form.fareOptions.length < FARE_CLASS_OPTIONS.length && (
              <button onClick={addFareOption} style={{
                fontSize: 14, color: '#378ADD', background: 'none', border: 'none',
                cursor: 'pointer', marginBottom: 16, fontWeight: 'bold',
              }}>+ Add Fare Option</button>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setModal('none'); setError('') }} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #ccc',
                background: 'white', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit',
              }}>Cancel</button>
              <button onClick={handleSaveFlight} disabled={saving} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                background: saving ? '#999' : '#1a1a2e', color: 'white',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {saving ? 'Saving...' : modal === 'add' ? 'Add Flight' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Search by Booking ID ── */}
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

      {/* ── Search by User ── */}
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

      {/* ── View All Users ── */}
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

      {/* ── Manage Airports ── */}
      {modal === 'airports' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModal('none')}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: 620, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', color: '#000' }}>🛬 Manage Airports</h3>

            <div style={{ border: '1.5px solid #e0e0e0', borderRadius: 10, padding: 16, marginBottom: 20, background: '#f9f9f9' }}>
              <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 14, color: '#000' }}>Add New Airport</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                {[
                  { label: 'Name', key: 'name', placeholder: 'Cairo International Airport' },
                  { label: 'IATA Code', key: 'iataCode', placeholder: 'CAI' },
                  { label: 'City', key: 'city', placeholder: 'Cairo' },
                  { label: 'Country', key: 'country', placeholder: 'Egypt' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: 12, fontWeight: 'bold', display: 'block', marginBottom: 3, color: '#000' }}>{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={(airportForm as any)[field.key]}
                      onChange={e => setAirportForm({ ...airportForm, [field.key]: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleAddAirport} disabled={savingAirport} style={{
                padding: '10px 20px', background: savingAirport ? '#999' : '#2ecc71', color: 'white',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
              }}>
                {savingAirport ? 'Adding...' : '+ Add Airport'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {airports.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center' }}>No airports found.</p>
              ) : airports.map(ap => (
                <div key={ap.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, background: 'white',
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 14 }}>{ap.iataCode}</span>
                    <span style={{ color: '#666', fontSize: 13, marginLeft: 8 }}>{ap.name} · {ap.city}, {ap.country}</span>
                  </div>
                  <button onClick={() => handleDeleteAirport(ap.id)} style={{
                    padding: '6px 12px', background: '#e74c3c', color: 'white',
                    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                  }}>🗑️ Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Airplanes ── */}
      {modal === 'airplanes' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModal('none')}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: 620, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', color: '#000' }}>✈️ Manage Airplanes</h3>

            <div style={{ border: '1.5px solid #e0e0e0', borderRadius: 10, padding: 16, marginBottom: 20, background: '#f9f9f9' }}>
              <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 14, color: '#000' }}>Add New Airplane</p>
              {airplaneModels.length === 0 && (
                <p style={{ fontSize: 12, color: '#e74c3c', marginBottom: 10 }}>
                  ⚠️ No airplane models available yet. Add at least one airplane first, or contact your backend team to seed models.
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 'bold', display: 'block', marginBottom: 3, color: '#000' }}>Model</label>
                  {/* modelId → use m.id; display name → m.name */}
                  <input
                      type="text"
                      placeholder="Enter airplane model (e.g. Boeing 737)"
                      value={airplaneForm.modelId}
                      onChange={e => setAirplaneForm({ ...airplaneForm, modelId: e.target.value })}
                      style={inputStyle}
                    />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 'bold', display: 'block', marginBottom: 3, color: '#000' }}>Condition</label>
                  <select value={airplaneForm.condition} onChange={e => setAirplaneForm({ ...airplaneForm, condition: e.target.value })} style={inputStyle}>
                    <option value="NEW">New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 'bold', display: 'block', marginBottom: 3, color: '#000' }}>Number of Flights</label>
                  <input type="number" value={airplaneForm.numberOfFlights}
                    onChange={e => setAirplaneForm({ ...airplaneForm, numberOfFlights: Number(e.target.value) })}
                    style={inputStyle} />
                </div>
              </div>
              <button onClick={handleAddAirplane} disabled={savingAirplane || !airplaneForm.modelId} style={{
                padding: '10px 20px',
                background: savingAirplane || !airplaneForm.modelId ? '#999' : '#9b59b6',
                color: 'white', border: 'none', borderRadius: 8,
                cursor: savingAirplane || !airplaneForm.modelId ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
              }}>
                {savingAirplane ? 'Adding...' : '+ Add Airplane'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {airplanes.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center' }}>No airplanes found.</p>
              ) : airplanes.map(plane => (
                <div key={plane.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, background: 'white',
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 14 }}>{plane.modelName}</span>
                    <span style={{ color: '#666', fontSize: 13, marginLeft: 8 }}>
                      {plane.condition && `· ${plane.condition}`}
                      {plane.numberOfFlights != null && ` · ${plane.numberOfFlights} flights`}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteAirplane(plane.id)} style={{
                    padding: '6px 12px', background: '#e74c3c', color: 'white',
                    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                  }}>🗑️ Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}