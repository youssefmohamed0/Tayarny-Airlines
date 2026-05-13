'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiService } from '@/services/api'

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, { bg: string; color: string }> = {
    CONFIRMED: { bg: '#d1fae5', color: '#065f46' },
    CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
    PENDING:   { bg: '#fef3c7', color: '#92400e' },
  }
  const style = s[status] ?? s.PENDING
  return (
    <span style={{ background: style.bg, color: style.color, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.04em' }}>
      {status}
    </span>
  )
}

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
      const tickets = Array.isArray(ticketsResponse) ? ticketsResponse : []
      setReservation({ ...data, tickets })
    } catch (e: any) {
      setError(e.message || 'Failed to load reservation details')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelTicket(ticketId: string) {
    if (!confirm('Are you sure you want to cancel this passenger ticket?')) return
    setCancelling(ticketId)
    try {
      await apiService.cancelTicket(ticketId)
      setReservation((prev: any) => ({
        ...prev,
        tickets: prev.tickets.map((t: any) => t.id === ticketId ? { ...t, status: 'CANCELLED' } : t)
      }))
    } catch (e: any) {
      alert(e.message || 'Failed to cancel ticket')
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '6rem', color: '#6b7280' }}>Loading reservation record…</div>

  if (error) return (
    <div className="animate-in">
      <button onClick={() => router.back()} style={{ marginBottom: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#4B3BF5', fontSize: 15, fontWeight: 600 }}>← Back</button>
      <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 16, padding: '3rem', color: '#991b1b', textAlign: 'center' }}>
        <p style={{ fontSize: 32, marginBottom: 16 }}>⚠️</p>
        <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
      </div>
    </div>
  )

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>←</span> Back to List
        </button>
        <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>RES_ID: {id}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Booking Overview</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: 16 }}>
            Customer: <strong style={{ color: '#111827' }}>{reservation.fullName}</strong> (@{reservation.username})
          </p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 40 }}>
        {/* Flight Summary Card */}
        <div className="card" style={{ background: 'white', padding: '1.5rem', border: '1px solid #e8e8f0' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route Information</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{reservation.originAirport}</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>{reservation.originCity}</div>
            </div>
            <div style={{ flex: 1, height: 1, background: '#e8e8f0', margin: '0 24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '0 8px', color: '#4B3BF5', fontSize: 18 }}>✈️</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{reservation.destinationAirport}</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>{reservation.destinationCity}</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: 4 }}>DEPARTURE</label>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{new Date(reservation.departureTime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: 4 }}>ARRIVAL</label>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{new Date(reservation.arrivalTime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</div>
            </div>
          </div>
        </div>

        {/* Pricing Summary Card */}
        <div className="card" style={{ background: '#fafafa', padding: '1.5rem', border: '1px solid #e8e8f0', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Details</h3>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#6b7280' }}>Fare Type</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{reservation.fareName} ({reservation.cabinClass})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#6b7280' }}>Total Seats</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{reservation.numSeats}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 16, borderTop: '2px dashed #e8e8f0' }}>
              <span style={{ fontWeight: 800, color: '#111827' }}>TOTAL PRICE</span>
              <span style={{ fontWeight: 800, color: '#4B3BF5', fontSize: 20 }}>${reservation.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 16 }}>Passenger Tickets</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reservation.tickets?.map((ticket: any) => (
          <div key={ticket.id} className="card" style={{
            background: 'white', padding: '20px', border: '1px solid #e8e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            opacity: ticket.status === 'CANCELLED' ? 0.6 : 1
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, flex: 1 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Passenger</label>
                <div style={{ fontWeight: 700, color: '#111827' }}>{ticket.passengerName}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{ticket.passengerType}</div>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Seat Assignment</label>
                <div style={{ fontWeight: 700, color: '#111827' }}>{ticket.seatNumber}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{ticket.seatClass} • {ticket.seatPosition}</div>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Documents</label>
                <div style={{ fontSize: 13, color: '#4b5563' }}>ID: {ticket.passportNumber || 'N/A'}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>DOB: {ticket.dateOfBirth || 'N/A'}</div>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Ticket Value</label>
                <div style={{ fontWeight: 800, color: '#10b981' }}>${ticket.price.toFixed(2)}</div>
                <div style={{ marginTop: 4 }}><StatusBadge status={ticket.status || 'ACTIVE'} /></div>
              </div>
            </div>

            {ticket.status !== 'CANCELLED' && (
              <button onClick={() => handleCancelTicket(ticket.id)} disabled={cancelling === ticket.id}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #fee2e2', background: 'white', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: cancelling === ticket.id ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                {cancelling === ticket.id ? 'Processing...' : 'Void Ticket'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}