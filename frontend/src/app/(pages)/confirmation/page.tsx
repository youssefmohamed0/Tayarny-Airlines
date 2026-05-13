'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ConfirmationPage() {
  const router = useRouter()
  const [reservation, setReservation] = useState<any>(null)

  useEffect(() => {
    const data = sessionStorage.getItem('confirmationData')
    if (!data) { router.push('/search'); return }
    setReservation(JSON.parse(data))
    sessionStorage.removeItem('confirmationData')
    sessionStorage.removeItem('searchResults')
    sessionStorage.removeItem('searchParams')
  }, [])

  if (!reservation) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4fb', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: 620, width: '100%' }}>

        {/* Success header */}
        <div style={{
          background: 'linear-gradient(135deg, #4B3BF5 0%, #7c3aed 100%)',
          borderRadius: 20, padding: '2.5rem', marginBottom: 20, textAlign: 'center', color: 'white',
          boxShadow: '0 8px 32px rgba(75,59,245,0.35)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Booking Confirmed!</h1>
          <p style={{ fontSize: 14, opacity: 0.8, margin: 0 }}>
            Reservation ID: <strong style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{reservation.id?.slice(0, 8).toUpperCase()}</strong>
          </p>
        </div>

        {/* Flight details */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e8e8f0', padding: '1.5rem', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px' }}>Flight Details</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 32, fontWeight: 800, margin: 0, color: '#111827', letterSpacing: '-0.5px' }}>{formatTime(reservation.departureTime)}</p>
              <p style={{ fontSize: 14, color: '#6b7280', margin: '2px 0 0', fontWeight: 500 }}>{reservation.originCity}</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{reservation.originAirport}</p>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 6px' }}>{reservation.flightNumber}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <div style={{ flex: 1, height: 1.5, background: '#e8e8f0' }} />
                <span style={{ fontSize: 18, color: '#4B3BF5' }}>✈</span>
                <div style={{ flex: 1, height: 1.5, background: '#e8e8f0' }} />
              </div>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '5px 0 0' }}>{reservation.cabinClass}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 32, fontWeight: 800, margin: 0, color: '#111827', letterSpacing: '-0.5px' }}>{formatTime(reservation.arrivalTime)}</p>
              <p style={{ fontSize: 14, color: '#6b7280', margin: '2px 0 0', fontWeight: 500 }}>{reservation.destinationCity}</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{reservation.destinationAirport}</p>
            </div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f4f4fb', fontSize: 13, color: '#374151', fontWeight: 500 }}>
            📅 {formatDate(reservation.departureTime)}
          </div>
        </div>

        {/* Tickets */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e8e8f0', padding: '1.5rem', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>🎫 Tickets</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reservation.tickets?.map((ticket: any, i: number) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', borderRadius: 10, background: '#fafafc',
                border: '1.5px dashed #e8e8f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#4B3BF5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                    {ticket.passengerName.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#111827' }}>{ticket.passengerName}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                      {ticket.passengerType} · {ticket.seatClass} · {ticket.seatPosition}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#4B3BF5' }}>{ticket.seatNumber}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>${ticket.price}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: '2px solid #f0f0f0' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Total Paid</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#4B3BF5' }}>${reservation.totalPrice}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/reservationhistory')} style={{
            flex: 1, padding: '13px', borderRadius: 10, border: '1.5px solid #e8e8f0',
            background: 'white', color: '#374151', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4B3BF5'; (e.currentTarget as HTMLElement).style.color = '#4B3BF5' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e8e8f0'; (e.currentTarget as HTMLElement).style.color = '#374151' }}
          >
            View My Bookings
          </button>
          <button onClick={() => router.push('/search')} style={{
            flex: 1, padding: '13px', borderRadius: 10, border: 'none',
            background: '#4B3BF5', color: 'white', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(75,59,245,0.3)',
          }}>
            Search More Flights
          </button>
        </div>
      </div>
    </div>
  )
}
