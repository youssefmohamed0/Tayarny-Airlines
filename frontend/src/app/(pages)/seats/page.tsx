'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const rows = 6
const cols = ['A', 'B', 'C', 'D']

const takenSeats = ['1A', '1C', '2B', '3D', '4A', '4C', '5B', '6A']

export default function Seats() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  function toggleSeat(seat: string) {
    if (takenSeats.includes(seat)) return
    setSelected(prev => prev === seat ? null : seat)
  }

  function getSeatStyle(seat: string) {
    const isTaken = takenSeats.includes(seat)
    const isSelected = selected === seat

    return {
      width: 48, height: 48, borderRadius: 10,
      border: 'none', cursor: isTaken ? 'not-allowed' : 'pointer',
      fontSize: 12, fontFamily: 'inherit', fontWeight: 500,
      background: isTaken ? '#e0e0e0' : isSelected ? '#378ADD' : 'white',
      color: isTaken ? '#aaa' : isSelected ? 'white' : '#1a1a2e',
      boxShadow: isTaken ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.15s',
    }
  }

  function handleConfirm() {
    if (!selected) return
    // TODO: save selected seat and navigate or confirm booking
    alert(`Seat ${selected} confirmed! 🎉`)
  }

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Select Your Seat</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Choose an available seat for your flight</p>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Left - Info panel */}
        <div style={{
          flex: 1, minWidth: 220, background: 'white', borderRadius: 16,
          padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          display: 'flex', flexDirection: 'column', gap: 24
        }}>
          <div>
            <p style={{ color: '#999', fontSize: 13, margin: '0 0 4px' }}>Selected seat</p>
            <p style={{ fontSize: 48, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
              {selected ?? '—'}
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: '#999', margin: 0 }}>Legend</p>
            {[
              { color: 'white', border: '1px solid #ddd', label: 'Available' },
              { color: '#378ADD', label: 'Selected' },
              { color: '#e0e0e0', label: 'Taken' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: item.color, border: item.border ?? 'none' }} />
                <span style={{ fontSize: 14, color: '#555' }}>{item.label}</span>
              </div>
            ))}
          </div>

          <button onClick={handleConfirm} disabled={!selected}
            style={{
              marginTop: 'auto', padding: '14px', borderRadius: 10, border: 'none',
              background: selected ? '#1a1a2e' : '#eee',
              color: selected ? 'white' : '#aaa',
              fontSize: 16, cursor: selected ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', fontWeight: 500, transition: 'all 0.2s'
            }}>
            Confirm Seat
          </button>
        </div>

        {/* Right - Seat map */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
        }}>
          {/* Plane nose */}
          <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 28 }}>✈️</div>

          {/* Col headers */}
          <div style={{ display: 'grid', gridTemplateColumns: `32px repeat(2, 48px) 16px repeat(2, 48px)`, gap: 8, marginBottom: 8 }}>
            <div />
            {['A', 'B'].map(c => <div key={c} style={{ textAlign: 'center', fontSize: 13, color: '#999', fontWeight: 500 }}>{c}</div>)}
            <div />
            {['C', 'D'].map(c => <div key={c} style={{ textAlign: 'center', fontSize: 13, color: '#999', fontWeight: 500 }}>{c}</div>)}
          </div>

          {/* Rows */}
          {Array.from({ length: rows }, (_, i) => i + 1).map(row => (
            <div key={row} style={{ display: 'grid', gridTemplateColumns: `32px repeat(2, 48px) 16px repeat(2, 48px)`, gap: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#999' }}>{row}</div>
              {['A', 'B'].map(col => {
                const seat = `${row}${col}`
                return <button key={seat} style={getSeatStyle(seat)} onClick={() => toggleSeat(seat)}>{seat}</button>
              })}
              <div />
              {['C', 'D'].map(col => {
                const seat = `${row}${col}`
                return <button key={seat} style={getSeatStyle(seat)} onClick={() => toggleSeat(seat)}>{seat}</button>
              })}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}