'use client'
import { useEffect, useState } from 'react'
import { apiService } from '@/services/api'

interface Ticket { id: string; passengerName: string; passengerType: string; seatNumber: string; seatClass: string; seatPosition: string; price: number; passportNumber: string | null; dateOfBirth: string; status?: string; }
interface Reservation { id: string; flightNumber: string; originAirport: string; originCity: string; destinationAirport: string; destinationCity: string; departureTime: string; arrivalTime: string; fareName: string; cabinClass: string; numSeats: number; totalPrice: number; status: "CONFIRMED" | "CANCELLED" | "PENDING"; tickets: Ticket[]; }

function isFuture(departureTime: string) { return new Date(departureTime) > new Date() }
function formatDate(dt: string) { return new Date(dt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) }
function formatTime(dt: string) { return new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }
function getDuration(dep: string, arr: string) { const mins = Math.round((new Date(arr).getTime() - new Date(dep).getTime()) / 60000); return `${Math.floor(mins / 60)}h ${mins % 60}m` }
function airportCode(city: string) { const map: Record<string, string> = { Cairo: "CAI", London: "LHR", Dubai: "DXB", "New York": "JFK", Paris: "CDG", Amsterdam: "AMS", Istanbul: "IST", Rome: "FCO", "Kuala Lumpur": "KUL" }; return map[city] ?? city.slice(0, 3).toUpperCase() }

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, { bg: string; color: string }> = {
    CONFIRMED: { bg: '#d1fae5', color: '#065f46' },
    CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
    PENDING:   { bg: '#fef3c7', color: '#92400e' },
  }
  const style = s[status] ?? s.PENDING
  return (
    <span style={{ background: style.bg, color: style.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.04em' }}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div style={{ background: '#fafafc', borderRadius: 12, border: '1.5px dashed #e8e8f0', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eeeaff', color: '#4B3BF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>
            {ticket.passengerName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{ticket.passengerName}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{ticket.passengerType.charAt(0) + ticket.passengerType.slice(1).toLowerCase()}</p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#4B3BF5' }}>${ticket.price.toFixed(2)}</p>
      </div>
      <div style={{ borderTop: '1.5px dashed #e8e8f0', paddingTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Seat</p>
          <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 800, color: '#111827' }}>{ticket.seatNumber}</p>
          <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{ticket.seatPosition}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Class</p>
          <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: '#111827' }}>{ticket.seatClass.charAt(0) + ticket.seatClass.slice(1).toLowerCase()}</p>
        </div>
        {ticket.passportNumber && (
          <div>
            <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Passport</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: '#111827' }}>{ticket.passportNumber}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ReservationCard({ reservation, onClick }: { reservation: Reservation; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card card-hover animate-in"
      style={{ width: '100%', textAlign: 'left', padding: '1.25rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit', display: 'block', background: 'white' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>{airportCode(reservation.originCity)}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{reservation.originCity}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, color: '#9ca3af' }}>{getDuration(reservation.departureTime, reservation.arrivalTime)}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 28, height: 1.5, background: '#e8e8f0' }} />
              <span style={{ fontSize: 14, color: '#4B3BF5' }}>✈</span>
              <div style={{ width: 28, height: 1.5, background: '#e8e8f0' }} />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 10, color: '#9ca3af' }}>{reservation.cabinClass}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>{airportCode(reservation.destinationCity)}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{reservation.destinationCity}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <StatusBadge status={reservation.status} />
          <p style={{ margin: '8px 0 0', fontSize: 18, fontWeight: 800, color: '#111827' }}>${reservation.totalPrice.toFixed(2)}</p>
        </div>
      </div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f4f4fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6b7280', flexWrap: 'wrap', fontWeight: 500 }}>
          <span style={{ fontWeight: 700, color: '#374151' }}>{reservation.flightNumber}</span>
          <span>{formatDate(reservation.departureTime)}</span>
          <span>{formatTime(reservation.departureTime)} → {formatTime(reservation.arrivalTime)}</span>
          <span>{reservation.numSeats} passenger{reservation.numSeats > 1 ? 's' : ''}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#4B3BF5' }}>View details →</span>
      </div>
    </button>
  )
}

function ReservationDetail({ reservation, onBack, onCancel, cancelling }: {
  reservation: Reservation; onBack: () => void; onCancel: (id: string) => Promise<void>; cancelling: boolean;
}) {
  const [showTickets, setShowTickets] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const canCancel = isFuture(reservation.departureTime) && reservation.status !== "CANCELLED"

  return (
    <div className="animate-in">
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#4B3BF5', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', marginBottom: 20, padding: 0 }}>
        ← Back to all bookings
      </button>

      <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #e8e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280' }}>{reservation.flightNumber}</span>
              <StatusBadge status={reservation.status} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <div>
                <p style={{ margin: 0, fontSize: 38, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>{airportCode(reservation.originCity)}</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, color: '#4b5563', fontWeight: 500 }}>{reservation.originCity}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{reservation.originAirport}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{getDuration(reservation.departureTime, reservation.arrivalTime)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 40, height: 1.5, background: '#e8e8f0' }} />
                  <span style={{ fontSize: 18, color: '#4B3BF5' }}>✈</span>
                  <div style={{ width: 40, height: 1.5, background: '#e8e8f0' }} />
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{reservation.fareName}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 38, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>{airportCode(reservation.destinationCity)}</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, color: '#4b5563', fontWeight: 500 }}>{reservation.destinationCity}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{reservation.destinationAirport}</p>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#111827' }}>${reservation.totalPrice.toFixed(2)}</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{reservation.numSeats} passenger{reservation.numSeats > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, background: '#f4f4fb', borderRadius: 12, padding: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Departure</p>
            <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 800, color: '#111827' }}>{formatTime(reservation.departureTime)}</p>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{formatDate(reservation.departureTime)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Arrival</p>
            <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 800, color: '#111827' }}>{formatTime(reservation.arrivalTime)}</p>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{formatDate(reservation.arrivalTime)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Cabin</p>
            <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 800, color: '#111827' }}>{reservation.cabinClass.charAt(0) + reservation.cabinClass.slice(1).toLowerCase()}</p>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{reservation.fareName}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button onClick={() => setShowTickets(v => !v)} style={{
          flex: 1, padding: '13px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
          background: showTickets ? '#eeeaff' : 'white', color: showTickets ? '#4B3BF5' : '#374151',
          border: `1.5px solid ${showTickets ? '#4B3BF5' : '#e8e8f0'}`, transition: 'all 0.15s'
        }}>
          🎫 {showTickets ? 'Hide Tickets' : 'View Tickets'}
        </button>
        {canCancel ? (
          <button onClick={() => setShowConfirm(true)} disabled={cancelling} style={{
            flex: 1, padding: '13px', borderRadius: 10, cursor: cancelling ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
            background: 'white', color: '#ef4444', border: '1.5px solid #fca5a5', transition: 'all 0.15s',
            opacity: cancelling ? 0.6 : 1
          }}>
            {cancelling ? 'Cancelling…' : '✕ Cancel Booking'}
          </button>
        ) : (
          <div style={{ flex: 1, padding: '13px', borderRadius: 10, textAlign: 'center', background: '#f9fafb', color: '#9ca3af', fontSize: 14, fontWeight: 500, border: '1.5px solid #f3f4f6' }}>
            {reservation.status === 'CANCELLED' ? 'Reservation Cancelled' : 'Flight Already Departed'}
          </div>
        )}
      </div>

      {showTickets && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="animate-in">
          {reservation.tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
        </div>
      )}

      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
          <div className="animate-in" style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 400, width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>
              !
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#111827' }}>Cancel Booking?</h2>
            <p style={{ margin: '0 0 24px', fontSize: 15, color: '#6b7280', lineHeight: 1.6 }}>
              Flight <strong>{reservation.flightNumber}</strong> from {reservation.originCity} to {reservation.destinationCity} on {formatDate(reservation.departureTime)} will be cancelled. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #e8e8f0', background: 'white', color: '#374151', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>Keep Booking</button>
              <button onClick={async () => { setShowConfirm(false); await onCancel(reservation.id); }} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReservationHistoryPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  async function loadReservations(pageNum: number, append = false) {
    try {
      if (append) setLoadingMore(true); else setLoading(true)
      const data = await apiService.getUserReservations(pageNum)
      const items: Reservation[] = data.content ?? data
      const pages: number = data.totalPages ?? 1
      setReservations(prev => append ? [...prev, ...items] : items)
      setTotalPages(pages)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false); setLoadingMore(false) }
  }

  useEffect(() => { loadReservations(0) }, [])

  useEffect(() => {
    if (selected) {
      const updated = reservations.find(r => r.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [reservations])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleCancel = async (id: string) => {
    setCancelling(true)
    try {
      const updated: Reservation = await apiService.cancelReservation(id)
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: updated.status } : r))
      showToast('Reservation cancelled successfully')
    } catch { showToast('Something went wrong. Please try again.') }
    finally { setCancelling(false) }
  }

  const upcoming  = reservations.filter(r => r.status !== 'CANCELLED' && isFuture(r.departureTime))
  const past      = reservations.filter(r => r.status !== 'CANCELLED' && !isFuture(r.departureTime))
  const cancelled = reservations.filter(r => r.status === 'CANCELLED')

  return (
    <div className="animate-in" style={{ padding: '16px 0' }}>
      {!selected && (
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.5px' }}>My Bookings</h1>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>View and manage your upcoming and past flights.</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>⏳</p>
          <p>Loading your reservations…</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 14 }}>
          {error}
        </div>
      )}

      {selected && !loading && (
        <ReservationDetail reservation={selected} onBack={() => setSelected(null)} onCancel={handleCancel} cancelling={cancelling} />
      )}

      {!selected && !loading && !error && (
        <div>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Upcoming Flights</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upcoming.map(r => <ReservationCard key={r.id} reservation={r} onClick={() => setSelected(r)} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Past Flights</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.85 }}>
                {past.map(r => <ReservationCard key={r.id} reservation={r} onClick={() => setSelected(r)} />)}
              </div>
            </div>
          )}
          {cancelled.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Cancelled Bookings</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.6 }}>
                {cancelled.map(r => <ReservationCard key={r.id} reservation={r} onClick={() => setSelected(r)} />)}
              </div>
            </div>
          )}
          {page < totalPages - 1 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button onClick={() => { const next = page + 1; setPage(next); loadReservations(next, true); }} disabled={loadingMore}
                style={{ padding: '12px 32px', borderRadius: 10, border: '1.5px solid #e8e8f0', background: 'white', color: '#374151', cursor: loadingMore ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                {loadingMore ? 'Loading…' : 'Load More Flights'}
              </button>
            </div>
          )}
          {reservations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: 16, border: '1px solid #e8e8f0' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>✈️</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>No bookings found</p>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>You haven't made any flight reservations yet.</p>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  )
}
