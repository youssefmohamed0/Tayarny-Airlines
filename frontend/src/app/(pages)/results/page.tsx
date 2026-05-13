'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface FareOption {
  fareName: string
  priceToken: string
  totalPrice: number
  priceBreakdown: {
    adult: { count: number; farePerPassenger: number }
    child?: { count: number; farePerPassenger: number }
  }
  benefits: string[]
  availableSeats: number
  cabinClass?: string
}

interface Flight {
  flightNumber: string
  aircraft: string
  departure: { airport: string; terminal?: string; time: string }
  arrival: { airport: string; time: string }
  fareOptions: FareOption[]
  // Updated to support both common ID keys from backends
  flightId?: string
  id?: string 
}

interface SearchParams {
  origin: { iataCode: string; city: string; name: string }
  destination: { iataCode: string; city: string; name: string }
  departureDate: string
  adults: number
  children: number
  cabinClass: string
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getDuration(dep: string, arr: string) {
  const mins = Math.round((new Date(arr).getTime() - new Date(dep).getTime()) / 60000)
  const h = Math.floor(mins / 60), m = mins % 60
  return `${h}h ${m}m`
}

export default function ResultsPage() {
  const router = useRouter()
  const [flights, setFlights] = useState<Flight[]>([])
  const [params, setParams] = useState<SearchParams | null>(null)
  const [selectedFare, setSelectedFare] = useState<{ flightIndex: number; fareIndex: number } | null>(null)

  useEffect(() => {
    const results = sessionStorage.getItem('searchResults')
    const searchParams = sessionStorage.getItem('searchParams')
    if (!results || !searchParams) { router.push('/search'); return }
    const parsed = JSON.parse(results)
    
    // Some APIs wrap results in a 'flights' array, others return the array directly
    setFlights(parsed.flights ?? (Array.isArray(parsed) ? parsed : []))
    setParams(JSON.parse(searchParams))
  }, [router])

  /**
   * EDITED FUNCTION: handleSelectFare
   * This ensures the flightId is explicitly set before saving to session
   */
  function handleSelectFare(flight: Flight, fare: FareOption) {
    // Look for the ID in all likely places (flightId, id, or _id)
    const actualId = flight.flightId || flight.id || (flight as any)._id;

    if (!actualId) {
      console.error("No Flight ID found in the object:", flight);
      alert("Error: Flight ID is missing. Check console.");
      return;
    }

    // Create a cleaned flight object that definitely has 'flightId'
    const flightToSave = {
      ...flight,
      flightId: actualId 
    };

    sessionStorage.setItem('selectedFlight', JSON.stringify(flightToSave))
    sessionStorage.setItem('selectedFare', JSON.stringify(fare))
    
    router.push('/booking')
  }

  if (!params) return null

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => router.push('/search')}
          style={{ background: 'none', border: 'none', color: '#378ADD', cursor: 'pointer', fontSize: 14, marginBottom: 12, padding: 0 }}>
          ← Back to search
        </button>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>
          {params.origin.iataCode} → {params.destination.iataCode}
        </h1>
        <p style={{ color: '#666', fontSize: 14 }}>
          {new Date(params.departureDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}{params.adults} adult{params.adults > 1 ? 's' : ''}
          {params.children > 0 ? `, ${params.children} child${params.children > 1 ? 'ren' : ''}` : ''}
          {' · '}{params.cabinClass.charAt(0) + params.cabinClass.slice(1).toLowerCase()}
        </p>
      </div>

      {flights.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
          <p style={{ fontSize: 48 }}>✈️</p>
          <p style={{ fontSize: 18 }}>No flights found for this route</p>
          <button onClick={() => router.push('/search')}
            style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, border: 'none', background: '#378ADD', color: 'white', cursor: 'pointer', fontSize: 15 }}>
            Try another search
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {flights.map((flight, fi) => (
            <div key={fi} style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' }}>

              {/* Flight header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                  <div>
                    <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#1a1a2e' }}>{formatTime(flight.departure.time)}</p>
                    <p style={{ fontSize: 13, color: '#999', margin: 0 }}>{flight.departure.airport}{flight.departure.terminal ? ` · T${flight.departure.terminal}` : ''}</p>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: '#999', margin: '0 0 4px' }}>{getDuration(flight.departure.time, flight.arrival.time)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 40, height: 1, background: '#ddd' }} />
                      <span style={{ fontSize: 16 }}>✈</span>
                      <div style={{ width: 40, height: 1, background: '#ddd' }} />
                    </div>
                    <p style={{ fontSize: 11, color: '#bbb', margin: '4px 0 0' }}>Direct</p>
                  </div>

                  <div>
                    <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#1a1a2e' }}>{formatTime(flight.arrival.time)}</p>
                    <p style={{ fontSize: 13, color: '#999', margin: 0 }}>{flight.arrival.airport}</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{flight.flightNumber}</p>
                  <p style={{ fontSize: 12, color: '#999', margin: '2px 0 0' }}>{flight.aircraft}</p>
                </div>
              </div>

              {/* Fare options */}
              <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {flight.fareOptions.map((fare, fareIdx) => {
                  const isSelected = selectedFare?.flightIndex === fi && selectedFare?.fareIndex === fareIdx
                  return (
                    <div key={fareIdx} onClick={() => setSelectedFare({ flightIndex: fi, fareIndex: fareIdx })}
                      style={{
                        flex: 1, minWidth: 200, padding: '1rem', borderRadius: 12, cursor: 'pointer',
                        border: isSelected ? '2px solid #378ADD' : '2px solid #f0f0f0',
                        background: isSelected ? '#f0f7ff' : '#fafafa',
                        transition: 'all 0.15s'
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#1a1a2e' }}>{fare.fareName}</p>
                          <p style={{ fontSize: 12, color: '#999', margin: '2px 0 0' }}>{fare.availableSeats} seats left</p>
                        </div>
                        <p style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                          ${fare.totalPrice.toLocaleString()}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {fare.benefits.map((b, bi) => (
                          <p key={bi} style={{ fontSize: 12, color: '#555', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: '#2ecc71' }}>✓</span> {b}
                          </p>
                        ))}
                      </div>

                      {isSelected && (
                        <button onClick={(e) => { e.stopPropagation(); handleSelectFare(flight, fare); }}
                          style={{
                            marginTop: 12, width: '100%', padding: '10px', borderRadius: 8,
                            border: 'none', background: '#378ADD', color: 'white',
                            fontSize: 14, fontWeight: 600, cursor: 'pointer'
                          }}>
                          Select this fare →
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}