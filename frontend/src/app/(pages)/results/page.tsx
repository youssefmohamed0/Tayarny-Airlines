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
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function ResultsPage() {
  const router = useRouter()
  const [flights, setFlights] = useState<Flight[]>([])
  const [params, setParams] = useState<SearchParams | null>(null)
  const [expandedFlight, setExpandedFlight] = useState<number | null>(null)

  useEffect(() => {
    const results = sessionStorage.getItem('searchResults')
    const searchParams = sessionStorage.getItem('searchParams')
    if (!results || !searchParams) { router.push('/search'); return }
    const parsed = JSON.parse(results)
    setFlights(parsed.flights ?? (Array.isArray(parsed) ? parsed : []))
    setParams(JSON.parse(searchParams))
  }, [router])

  function handleSelectFare(flight: Flight, fare: FareOption) {
    const actualId = flight.flightId || flight.id || (flight as any)._id
    if (!actualId) { alert('Error: Flight ID is missing.'); return }
    sessionStorage.setItem('selectedFlight', JSON.stringify({ ...flight, flightId: actualId }))
    sessionStorage.setItem('selectedFare', JSON.stringify(fare))
    router.push('/booking')
  }

  if (!params) return null

  // Full-page layout (no nav padding needed since these pages hide nav)
  return (
    <div style={{ minHeight: '100vh', background: '#f4f4fb', fontFamily: 'inherit' }}>
      {/* Sticky top bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8e8f0', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.push('/search')} style={{ background: 'none', border: 'none', color: '#4B3BF5', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            ← Back
          </button>
          <div style={{ height: 20, width: 1, background: '#e8e8f0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#374151' }}>
            <span style={{ fontWeight: 700 }}>{params.origin?.iataCode}</span>
            <span style={{ color: '#9ca3af' }}>→</span>
            <span style={{ fontWeight: 700 }}>{params.destination?.iataCode}</span>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span>{new Date(params.departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span>{params.adults + params.children} passenger{params.adults + params.children > 1 ? 's' : ''}</span>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span style={{ textTransform: 'capitalize' }}>{params.cabinClass.toLowerCase()}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px' }}>
        {flights.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: 16, border: '1px solid #e8e8f0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✈️</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No flights found</p>
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>Try adjusting your search criteria</p>
            <button onClick={() => router.push('/search')} style={{ padding: '11px 24px', borderRadius: 8, border: 'none', background: '#4B3BF5', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>
              Modify Search
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{flights.length} flight{flights.length > 1 ? 's' : ''} found</p>
            {flights.map((flight, fi) => {
              const isExpanded = expandedFlight === fi
              const minPrice = Math.min(...flight.fareOptions.map(f => f.totalPrice))
              return (
                <div key={fi} style={{ background: 'white', borderRadius: 14, border: `1.5px solid ${isExpanded ? '#4B3BF5' : '#e8e8f0'}`, overflow: 'hidden', transition: 'all 0.18s' }}>

                  {/* Flight row */}
                  <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                      {/* Departure */}
                      <div>
                        <p style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#111827', letterSpacing: '-0.5px' }}>{formatTime(flight.departure.time)}</p>
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{flight.departure.airport}{flight.departure.terminal ? ` · T${flight.departure.terminal}` : ''}</p>
                      </div>

                      {/* Route */}
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 5px' }}>{getDuration(flight.departure.time, flight.arrival.time)}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 36, height: 1.5, background: '#e8e8f0' }} />
                          <span style={{ fontSize: 14, color: '#4B3BF5' }}>✈</span>
                          <div style={{ width: 36, height: 1.5, background: '#e8e8f0' }} />
                        </div>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>Direct</p>
                      </div>

                      {/* Arrival */}
                      <div>
                        <p style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#111827', letterSpacing: '-0.5px' }}>{formatTime(flight.arrival.time)}</p>
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{flight.arrival.airport}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 2px' }}>{flight.flightNumber} · {flight.aircraft}</p>
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>from <span style={{ fontWeight: 800, fontSize: 20, color: '#111827' }}>${minPrice.toLocaleString()}</span></p>
                      </div>
                      <button onClick={() => setExpandedFlight(isExpanded ? null : fi)} style={{
                        padding: '9px 20px', borderRadius: 8, border: '1.5px solid #4B3BF5',
                        background: isExpanded ? '#4B3BF5' : 'white', color: isExpanded ? 'white' : '#4B3BF5',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                      }}>
                        {isExpanded ? 'Hide Fares ↑' : 'View Fares ↓'}
                      </button>
                    </div>
                  </div>

                  {/* Fare options */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #f0f0f0', padding: '1.25rem 1.5rem', background: '#fafafc' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14 }}>Select Fare</p>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {flight.fareOptions.map((fare, fareIdx) => (
                          <div key={fareIdx} style={{
                            flex: 1, minWidth: 200, padding: '1.1rem', borderRadius: 12,
                            border: '2px solid #e8e8f0', background: 'white', transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#4B3BF5'; el.style.boxShadow = '0 4px 16px rgba(75,59,245,0.12)' }}
                            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#e8e8f0'; el.style.boxShadow = 'none' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'flex-start' }}>
                              <div>
                                <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: '#111827' }}>{fare.fareName}</p>
                                <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{fare.availableSeats} seats left</p>
                              </div>
                              <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>${fare.totalPrice.toLocaleString()}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                              {fare.benefits.map((b, bi) => (
                                <p key={bi} style={{ fontSize: 12, color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {b}
                                </p>
                              ))}
                            </div>
                            <button onClick={() => handleSelectFare(flight, fare)} style={{
                              width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                              background: '#4B3BF5', color: 'white', fontSize: 14, fontWeight: 700,
                              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
                            }}>
                              Select →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}