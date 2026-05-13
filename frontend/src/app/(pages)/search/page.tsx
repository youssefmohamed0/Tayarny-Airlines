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
      try { const data = await apiService.searchAirports(originQuery); setOriginSuggestions(data) } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [originQuery])

  useEffect(() => {
    if (destQuery.length < 2) { setDestSuggestions([]); return }
    const t = setTimeout(async () => {
      try { const data = await apiService.searchAirports(destQuery); setDestSuggestions(data) } catch {}
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
      sessionStorage.setItem('searchParams', JSON.stringify({ origin: originAirport, destination: destAirport, departureDate, adults, children, cabinClass }))
      router.push('/results')
    } catch (e: any) {
      setError(e.message || 'Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1.5px solid #e8e8f0', fontSize: 15, outline: 'none',
    fontFamily: 'inherit', background: 'white', boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s',
  }

  const SuggestionList = ({ items, onSelect }: { items: Airport[]; onSelect: (a: Airport) => void }) => (
    <div style={{
      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
      background: 'white', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      border: '1px solid #e8e8f0', marginTop: 4, overflow: 'hidden',
    }}>
      {items.map(a => (
        <button key={a.id} onMouseDown={(e) => { e.preventDefault(); onSelect(a); }}
          style={{
            width: '100%', padding: '10px 14px', border: 'none', background: 'none',
            textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
            borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 10,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f4f4fb')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <span style={{ fontWeight: 700, color: '#4B3BF5', fontSize: 13, minWidth: 36 }}>{a.iataCode}</span>
          <span style={{ fontSize: 14, color: '#374151' }}>{a.name}</span>
          <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>{a.country}</span>
        </button>
      ))}
    </div>
  )

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Search Flights</h1>
        <p>Find the best flights for your journey</p>
      </div>

      <div style={{ background: 'white', borderRadius: 18, padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #e8e8f0' }}>

        {/* Row 1: From / Swap / To */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>

          <div ref={originRef} style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <label className="field-label">From</label>
            <input
              value={originAirport ? `${originAirport.iataCode} — ${originAirport.city}` : originQuery}
              onChange={e => { setOriginQuery(e.target.value); setOriginAirport(null) }}
              onFocus={() => { if (originAirport) { setOriginQuery(''); setOriginAirport(null) } }}
              placeholder="City or airport code"
              className="input"
            />
            {originSuggestions.length > 0 && <SuggestionList items={originSuggestions} onSelect={a => { setOriginAirport(a); setOriginSuggestions([]) }} />}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
            <button onClick={() => {
              const tmp = originAirport; setOriginAirport(destAirport); setDestAirport(tmp)
              const tq = originQuery; setOriginQuery(destQuery); setDestQuery(tq)
            }} style={{
              width: 40, height: 44, borderRadius: 8, border: '1.5px solid #e8e8f0',
              background: 'white', cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B3BF5',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f4f4fb'; (e.currentTarget as HTMLElement).style.borderColor = '#4B3BF5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.borderColor = '#e8e8f0' }}
            >⇄</button>
          </div>

          <div ref={destRef} style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <label className="field-label">To</label>
            <input
              value={destAirport ? `${destAirport.iataCode} — ${destAirport.city}` : destQuery}
              onChange={e => { setDestQuery(e.target.value); setDestAirport(null) }}
              onFocus={() => { if (destAirport) { setDestQuery(''); setDestAirport(null) } }}
              placeholder="City or airport code"
              className="input"
            />
            {destSuggestions.length > 0 && <SuggestionList items={destSuggestions} onSelect={a => { setDestAirport(a); setDestSuggestions([]) }} />}
          </div>
        </div>

        {/* Row 2: Date + Passengers + Cabin */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'flex-end' }}>

          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="field-label">Departure date</label>
            <input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input"
            />
          </div>

          {/* Adults */}
          <div style={{ minWidth: 130 }}>
            <label className="field-label">Adults</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e8e8f0', background: 'white', height: 44 }}>
              <button onClick={() => setAdults(a => Math.max(1, a - 1))} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e8e8f0', background: 'white', cursor: 'pointer', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B3BF5' }}>−</button>
              <span style={{ fontSize: 15, fontWeight: 600, minWidth: 18, textAlign: 'center' }}>{adults}</span>
              <button onClick={() => setAdults(a => Math.min(9, a + 1))} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e8e8f0', background: 'white', cursor: 'pointer', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B3BF5' }}>+</button>
            </div>
          </div>

          {/* Children */}
          <div style={{ minWidth: 130 }}>
            <label className="field-label">Children</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e8e8f0', background: 'white', height: 44 }}>
              <button onClick={() => setChildren(c => Math.max(0, c - 1))} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e8e8f0', background: 'white', cursor: 'pointer', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B3BF5' }}>−</button>
              <span style={{ fontSize: 15, fontWeight: 600, minWidth: 18, textAlign: 'center' }}>{children}</span>
              <button onClick={() => setChildren(c => Math.min(9, c + 1))} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e8e8f0', background: 'white', cursor: 'pointer', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B3BF5' }}>+</button>
            </div>
          </div>

          {/* Cabin */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="field-label">Cabin class</label>
            <select value={cabinClass} onChange={e => setCabinClass(e.target.value)} className="input" style={{ appearance: 'auto' }}>
              {['ECONOMY', 'BUSINESS', 'FIRST_CLASS'].map(c => <option key={c} value={c}>{c === 'FIRST_CLASS' ? 'First Class' : c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 14 }}>
            {error}
          </div>
        )}

        <button onClick={handleSearch} disabled={loading} style={{
          width: '100%', padding: '14px', borderRadius: 10, border: 'none',
          background: loading ? '#a5b4fc' : '#4B3BF5', color: 'white',
          fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', transition: 'all 0.18s',
          boxShadow: loading ? 'none' : '0 4px 12px rgba(75,59,245,0.3)',
        }}>
          {loading ? 'Searching…' : '🔍 Search Flights'}
        </button>
      </div>
    </div>
  )
}
