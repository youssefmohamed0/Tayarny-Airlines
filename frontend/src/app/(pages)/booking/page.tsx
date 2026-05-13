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
  
  // State Management
  const [flight, setFlight] = useState<any>(null)
  const [fare, setFare] = useState<any>(null)
  const [params, setParams] = useState<any>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [loadingSeats, setLoadingSeats] = useState(true)
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [activeTravelerIdx, setActiveTravelerIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("--- Booking Page Initialized ---")
    
    const f = sessionStorage.getItem('selectedFlight')
    const fa = sessionStorage.getItem('selectedFare')
    const p = sessionStorage.getItem('searchParams')

    if (!f || !fa || !p) {
      console.error("Missing data in sessionStorage. Redirecting to search...")
      router.push('/search')
      return
    }

    const parsedFlight = JSON.parse(f)
    const parsedFare = JSON.parse(fa)
    const parsedParams = JSON.parse(p)

    console.log("Flight ID detected:", parsedFlight.flightId)
    
    setFlight(parsedFlight)
    setFare(parsedFare)
    setParams(parsedParams)

    // Build traveler slots based on search params
    const slots: Traveler[] = [
      ...Array(parsedParams.adults || 0).fill(null).map(() => ({ 
        type: 'ADULT' as const, fullName: '', passportNumber: '', dateOfBirth: '', assignedSeat: '' 
      })),
      ...Array(parsedParams.children || 0).fill(null).map(() => ({ 
        type: 'CHILD' as const, fullName: '', passportNumber: '', dateOfBirth: '', assignedSeat: '' 
      })),
    ]
    setTravelers(slots)

    // Fetch Seats from API
    if (parsedFlight.flightId) {
      setLoadingSeats(true)
      console.log("Fetching seats for flight:", parsedFlight.flightId)
      
      apiService.getSeatsByFlight(parsedFlight.flightId)
        .then(data => {
          console.log("API Success! Seats received:", data)
          setSeats(Array.isArray(data) ? data : [])
        })
        .catch(err => {
          console.error("API Error during seat fetch:", err)
          setSeats([])
        })
        .finally(() => {
          console.log("Seat loading finished.")
          setLoadingSeats(false)
        })
    }
  }, [router])

  // --- Logic Helpers ---

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

  function handleContinue() {
    // Basic validation
    for (let i = 0; i < travelers.length; i++) {
      if (!travelers[i].fullName || !travelers[i].assignedSeat) {
        setError(`Please complete info and select a seat for Traveler ${i + 1}`)
        return
      }
    }
    setError(null)
    sessionStorage.setItem('travelers', JSON.stringify(travelers))
    router.push('/payment')
  }

  // --- Grouping Logic for UI ---
  const seatsByRow: Record<string, Seat[]> = {}
  seats.forEach(s => {
    if (s.seatNum) {
      const row = s.seatNum.replace(/[A-Z]/g, '')
      if (!seatsByRow[row]) seatsByRow[row] = []
      seatsByRow[row].push(s)
    }
  })
  const rows = Object.keys(seatsByRow).sort((a, b) => Number(a) - Number(b))

  // Render check
  if (!flight || !fare) {
    return <div style={{ padding: 40 }}>Loading session data...</div>
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#378ADD', cursor: 'pointer', marginBottom: 16 }}>
        ← Back to results
      </button>

      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Passenger details</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        {flight.flightNumber} · {flight.departure?.airport} → {flight.arrival?.airport}
      </p>

      <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
        
        {/* Left Column: Form */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {travelers.map((t, i) => (
              <button 
                key={i} 
                onClick={() => setActiveTravelerIdx(i)}
                style={{
                  padding: '10px 15px', borderRadius: 8, border: 'none',
                  background: activeTravelerIdx === i ? '#1a1a2e' : '#f0f0f0',
                  color: activeTravelerIdx === i ? 'white' : '#555',
                  cursor: 'pointer'
                }}
              >
                T{i + 1} {t.assignedSeat ? `(${t.assignedSeat})` : ''}
              </button>
            ))}
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0 }}>Traveler {activeTravelerIdx + 1} ({travelers[activeTravelerIdx]?.type})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <input 
                placeholder="Full Name" 
                value={travelers[activeTravelerIdx]?.fullName || ''} 
                onChange={(e) => updateTraveler(activeTravelerIdx, 'fullName', e.target.value)}
                style={{ padding: 12, borderRadius: 8, border: '1px solid #ddd' }}
              />
              <input 
                placeholder="Passport Number" 
                value={travelers[activeTravelerIdx]?.passportNumber || ''} 
                onChange={(e) => updateTraveler(activeTravelerIdx, 'passportNumber', e.target.value)}
                style={{ padding: 12, borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
          </div>

          {error && <p style={{ color: 'red', marginTop: 15 }}>{error}</p>}

          <button onClick={handleContinue} style={{ 
            marginTop: 24, width: '100%', padding: 16, background: '#378ADD', color: 'white', 
            border: 'none', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer' 
          }}>
            Continue to Payment
          </button>
        </div>

        {/* Right Column: Seat Map */}
        <div style={{ flex: 1, background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '320px' }}>
          <h3 style={{ marginTop: 0 }}>Select Seat</h3>
          
          {loadingSeats ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <p>Loading aircraft configuration...</p>
            </div>
          ) : rows.length === 0 ? (
            <p style={{ color: '#999' }}>No seats found. Please check API connection.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: 20 }}>✈️</div>
              {rows.map(row => (
                <div key={row} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <span style={{ width: 20, fontSize: 12, color: '#ccc' }}>{row}</span>
                  {seatsByRow[row].map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => seat.status !== 'TAKEN' && assignSeat(seat.seatNum)}
                      style={{
                        width: 40, height: 40, borderRadius: 6, border: '1px solid #eee',
                        background: getSeatColor(seat),
                        cursor: seat.status === 'TAKEN' ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold', fontSize: 11
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