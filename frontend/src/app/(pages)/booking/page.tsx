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
  return s === 'TAKEN' || s === 'BOOKED' || s === 'OCCUPIED' || s === 'RESERVED'
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

    const slots: Traveler[] = [
      ...Array(parsedParams.adults || 0).fill(null).map(() => ({
        type: 'ADULT' as const, fullName: '', passportNumber: '', dateOfBirth: '', assignedSeat: ''
      })),
      ...Array(parsedParams.children || 0).fill(null).map(() => ({
        type: 'CHILD' as const, fullName: '', passportNumber: '', dateOfBirth: '', assignedSeat: ''
      })),
    ]
    setTravelers(slots)

    if (parsedFlight.flightId) {
      setLoadingSeats(true)
      apiService.getSeatsByFlight(parsedFlight.flightId)
        .then(data => {
          const allSeats: Seat[] = Array.isArray(data) ? data : []
          // Filter by cabin class of selected fare
          const cabinClass = parsedFare.cabinClass ?? parsedFare.fareName?.toUpperCase().includes('BUSINESS') ? 'BUSINESS' : 'ECONOMY'
          const filtered = allSeats.filter(s => s.seatClass?.toUpperCase() === cabinClass.toUpperCase())
          setSeats(filtered.length > 0 ? filtered : allSeats)
        })
        .catch(() => setSeats([]))
        .finally(() => setLoadingSeats(false))
    } else {
      setLoadingSeats(false)
    }
  }, [router])

  function updateTraveler(idx: number, field: keyof Traveler, value: string) {
    setTravelers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t))
  }

  function assignSeat(seatNum: string) {
    const alreadyTaken = travelers.some((t, i) => t.assignedSeat === seatNum && i !== activeTravelerIdx)
    if (alreadyTaken) return
    updateTraveler(activeTravelerIdx, 'assignedSeat', seatNum)
  }

  function getSeatColor(seat: Seat) {
    if (isSeatTaken(seat)) return '#e0e0e0'
    const assignedByOther = travelers.some((t, i) => t.assignedSeat === seat.seatNum && i !== activeTravelerIdx)
    const assignedByActive = travelers[activeTravelerIdx]?.assignedSeat === seat.seatNum
    if (assignedByOther) return '#f97316'
    if (assignedByActive) return '#378ADD'
    return 'white'
  }

  function handleContinue() {
    for (let i = 0; i < travelers.length; i++) {
      if (!travelers[i].fullName.trim()) { setError(`Traveler ${i + 1}: full name is required`); return }
      if (!travelers[i].assignedSeat) { setError(`Traveler ${i + 1}: please select a seat`); return }
    }
    setError(null)
    sessionStorage.setItem('travelers', JSON.stringify(travelers))
    router.push('/payment')
  }

  // Group seats by row
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
  const takenCount = seats.filter(s => isSeatTaken(s)).length

  if (!flight || !fare) return <div style={{ padding: 40 }}>Loading...</div>

  return (
    <div>
      <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#378ADD', cursor: 'pointer', marginBottom: 16, fontSize: 14, fontFamily: 'inherit', padding: 0 }}>
        ← Back to results
      </button>

      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Passenger details</h1>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
        {flight.flightNumber} · {flight.departure?.airport} → {flight.arrival?.airport} · {fare.fareName}
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Left: Passenger form */}
        <div style={{ flex: 1, minWidth: 300 }}>

          {/* Traveler tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {travelers.map((t, i) => (
              <button key={i} onClick={() => setActiveTravelerIdx(i)} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                background: activeTravelerIdx === i ? '#1a1a2e' : '#f0f0f0',
                color: activeTravelerIdx === i ? 'white' : '#555',
              }}>
                {t.type === 'ADULT' ? '👤' : '👶'} {i + 1}
                {t.assignedSeat && <span style={{ marginLeft: 6, opacity: 0.7 }}>· {t.assignedSeat}</span>}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
            <h3 style={{ marginTop: 0, fontSize: 15, color: '#1a1a2e' }}>
              Traveler {activeTravelerIdx + 1} — {travelers[activeTravelerIdx]?.type}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full name *</label>
                <input
                  placeholder="As on passport"
                  value={travelers[activeTravelerIdx]?.fullName || ''}
                  onChange={e => updateTraveler(activeTravelerIdx, 'fullName', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e5e5', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Passport number</label>
                <input
                  placeholder="e.g. A12345678"
                  value={travelers[activeTravelerIdx]?.passportNumber || ''}
                  onChange={e => updateTraveler(activeTravelerIdx, 'passportNumber', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e5e5', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date of birth</label>
                <input
                  type="date"
                  value={travelers[activeTravelerIdx]?.dateOfBirth || ''}
                  onChange={e => updateTraveler(activeTravelerIdx, 'dateOfBirth', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e5e5', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f8f9ff', fontSize: 13, color: travelers[activeTravelerIdx]?.assignedSeat ? '#378ADD' : '#aaa' }}>
                {travelers[activeTravelerIdx]?.assignedSeat
                  ? `✓ Seat ${travelers[activeTravelerIdx].assignedSeat} selected`
                  : 'No seat selected yet — pick one from the map →'}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: '#fff0f0', border: '1px solid #ffd0d0', color: '#c0392b', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button onClick={handleContinue} style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: '#378ADD', color: 'white', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Continue to payment →
          </button>
        </div>

        {/* Right: Seat map */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', minWidth: 300 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h3 style={{ marginTop: 0, marginBottom: 0, fontSize: 15, color: '#1a1a2e' }}>Select seat</h3>
            {!loadingSeats && seats.length > 0 && (
              <span style={{ fontSize: 12, color: '#aaa' }}>{availableCount} available · {takenCount} taken</span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#999', marginTop: 4, marginBottom: 16 }}>
            Selecting for: Traveler {activeTravelerIdx + 1}
          </p>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { color: 'white', border: '1px solid #ddd', label: 'Available' },
              { color: '#378ADD', label: 'Yours' },
              { color: '#f97316', label: 'Other traveler' },
              { color: '#e0e0e0', label: 'Taken' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: item.color, border: (item as any).border ?? 'none' }} />
                <span style={{ fontSize: 11, color: '#666' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {loadingSeats ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#aaa' }}>
              <p>Loading seats…</p>
            </div>
          ) : rows.length === 0 ? (
            <p style={{ color: '#999', fontSize: 14 }}>No seats available for this cabin class.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 16 }}>✈️</div>
              {rows.map(row => (
                <div key={row} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                  <span style={{ width: 20, fontSize: 11, color: '#ccc', textAlign: 'center' }}>{row}</span>
                  {seatsByRow[row].map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => !isSeatTaken(seat) && assignSeat(seat.seatNum)}
                      title={`${seat.seatNum} · ${seat.position} · ${isSeatTaken(seat) ? 'Taken' : 'Available'}`}
                      style={{
                        width: 40, height: 40, borderRadius: 7,
                        border: isSeatTaken(seat) ? 'none' : '1px solid #ddd',
                        background: getSeatColor(seat),
                        cursor: isSeatTaken(seat) ? 'not-allowed' : 'pointer',
                        fontSize: 10, fontWeight: 600, fontFamily: 'inherit',
                        color: travelers[activeTravelerIdx]?.assignedSeat === seat.seatNum ? 'white' : '#555',
                        transition: 'all 0.1s',
                        boxShadow: !isSeatTaken(seat) ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
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
