'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiService } from '@/services/api'

export default function ReservationDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [reservation, setReservation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => { if (id) loadReservation() }, [id])

async function loadReservation() {
  setLoading(true)
  try {
    const data = await apiService.getReservation(id as string)


const ticketsResponse = await apiService.getReservationTicketsAdmin(id as string)
console.log("TICKETS RESPONSE:", ticketsResponse)
const tickets = Array.isArray(ticketsResponse)
  ? ticketsResponse
  : []


    setReservation({
      ...data,
      tickets
    })

  } catch (e: any) {
    setError(e.message || 'Failed to load reservation')
  } finally {
    setLoading(false)
  }
}

  async function handleCancelTicket(ticketId: string) {
    if (!confirm('Cancel this ticket?')) return
    setCancelling(ticketId)
    try {
      console.log("Cancelling ticket:", ticketId)
      await apiService.cancelTicket(ticketId)
      setReservation((prev: any) => ({
        ...prev,
        tickets: prev.tickets.map((t: any) =>
          t.id === ticketId ? { ...t, status: 'CANCELLED' } : t
        )
      }))
    } catch (e: any) {
      alert(e.message || 'Failed to cancel ticket')
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return <p style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>Loading reservation...</p>

  if (error) return (
    <div>
      <button onClick={() => router.back()} style={{ marginBottom: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#378ADD', fontSize: 15, fontFamily: 'inherit' }}>← Back</button>
      <div style={{ background: '#fff0f0', border: '1px solid #e74c3c', borderRadius: 12, padding: '2rem', color: '#e74c3c' }}>⚠️ {error}</div>
    </div>
  )

  console.log(reservation)
  const statusColor = reservation.status === 'CANCELLED' ? '#e74c3c' : reservation.status === 'CONFIRMED' ? '#2ecc71' : '#378ADD'

  return (
    <div>
      <button onClick={() => router.back()} style={{ marginBottom: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#378ADD', fontSize: 15, fontFamily: 'inherit' }}>← Back</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>Reservation Details</h1>
          <p style={{ color: '#999', fontSize: 12, margin: '4px 0 0', fontFamily: 'monospace' }}>{id}</p>
        </div>
        <span style={{ padding: '6px 16px', borderRadius: 20, background: statusColor, color: 'white', fontWeight: 700, fontSize: 13 }}>
          {reservation.status}
        </span>
      </div>

      {/* Flight Info */}
      <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a1a2e' }}>✈️ Flight Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { label: 'Flight', val: reservation.flightNumber },
            { label: 'From', val: `${reservation.originCity} (${reservation.originAirport})` },
            { label: 'To', val: `${reservation.destinationCity} (${reservation.destinationAirport})` },
            { label: 'Departure', val: new Date(reservation.departureTime).toLocaleString() },
            { label: 'Arrival', val: new Date(reservation.arrivalTime).toLocaleString() },
            { label: 'Fare', val: reservation.fareName },
            { label: 'Cabin', val: reservation.cabinClass },
            { label: 'Seats', val: reservation.numSeats },
            { label: 'Total Price', val: `$${reservation.totalPrice}` },
          ].map(item => (
            <div key={item.label}>
              <p style={{ margin: 0, fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tickets */}
      <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a1a2e' }}>🎫 Tickets ({reservation.tickets?.length ?? 0})</h3>

        {!reservation.tickets?.length ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>No tickets.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reservation.tickets.map((ticket: any) => (
              <div key={ticket.id} style={{
                border: `1.5px solid ${ticket.status === 'CANCELLED' ? '#ffd0d0' : '#e0e0e0'}`,
                borderRadius: 12, padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: ticket.status === 'CANCELLED' ? '#fff8f8' : 'white',
                opacity: ticket.status === 'CANCELLED' ? 0.75 : 1,
              }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#999' }}>PASSENGER</p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{ticket.passengerName}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{ticket.passengerType}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#999' }}>SEAT</p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{ticket.seatNumber}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{ticket.seatClass} · {ticket.seatPosition}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#999' }}>PRICE</p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#378ADD' }}>${ticket.price}</p>
                  </div>
                  {ticket.passportNumber && (
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: '#999' }}>PASSPORT</p>
                      <p style={{ margin: 0, fontSize: 14, color: '#1a1a2e' }}>{ticket.passportNumber}</p>
                    </div>
                  )}
                  {ticket.dateOfBirth && (
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: '#999' }}>DATE OF BIRTH</p>
                      <p style={{ margin: 0, fontSize: 14, color: '#1a1a2e' }}>{ticket.dateOfBirth}</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 700,
                    background: ticket.status === 'CANCELLED' ? '#e74c3c' : '#2ecc71',
                    color: 'white',
                  }}>{ticket.status ?? 'ACTIVE'}</span>

                  {ticket.status !== 'CANCELLED' && (
                    <button onClick={() => handleCancelTicket(ticket.id)} disabled={cancelling === ticket.id}
                      style={{
                        padding: '8px 14px',
                        background: cancelling === ticket.id ? '#999' : '#e74c3c',
                        color: 'white', border: 'none', borderRadius: 8,
                        cursor: cancelling === ticket.id ? 'not-allowed' : 'pointer',
                        fontSize: 13, fontFamily: 'inherit', fontWeight: 600,
                      }}>
                      {cancelling === ticket.id ? 'Cancelling...' : '🚫 Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}