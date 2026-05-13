'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/services/api'

interface Seat {
  id: string
  seatNum: string
  position: string
  seatClass: string
  status: string
}

interface Traveler {
  type: 'ADULT' | 'CHILD'
  fullName: string
  passportNumber: string
  dateOfBirth: string
  assignedSeat: string
}

function isSeatTaken(seat: Seat) {
  const s = seat.status?.toUpperCase()
  return s === 'TAKEN' || s === 'BOOKED' || s === 'OCCUPIED' || s === 'RESERVED' || s === 'LOCKED'
}

export default function BookingPage() {
  const router = useRouter()
  const [flight, setFlight] = useState<any>(null)
  const [fare, setFare] = useState<any>(null)
  const [params, setParams] = useState<any>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [loadingSeats, setLoadingSeats] = useState(true)
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [activeTravelerIdx, setActiveTravelerIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const f = sessionStorage.getItem('selectedFlight')
    const fa = sessionStorage.getItem('selectedFare')
    const p = sessionStorage.getItem('searchParams')
    if (!f || !fa || !p) { router.push('/search'); return }
    const parsedFlight = JSON.parse(f), parsedFare = JSON.parse(fa), parsedParams = JSON.parse(p)
    setFlight(parsedFlight); setFare(parsedFare); setParams(parsedParams)
    const slots: Traveler[] = [
      ...Array(parsedParams.adults || 0).fill(null).map(() => ({ type: 'ADULT' as const, fullName: '', passportNumber: '', dateOfBirth: '', assignedSeat: '' })),
      ...Array(parsedParams.children || 0).fill(null).map(() => ({ type: 'CHILD' as const, fullName: '', passportNumber: '', dateOfBirth: '', assignedSeat: '' })),
    ]
    setTravelers(slots)

    async function fetchSeats() {
      try {
        const data = await apiService.getSeatsByFlight(parsedFlight.flightId)
        const allSeats: Seat[] = Array.isArray(data) ? data : []
        const cabinClass = parsedFare.cabinClass ?? (
          parsedFare.fareName?.toUpperCase().includes('FIRST') ? 'FIRST_CLASS' :
          parsedFare.fareName?.toUpperCase().includes('BUSINESS') ? 'BUSINESS' :
          'ECONOMY'
        )
        const filtered = allSeats.filter(s => s.seatClass?.toUpperCase() === cabinClass.toUpperCase())
        setSeats(filtered.length > 0 ? filtered : allSeats)
      } catch (err) {
        console.error('Failed to fetch seats:', err)
      } finally {
        setLoadingSeats(false)
      }
    }

    if (parsedFlight.flightId) {
      fetchSeats()
      const interval = setInterval(fetchSeats, 5000) // Poll every 5 seconds
      return () => clearInterval(interval)
    } else {
      setLoadingSeats(false)
    }
  }, [router])

  function updateTraveler(idx: number, field: keyof Traveler, value: string) {
    setTravelers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t))
  }
  function assignSeat(seatNum: string) {
    if (travelers.some((t, i) => t.assignedSeat === seatNum && i !== activeTravelerIdx)) return
    updateTraveler(activeTravelerIdx, 'assignedSeat', seatNum)
  }
  function getSeatColor(seat: Seat) {
    if (isSeatTaken(seat)) return '#e5e7eb'
    if (travelers.some((t, i) => t.assignedSeat === seat.seatNum && i !== activeTravelerIdx)) return '#f97316'
    if (travelers[activeTravelerIdx]?.assignedSeat === seat.seatNum) return '#4B3BF5'
    return 'white'
  }
function handleContinue() {
    const today = new Date().toISOString().split('T')[0]; // Gets YYYY-MM-DD

    for (let i = 0; i < travelers.length; i++) {
      const t = travelers[i];
      
      // 1. Basic empty check
      if (!t.fullName.trim()) { 
        setError(`Passenger ${i + 1}: full name is required`); 
        return; 
      }

      // 2. Future Date Validation
      if (t.dateOfBirth && t.dateOfBirth > today) {
        setError(`Passenger ${i + 1}: Date of birth cannot be in the future`);
        return;
      }

      // 3. Passport Format (Optional: alphanumeric, 6-15 chars)
      const passportRegex = /^[A-Z0-9]{6,15}$/i;
      if (t.passportNumber && !passportRegex.test(t.passportNumber)) {
        setError(`Passenger ${i + 1}: Please enter a valid passport number`);
        return;
      }

      // 4. Seat check
      if (!t.assignedSeat) { 
        setError(`Passenger ${i + 1}: please select a seat`); 
        return; 
      }
    }

    setError(null);
    sessionStorage.setItem('travelers', JSON.stringify(travelers));
    router.push('/payment');
  }

  const seatsByRow: Record<string, Seat[]> = {}
  seats.forEach(s => {
    if (s.seatNum) {
      const row = s.seatNum.replace(/[A-Z]/g, '')
      if (!seatsByRow[row]) seatsByRow[row] = []
      seatsByRow[row].push(s)
    }
  })
  const rows = Object.keys(seatsByRow).sort((a, b) => Number(a) - Number(b))
  const availableCount = seats.filter(s => !isSeatTaken(s)).length

  if (!flight || !fare) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4fb', fontFamily: 'inherit' }}>
      {/* Top bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8e8f0', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#4B3BF5', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Back
          </button>
          <div style={{ height: 20, width: 1, background: '#e8e8f0' }} />
          <div style={{ fontSize: 14, color: '#374151' }}>
            <span style={{ fontWeight: 700 }}>{flight.flightNumber}</span>
            <span style={{ color: '#9ca3af' }}> · {flight.departure?.airport} → {flight.arrival?.airport} · {fare.fareName}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Booking Details</h1>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Complete your passenger information and select your preferred seat.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* Left: Passenger form */}
          <div>
            {/* Traveler tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {travelers.map((t, i) => (
                <button key={i} onClick={() => setActiveTravelerIdx(i)} style={{
                  padding: '8px 16px', borderRadius: 8, border: '1.5px solid',
                  borderColor: activeTravelerIdx === i ? '#4B3BF5' : '#e8e8f0',
                  background: activeTravelerIdx === i ? '#4B3BF5' : 'white',
                  color: activeTravelerIdx === i ? 'white' : '#6b7280',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  transition: 'all 0.15s',
                }}>
                  {t.type === 'ADULT' ? '👤' : '👶'} Passenger {i + 1}
                  {t.assignedSeat && <span style={{ marginLeft: 6, opacity: 0.8 }}>· {t.assignedSeat}</span>}
                </button>
              ))}
            </div>

            {/* Form card */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 14, border: '1px solid #e8e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
                  Passenger {activeTravelerIdx + 1}
                </h3>
                <span style={{ background: '#eeeaff', color: '#4B3BF5', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                  {travelers[activeTravelerIdx]?.type}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="field-label">Full Name (as on passport) *</label>
                  <input
                    placeholder="e.g. Jane Doe"
                    value={travelers[activeTravelerIdx]?.fullName || ''}
                    onChange={e => updateTraveler(activeTravelerIdx, 'fullName', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="field-label">Passport Number</label>
                  <input
                    placeholder="e.g. A12345678"
                    value={travelers[activeTravelerIdx]?.passportNumber || ''}
                    onChange={e => updateTraveler(activeTravelerIdx, 'passportNumber', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="field-label">Date of Birth</label>
                  <input
                    type="date"
                    value={travelers[activeTravelerIdx]?.dateOfBirth || ''}
                    onChange={e => updateTraveler(activeTravelerIdx, 'dateOfBirth', e.target.value)}
                    className="input"
                  />
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: 8, background: '#f4f4fb', fontSize: 13,
                  color: travelers[activeTravelerIdx]?.assignedSeat ? '#4B3BF5' : '#9ca3af',
                  fontWeight: travelers[activeTravelerIdx]?.assignedSeat ? 600 : 400,
                }}>
                  {travelers[activeTravelerIdx]?.assignedSeat
                    ? `✓ Seat ${travelers[activeTravelerIdx].assignedSeat} selected`
                    : 'No seat selected yet — pick one from the map →'}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 14 }}>
                {error}
              </div>
            )}

            <button onClick={handleContinue} style={{
              width: '100%', padding: '14px', borderRadius: 10, border: 'none',
              background: '#4B3BF5', color: 'white', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
              boxShadow: '0 4px 12px rgba(75,59,245,0.3)',
            }}>
              Continue to Payment →
            </button>
          </div>

          {/* Right: Seat map */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 14, border: '1px solid #e8e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Seat Map</h3>
              {!loadingSeats && seats.length > 0 && (
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{availableCount} available</span>
              )}
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>
              Selecting for: <span style={{ color: '#4B3BF5', fontWeight: 600 }}>Passenger {activeTravelerIdx + 1}</span>
            </p>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                { color: 'white', border: '1.5px solid #d1d5db', label: 'Available' },
                { color: '#e5e7eb', label: 'Unavailable' },
                { color: '#4B3BF5', label: 'Selected' },
                { color: '#f97316', label: 'Other Party' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: item.color, border: (item as any).border ?? 'none' }} />
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {loadingSeats ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af' }}>Loading seats…</div>
            ) : rows.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 14 }}>No seats available for this cabin class.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <div style={{ fontSize: 20, marginBottom: 14 }}>✈</div>
                {rows.map(row => (
                  <div key={row} style={{ display: 'flex', gap: 5, marginBottom: 5, alignItems: 'center' }}>
                    <span style={{ width: 20, fontSize: 11, color: '#d1d5db', textAlign: 'center' }}>{row}</span>
                    {seatsByRow[row].map(seat => {
                      const color = getSeatColor(seat)
                      const taken = isSeatTaken(seat)
                      const isActive = travelers[activeTravelerIdx]?.assignedSeat === seat.seatNum
                      return (
                        <button key={seat.id}
                          onClick={() => !taken && assignSeat(seat.seatNum)}
                          title={`${seat.seatNum} · ${seat.position} · ${taken ? 'Taken' : 'Available'}`}
                          style={{
                            width: 40, height: 38, borderRadius: 8,
                            border: taken ? 'none' : `1.5px solid ${isActive ? '#4B3BF5' : '#d1d5db'}`,
                            background: color,
                            cursor: taken ? 'not-allowed' : 'pointer',
                            fontSize: 10, fontWeight: 700, fontFamily: 'inherit',
                            color: isActive ? 'white' : taken ? '#9ca3af' : '#6b7280',
                            transition: 'all 0.1s',
                          }}
                        >
                          {seat.seatNum}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ marginTop: 28, background: 'white', borderRadius: 12, border: '1px solid #e8e8f0', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Total for {travelers.length} Passenger{travelers.length > 1 ? 's' : ''}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>${fare.totalPrice?.toLocaleString()}</p>
          </div>
          <button onClick={handleContinue} style={{
            padding: '13px 28px', borderRadius: 10, border: 'none',
            background: '#4B3BF5', color: 'white', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Continue to Payment →
          </button>
        </div>
      </div>
    </div>
  )
}
