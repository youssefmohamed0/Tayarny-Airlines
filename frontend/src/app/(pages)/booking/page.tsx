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

    const parsedFlight = JSON.parse(f)
    const parsedFare = JSON.parse(fa)
    const parsedParams = JSON.parse(p)

    setFlight(parsedFlight)
    setFare(parsedFare)
    setParams(parsedParams)

    // Build traveler slots
    const slots: Traveler[] = [
      ...Array(parsedParams.adults).fill(null).map(() => ({ type: 'ADULT' as const, fullName: '', passportNumber: '', dateOfBirth: '', assignedSeat: '' })),
      ...Array(parsedParams.children).fill(null).map(() => ({ type: 'CHILD' as const, fullName: '', passportNumber: '', dateOfBirth: '', assignedSeat: '' })),
    ]
    setTravelers(slots)

    // Fetch seats
    if (parsedFlight.flightId) {
      apiService.getSeatsByFlight(parsedFlight.flightId)
        .then(setSeats)
        .catch(() => setSeats([]))
        .finally(() => setLoadingSeats(false))
    } else {
      setLoadingSeats(false)
    }
  }, [])

  function updateTraveler(idx: number, field: keyof Traveler, value: string) {
    setTravelers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t))
  }

  function assignSeat(seatNum: string) {
    const alreadyTaken = travelers.some((t, i) => t.assignedSeat === seatNum && i !== activeTravelerIdx)
    if (alreadyTaken) return
    updateTraveler(activeTravelerIdx, 'assignedSeat', seatNum)
  }

  function getSeatColor(seat: Seat) {
    const assignedByOther = travelers.some((t, i) => t.assignedSeat === seat.seatNum && i !== activeTravelerIdx)
    const assignedByActive = travelers[activeTravelerIdx]?.assignedSeat === seat.seatNum
    if (seat.status === 'TAKEN') return '#e0e0e0'
    if (assignedByOther) return '#f97316'
    if (assignedByActive) return '#378ADD'
    return 'white'
  }

  function validate() {
    for (let i = 0; i < travelers.length; i++) {
      const t = travelers[i]
      if (!t.fullName.trim()) return `Traveler ${i + 1}: full name is required`
      if (t.type === 'ADULT' && !t.passportNumber.trim()) return `Traveler ${i + 1}: passport number is required`
      if (!t.assignedSeat) return `Traveler ${i + 1}: please select a seat`
    }
    return null
  }

  function handleContinue() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    sessionStorage.setItem('travelers', JSON.stringify(travelers))
    router.push('/payment')
  }

  // Group seats by row for display
  const seatsByRow: Record<string, Seat[]> = {}
  seats.forEach(s => {
    const row = s.seatNum.replace(/[A-Z]/g, '')
    if (!seatsByRow[row]) seatsByRow[row] = []
    seatsByRow[row].push(s)
  })
  const rows = Object.keys(seatsByRow).sort((a, b) => Number(a) - Number(b))

  if (!flight || !fare) return null

  return (
    <div>
      <button onClick={() => router.back()}
        style={{ background: 'none', border: 'none', color: '#378ADD', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', marginBottom: 16, padding: 0 }}>
        ← Back to results
      </button>

      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Passenger details</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
        {flight.flightNumber} · {flight.departure.airport} → {flight.arrival.airport} · {fare.fareName}
      </p>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Left: Passenger forms */}
        <div style={{ flex: 1, minWidth: 300 }}>

          {/* Traveler tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {travelers.map((t, i) => (
              <button key={i} onClick={() => setActiveTravelerIdx(i)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                  background: activeTravelerIdx === i ? '#1a1a2e' : '#f0f0f0',
                  color: activeTravelerIdx === i ? 'white' : '#555',
                  transition: 'all 0.15s'
                }}>
                {t.type === 'ADULT' ? '👤' : '👶'} {t.type} {i + 1}
                {t.assignedSeat && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8 }}>· {t.assignedSeat}</span>}
              </button>
            ))}
          </div>

          {/* Active traveler form */}
          {travelers[activeTravelerIdx] && (
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: '#1a1a2e' }}>
                {travelers[activeTravelerIdx].type === 'ADULT' ? '👤' : '👶'} {travelers[activeTravelerIdx].type} {activeTravelerIdx + 1}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full name *</label>
                  <input value={travelers[activeTravelerIdx].fullName}
                    onChange={e => updateTraveler(activeTravelerIdx, 'fullName', e.target.value)}
                    placeholder="As on passport"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e5e5', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>

                {travelers[activeTravelerIdx].type === 'ADULT' && (
                  <div>
                    <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Passport number *</label>
                    <input value={travelers[activeTravelerIdx].passportNumber}
                      onChange={e => updateTraveler(activeTravelerIdx, 'passportNumber', e.target.value)}
                      placeholder="e.g. A12345678"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e5e5', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date of birth</label>
                  <input type="date" value={travelers[activeTravelerIdx].dateOfBirth}
                    onChange={e => updateTraveler(activeTravelerIdx, 'dateOfBirth', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e5e5', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Assigned seat {travelers[activeTravelerIdx].assignedSeat ? `· ${travelers[activeTravelerIdx].assignedSeat}` : '(select from map →)'}
                  </label>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: '#fff0f0', border: '1px solid #ffd0d0', color: '#c0392b', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button onClick={handleContinue}
            style={{
              marginTop: 20, width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: '#378ADD', color: 'white', fontSize: 16, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit'
            }}>
            Continue to payment →
          </button>
        </div>

        {/* Right: Seat map */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', minWidth: 280 }}>
          <h3 style={{ fontSize: 16, marginBottom: 4, color: '#1a1a2e' }}>Seat map</h3>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>
            Selecting for: {travelers[activeTravelerIdx]?.type} {activeTravelerIdx + 1}
          </p>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            {[
              { color: 'white', border: '1px solid #ddd', label: 'Available' },
              { color: '#378ADD', label: 'Yours' },
              { color: '#f97316', label: 'Other' },
              { color: '#e0e0e0', label: 'Taken' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: item.color, border: (item as any).border ?? 'none' }} />
                <span style={{ fontSize: 11, color: '#666' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {loadingSeats ? (
            <p style={{ color: '#999', fontSize: 14 }}>Loading seats…</p>
          ) : seats.length === 0 ? (
            <p style={{ color: '#999', fontSize: 14 }}>No seat map available. Enter seat manually above.</p>
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: 400 }}>
              <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 20 }}>✈️</div>
              {rows.map(row => (
                <div key={row} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, color: '#bbb', width: 20, textAlign: 'center' }}>{row}</span>
                  {seatsByRow[row].map(seat => (
                    <button key={seat.id}
                      onClick={() => seat.status !== 'TAKEN' && assignSeat(seat.seatNum)}
                      style={{
                        width: 38, height: 38, borderRadius: 8, border: 'none',
                        background: getSeatColor(seat),
                        boxShadow: seat.status !== 'TAKEN' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                        cursor: seat.status === 'TAKEN' ? 'not-allowed' : 'pointer',
                        fontSize: 10, fontWeight: 500, fontFamily: 'inherit',
                        color: travelers[activeTravelerIdx]?.assignedSeat === seat.seatNum ? 'white' : '#555',
                        transition: 'all 0.1s'
                      }}>
                      {seat.seatNum}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
