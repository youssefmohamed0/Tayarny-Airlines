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
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* Success banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #378ADD 100%)',
        borderRadius: 20, padding: '2.5rem', marginBottom: 24, textAlign: 'center', color: 'white'
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
        <h1 style={{ fontSize: 26, margin: '0 0 8px' }}>Booking confirmed!</h1>
        <p style={{ fontSize: 14, opacity: 0.8, margin: 0 }}>
          Your reservation ID: <strong>{reservation.id?.slice(0, 8).toUpperCase()}</strong>
        </p>
      </div>

      {/* Flight details */}
      <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16, color: '#1a1a2e' }}>✈️ Flight details</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#1a1a2e' }}>
              {formatTime(reservation.departureTime)}
            </p>
            <p style={{ fontSize: 14, color: '#666', margin: '2px 0 0' }}>{reservation.originCity}</p>
            <p style={{ fontSize: 12, color: '#999', margin: 0 }}>{reservation.originAirport}</p>
          </div>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: 12, color: '#bbb', margin: '0 0 4px' }}>{reservation.flightNumber}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
              <div style={{ flex: 1, height: 1, background: '#ddd' }} />
              <span style={{ fontSize: 18 }}>✈</span>
              <div style={{ flex: 1, height: 1, background: '#ddd' }} />
            </div>
            <p style={{ fontSize: 11, color: '#bbb', margin: '4px 0 0' }}>{reservation.fareName} · {reservation.cabinClass}</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#1a1a2e' }}>
              {formatTime(reservation.arrivalTime)}
            </p>
            <p style={{ fontSize: 14, color: '#666', margin: '2px 0 0' }}>{reservation.destinationCity}</p>
            <p style={{ fontSize: 12, color: '#999', margin: 0 }}>{reservation.destinationAirport}</p>
          </div>
        </div>

        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#f8f9ff', fontSize: 13, color: '#555' }}>
          📅 {formatDate(reservation.departureTime)}
        </div>
      </div>

      {/* Tickets */}
      <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16, color: '#1a1a2e' }}>🎫 Tickets</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reservation.tickets?.map((ticket: any, i: number) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', borderRadius: 10, background: '#fafafa',
              border: '1px dashed #e0e0e0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#378ADD',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700
                }}>
                  {ticket.passengerName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#1a1a2e' }}>{ticket.passengerName}</p>
                  <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
                    {ticket.passengerType} · {ticket.seatClass} · {ticket.seatPosition}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1a1a2e' }}>{ticket.seatNumber}</p>
                <p style={{ fontSize: 12, color: '#999', margin: 0 }}>${ticket.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: '2px solid #f0f0f0' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>Total paid</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#378ADD' }}>${reservation.totalPrice}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => router.push('/reservationhistory')}
          style={{
            flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #1a1a2e',
            background: 'white', color: '#1a1a2e', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
          View my reservations
        </button>
        <button onClick={() => router.push('/search')}
          style={{
            flex: 1, padding: '14px', borderRadius: 12, border: 'none',
            background: '#378ADD', color: 'white', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
          Search more flights
        </button>
      </div>
    </div>
  )
}
