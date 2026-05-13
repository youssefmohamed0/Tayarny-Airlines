'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/services/api'

interface Airport {
  id: string
  name: string
  city: string
  country: string
  iataCode: string
}

export default function SearchPage() {
  const router = useRouter()

  const [departureDate, setDepartureDate] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [cabinClass, setCabinClass] = useState('ECONOMY')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [originQuery, setOriginQuery] = useState('')
  const [destQuery, setDestQuery] = useState('')
  const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([])
  const [destSuggestions, setDestSuggestions] = useState<Airport[]>([])
  const [originAirport, setOriginAirport] = useState<Airport | null>(null)
  const [destAirport, setDestAirport] = useState<Airport | null>(null)

  const originRef = useRef<HTMLDivElement>(null)
  const destRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (originRef.current && !originRef.current.contains(e.target as Node)) setOriginSuggestions([])
      if (destRef.current && !destRef.current.contains(e.target as Node)) setDestSuggestions([])
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (originQuery.length < 2) { setOriginSuggestions([]); return }
    const t = setTimeout(async () => {
      try {
        const data = await apiService.searchAirports(originQuery)
        setOriginSuggestions(data)
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [originQuery])

  useEffect(() => {
    if (destQuery.length < 2) { setDestSuggestions([]); return }
    const t = setTimeout(async () => {
      try {
        const data = await apiService.searchAirports(destQuery)
        setDestSuggestions(data)
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [destQuery])

  async function handleSearch() {
    if (!originAirport && !destAirport && !departureDate) {
      setError('Please fill in at least one search field.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const data = await apiService.searchFlights({
        origin: originAirport?.iataCode ?? '',
        destination: destAirport?.iataCode ?? '',
        departureDate,
        travelers: { adults, children },
        cabinClass,
      })
      sessionStorage.setItem('searchResults', JSON.stringify(data))
      sessionStorage.setItem('searchParams', JSON.stringify({
        origin: originAirport,
        destination: destAirport,
        departureDate,
        adults,
        children,
        cabinClass,
      }))
      router.push('/results')
    } catch (e: any) {
      setError(e.message || 'Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const cabinOptions = ['ECONOMY', 'BUSINESS', 'FIRST']

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Search Flights</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Find the best flights for your journey</p>

      <div style={{
        background: 'white', borderRadius: 20, padding: '2rem',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)', marginBottom: 24
      }}>

        {/* Row 1: Origin + Destination */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>

          {/* Origin */}
          <div ref={originRef} style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <label style={{ fontSize: 12, color: '#999', fontWeight: 500, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</label>
            <input
              value={originAirport ? `${originAirport.iataCode} — ${originAirport.city}` : originQuery}
              onChange={e => { setOriginQuery(e.target.value); setOriginAirport(null) }}
              onFocus={() => { if (originAirport) { setOriginQuery(''); setOriginAirport(null) } }}
              placeholder="City or airport code (optional)"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid #e5e5e5', fontSize: 15, outline: 'none',
                fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box'
              }}
            />
            {originSuggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: 'white', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '1px solid #eee', marginTop: 4, overflow: 'hidden'
              }}>
                {originSuggestions.map(a => (
                  <button key={a.id} onClick={() => { setOriginAirport(a); setOriginSuggestions([]) }}
                    style={{
                      width: '100%', padding: '10px 14px', border: 'none', background: 'none',
                      textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                      borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 10
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8f9ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ fontWeight: 700, color: '#378ADD', fontSize: 14, minWidth: 36 }}>{a.iataCode}</span>
                    <span style={{ fontSize: 14, color: '#333' }}>{a.name}</span>
                    <span style={{ fontSize: 12, color: '#999', marginLeft: 'auto' }}>{a.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap button */}
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
            <button onClick={() => {
              const tmp = originAirport; setOriginAirport(destAirport); setDestAirport(tmp)
              const tq = originQuery; setOriginQuery(destQuery); setDestQuery(tq)
            }} style={{
              width: 36, height: 44, borderRadius: 10, border: '1.5px solid #e5e5e5',
              background: 'white', cursor: 'pointer', fontSize: 16, display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>⇄</button>
          </div>

          {/* Destination */}
          <div ref={destRef} style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <label style={{ fontSize: 12, color: '#999', fontWeight: 500, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</label>
            <input
              value={destAirport ? `${destAirport.iataCode} — ${destAirport.city}` : destQuery}
              onChange={e => { setDestQuery(e.target.value); setDestAirport(null) }}
              onFocus={() => { if (destAirport) { setDestQuery(''); setDestAirport(null) } }}
              placeholder="City or airport code (optional)"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid #e5e5e5', fontSize: 15, outline: 'none',
                fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box'
              }}
            />
            {destSuggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: 'white', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '1px solid #eee', marginTop: 4, overflow: 'hidden'
              }}>
                {destSuggestions.map(a => (
                  <button key={a.id} onClick={() => { setDestAirport(a); setDestSuggestions([]) }}
                    style={{
                      width: '100%', padding: '10px 14px', border: 'none', background: 'none',
                      textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                      borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 10
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8f9ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ fontWeight: 700, color: '#378ADD', fontSize: 14, minWidth: 36 }}>{a.iataCode}</span>
                    <span style={{ fontSize: 14, color: '#333' }}>{a.name}</span>
                    <span style={{ fontSize: 12, color: '#999', marginLeft: 'auto' }}>{a.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Date + Travelers + Cabin */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>

          {/* Date */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 12, color: '#999', fontWeight: 500, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Departure date</label>
            <input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid #e5e5e5', fontSize: 15, outline: 'none',
                fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box'
              }} />
          </div>

          {/* Adults */}
          <div style={{ minWidth: 120 }}>
            <label style={{ fontSize: 12, color: '#999', fontWeight: 500, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adults</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e5e5e5', background: '#fafafa' }}>
              <button onClick={() => setAdults(a => Math.max(1, a - 1))}
                style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontSize: 16, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{adults}</span>
              <button onClick={() => setAdults(a => Math.min(9, a + 1))}
                style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          </div>

          {/* Children */}
          <div style={{ minWidth: 120 }}>
            <label style={{ fontSize: 12, color: '#999', fontWeight: 500, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Children</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e5e5e5', background: '#fafafa' }}>
              <button onClick={() => setChildren(c => Math.max(0, c - 1))}
                style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontSize: 16, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{children}</span>
              <button onClick={() => setChildren(c => Math.min(9, c + 1))}
                style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          </div>

          {/* Cabin class */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 12, color: '#999', fontWeight: 500, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cabin class</label>
            <select value={cabinClass} onChange={e => setCabinClass(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid #e5e5e5', fontSize: 15, outline: 'none',
                fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box'
              }}>
              {cabinOptions.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: '#fff0f0', border: '1px solid #ffd0d0', color: '#c0392b', fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Search button */}
        <button onClick={handleSearch} disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: loading ? '#aaa' : '#378ADD', color: 'white',
            fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'all 0.2s'
          }}>
          {loading ? 'Searching…' : '🔍 Search flights'}
        </button>
      </div>
    </div>
  )
}
