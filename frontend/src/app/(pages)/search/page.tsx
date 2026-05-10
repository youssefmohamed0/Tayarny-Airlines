'use client'
import { useState } from 'react'

const mockFlights = [
  { id: 1, from: 'Cairo', to: 'Dubai', date: '2026-05-15', type: 'One-way', price: '$299', airline: 'Emirates' },
  { id: 2, from: 'Cairo', to: 'London', date: '2026-05-18', type: 'Round-trip', price: '$650', airline: 'British Airways' },
  { id: 3, from: 'Dubai', to: 'New York', date: '2026-05-20', type: 'One-way', price: '$890', airline: 'Emirates' },
  { id: 4, from: 'London', to: 'Paris', date: '2026-05-22', type: 'One-way', price: '$120', airline: 'Air France' },
  { id: 5, from: 'New York', to: 'Cairo', date: '2026-05-25', type: 'Round-trip', price: '$780', airline: 'EgyptAir' },
  { id: 6, from: 'Dubai', to: 'London', date: '2026-05-28', type: 'Round-trip', price: '$540', airline: 'Flydubai' },
]

export default function SearchPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('')
  const [results, setResults] = useState(mockFlights)
  const [searched, setSearched] = useState(false)

  function handleSearch() {
    const filtered = mockFlights.filter(flight => {
      const matchFrom = from === '' || flight.from.toLowerCase().includes(from.toLowerCase())
      const matchTo = to === '' || flight.to.toLowerCase().includes(to.toLowerCase())
      const matchDate = date === '' || flight.date === date
      const matchType = type === '' || flight.type === type
      return matchFrom && matchTo && matchDate && matchType
    }).sort((a, b) => a.date.localeCompare(b.date))

    setResults(filtered)
    setSearched(true)
  }

  function handleReset() {
    setFrom('')
    setTo('')
    setDate('')
    setType('')
    setResults(mockFlights)
    setSearched(false)
  }

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Search Flights</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Find and filter available flights</p>

      {/* Search Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: 'white', borderRadius: 14, padding: '10px 10px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 32,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 100, padding: '0 12px', borderRight: '1px solid #eee' }}>
          <span style={{ color: '#999', fontSize: 13, marginRight: 8 }}>From</span>
          <input value={from} onChange={e => setFrom(e.target.value)}
            placeholder="City or airport"
            style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%', background: 'transparent' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 100, padding: '0 12px', borderRight: '1px solid #eee' }}>
          <span style={{ color: '#999', fontSize: 13, marginRight: 8 }}>To</span>
          <input value={to} onChange={e => setTo(e.target.value)}
            placeholder="City or airport"
            style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%', background: 'transparent' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 100, padding: '0 12px', borderRight: '1px solid #eee' }}>
          <span style={{ color: '#999', fontSize: 13, marginRight: 8 }}>Date</span>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%', background: 'transparent' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 120, padding: '0 12px' }}>
          <span style={{ color: '#999', fontSize: 13, marginRight: 8 }}>Type</span>
          <select value={type} onChange={e => setType(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%', background: 'transparent' }}>
            <option value="">Any</option>
            <option value="One-way">One-way</option>
            <option value="Round-trip">Round-trip</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '0 8px' }}>
          <button onClick={handleSearch}
            style={{ background: '#378ADD', color: 'white', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
            🔍 Search
          </button>
          {searched && (
            <button onClick={handleReset}
              style={{ background: '#eee', color: '#555', border: 'none', borderRadius: 10, padding: '12px 16px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <p style={{ fontSize: 48 }}>✈️</p>
            <p style={{ fontSize: 18 }}>No flights found</p>
          </div>
        ) : (
          results.map(flight => (
            <div key={flight.id} style={{
              background: 'white', borderRadius: 12, padding: '1.2rem 1.5rem',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div>
                  <p style={{ fontSize: 13, color: '#999', margin: 0 }}>From</p>
                  <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{flight.from}</p>
                </div>
                <span style={{ fontSize: 22, color: '#378ADD' }}>→</span>
                <div>
                  <p style={{ fontSize: 13, color: '#999', margin: 0 }}>To</p>
                  <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{flight.to}</p>
                </div>
                <div style={{ marginLeft: 16 }}>
                  <p style={{ fontSize: 13, color: '#999', margin: 0 }}>Date</p>
                  <p style={{ fontSize: 15, margin: 0 }}>{flight.date}</p>
                </div>
                <div>
                  <p style={{ fontSize: 13, color: '#999', margin: 0 }}>Airline</p>
                  <p style={{ fontSize: 15, margin: 0 }}>{flight.airline}</p>
                </div>
                <span style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 20,
                  background: flight.type === 'One-way' ? '#e8f4fd' : '#e8f8f0',
                  color: flight.type === 'One-way' ? '#378ADD' : '#2ecc71'
                }}>{flight.type}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{flight.price}</p>
                <button style={{
                  marginTop: 6, background: '#1a1a2e', color: 'white',
                  border: 'none', borderRadius: 8, padding: '8px 16px',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit'
                }}>Book now</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}