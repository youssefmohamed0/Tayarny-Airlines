"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/services/api";

interface Ticket {
  id: string;
  passengerName: string;
  passengerType: "ADULT" | "CHILD" | "INFANT";
  seatNumber: string;
  seatClass: string;
  seatPosition: string;
  price: number;
  passportNumber: string | null;
  dateOfBirth: string;
  status?: string;
}

interface Reservation {
  id: string;
  flightNumber: string;
  originAirport: string;
  originCity: string;
  destinationAirport: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  fareName: string;
  cabinClass: string;
  numSeats: number;
  totalPrice: number;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  tickets: Ticket[];
}

function isFuture(departureTime: string) {
  return new Date(departureTime) > new Date();
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function getDuration(dep: string, arr: string) {
  const mins = Math.round((new Date(arr).getTime() - new Date(dep).getTime()) / 60000);
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function airportCode(city: string) {
  const map: Record<string, string> = {
    Cairo: "CAI", London: "LHR", Dubai: "DXB", "New York": "JFK",
    Paris: "CDG", Amsterdam: "AMS", Istanbul: "IST", Rome: "FCO", "Kuala Lumpur": "KUL",
  };
  return map[city] ?? city.slice(0, 3).toUpperCase();
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, { bg: string; color: string }> = {
    CONFIRMED: { bg: "#e8f8f0", color: "#2ecc71" },
    CANCELLED: { bg: "#fff0f0", color: "#e74c3c" },
    PENDING:   { bg: "#fff8e1", color: "#f39c12" },
  };
  const style = s[status] ?? s.PENDING;
  return (
    <span style={{ background: style.bg, color: style.color, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div style={{ background: '#fafafa', borderRadius: 12, border: '1px dashed #ddd', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#378ADD', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
            {ticket.passengerName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{ticket.passengerName}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#999' }}>{ticket.passengerType.charAt(0) + ticket.passengerType.slice(1).toLowerCase()}</p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>${ticket.price.toFixed(2)}</p>
      </div>
      <div style={{ borderTop: '1px dashed #e0e0e0', paddingTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, color: '#aaa', textTransform: 'uppercase' }}>Seat</p>
          <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 700 }}>{ticket.seatNumber}</p>
          <p style={{ margin: 0, fontSize: 11, color: '#999' }}>{ticket.seatPosition}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 10, color: '#aaa', textTransform: 'uppercase' }}>Class</p>
          <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600 }}>{ticket.seatClass.charAt(0) + ticket.seatClass.slice(1).toLowerCase()}</p>
        </div>
        {ticket.passportNumber && (
          <div>
            <p style={{ margin: 0, fontSize: 10, color: '#aaa', textTransform: 'uppercase' }}>Passport</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600 }}>{ticket.passportNumber}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReservationCard({ reservation, onClick }: { reservation: Reservation; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ width: '100%', textAlign: 'left', background: 'white', borderRadius: 16, border: '1.5px solid #eee', padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#378ADD'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(55,138,221,0.1)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#eee'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>{airportCode(reservation.originCity)}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#999' }}>{reservation.originCity}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, color: '#bbb' }}>{getDuration(reservation.departureTime, reservation.arrivalTime)}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 24, height: 1, background: '#ddd' }} />
              <span style={{ fontSize: 14, color: '#aaa' }}>✈</span>
              <div style={{ width: 24, height: 1, background: '#ddd' }} />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 10, color: '#bbb' }}>{reservation.cabinClass}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>{airportCode(reservation.destinationCity)}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#999' }}>{reservation.destinationCity}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <StatusBadge status={reservation.status} />
          <p style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>${reservation.totalPrice.toFixed(2)}</p>
        </div>
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#999', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: '#555' }}>{reservation.flightNumber}</span>
          <span>{formatDate(reservation.departureTime)}</span>
          <span>{formatTime(reservation.departureTime)} → {formatTime(reservation.arrivalTime)}</span>
          <span>{reservation.numSeats} seat{reservation.numSeats > 1 ? 's' : ''}</span>
        </div>
        <span style={{ fontSize: 12, color: '#bbb' }}>View details →</span>
      </div>
    </button>
  );
}

function ReservationDetail({ reservation, onBack, onCancel, cancelling }: {
  reservation: Reservation; onBack: () => void; onCancel: (id: string) => Promise<void>; cancelling: boolean;
}) {
  const [showTickets, setShowTickets] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const canCancel = isFuture(reservation.departureTime) && reservation.status !== "CANCELLED";

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#378ADD', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', marginBottom: 20, padding: 0 }}>
        ← Back to reservations
      </button>

      <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#999' }}>{reservation.flightNumber}</span>
              <StatusBadge status={reservation.status} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div>
                <p style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#1a1a2e' }}>{airportCode(reservation.originCity)}</p>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#666' }}>{reservation.originCity}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{reservation.originAirport}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, color: '#bbb' }}>{getDuration(reservation.departureTime, reservation.arrivalTime)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 32, height: 1, background: '#ddd' }} />
                  <span style={{ fontSize: 18 }}>✈</span>
                  <div style={{ width: 32, height: 1, background: '#ddd' }} />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#bbb' }}>{reservation.fareName}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#1a1a2e' }}>{airportCode(reservation.destinationCity)}</p>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#666' }}>{reservation.destinationCity}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{reservation.destinationAirport}</p>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>${reservation.totalPrice.toFixed(2)}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#aaa' }}>{reservation.numSeats} passenger{reservation.numSeats > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, background: '#f8f9ff', borderRadius: 12, padding: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: '#aaa', textTransform: 'uppercase' }}>Departure</p>
            <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>{formatTime(reservation.departureTime)}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#999' }}>{formatDate(reservation.departureTime)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: '#aaa', textTransform: 'uppercase' }}>Arrival</p>
            <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>{formatTime(reservation.arrivalTime)}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#999' }}>{formatDate(reservation.arrivalTime)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: '#aaa', textTransform: 'uppercase' }}>Cabin</p>
            <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>{reservation.cabinClass.charAt(0) + reservation.cabinClass.slice(1).toLowerCase()}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#999' }}>{reservation.fareName}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button onClick={() => setShowTickets(v => !v)} style={{
          flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
          background: showTickets ? '#1a1a2e' : 'white', color: showTickets ? 'white' : '#1a1a2e',
          border: showTickets ? '1.5px solid #1a1a2e' : '1.5px solid #e5e5e5',
        }}>
          🎫 {showTickets ? 'Hide tickets' : 'View tickets'}
        </button>
        {canCancel ? (
          <button onClick={() => setShowConfirm(true)} disabled={cancelling} style={{
            flex: 1, padding: '12px', borderRadius: 12, cursor: cancelling ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
            background: '#fff0f0', color: '#e74c3c', border: '1.5px solid rgba(231,76,60,0.3)', opacity: cancelling ? 0.6 : 1
          }}>
            {cancelling ? 'Cancelling…' : '✕ Cancel reservation'}
          </button>
        ) : (
          <div style={{ flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center', background: '#f5f5f5', color: '#aaa', fontSize: 14, border: '1.5px solid #eee' }}>
            {reservation.status === 'CANCELLED' ? 'Already cancelled' : 'Flight already departed'}
          </div>
        )}
      </div>

      {showTickets && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reservation.tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
        </div>
      )}

      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', maxWidth: 380, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Cancel this reservation?</h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#666', lineHeight: 1.6 }}>
              Flight <strong>{reservation.flightNumber}</strong> from {reservation.originCity} to {reservation.destinationCity} on {formatDate(reservation.departureTime)} will be cancelled for all passengers.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #eee', background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Keep booking</button>
              <button onClick={async () => { setShowConfirm(false); await onCancel(reservation.id); }} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: '#e74c3c', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>Yes, cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReservationHistoryPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadReservations(pageNum: number, append = false) {
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      const data = await apiService.getReservations(pageNum);
      // Response is paginated: { content: [...], totalPages, ... }
      const items: Reservation[] = data.content ?? data;
      const pages: number = data.totalPages ?? 1;
      setReservations(prev => append ? [...prev, ...items] : items);
      setTotalPages(pages);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => { loadReservations(0); }, []);

  useEffect(() => {
    if (selected) {
      const updated = reservations.find(r => r.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [reservations]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCancel = async (id: string) => {
    setCancelling(true);
    try {
      const updated: Reservation = await apiService.cancelReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: updated.status } : r));
      showToast('Reservation cancelled successfully');
    } catch {
      showToast('Something went wrong. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const upcoming  = reservations.filter(r => r.status !== 'CANCELLED' && isFuture(r.departureTime));
  const past      = reservations.filter(r => r.status !== 'CANCELLED' && !isFuture(r.departureTime));
  const cancelled = reservations.filter(r => r.status === 'CANCELLED');

  return (
    <div>
      {!selected && (
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Reservation history</h1>
          <p style={{ color: '#666', fontSize: 14 }}>View and manage your flight bookings</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>⏳</p>
          <p>Loading your reservations…</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fff0f0', border: '1px solid #ffd0d0', color: '#c0392b', fontSize: 14 }}>
          {error}
        </div>
      )}

      {selected && !loading && (
        <ReservationDetail reservation={selected} onBack={() => setSelected(null)} onCancel={handleCancel} cancelling={cancelling} />
      )}

      {!selected && !loading && !error && (
        <div>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Upcoming · {upcoming.length}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcoming.map(r => <ReservationCard key={r.id} reservation={r} onClick={() => setSelected(r)} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div style={{ marginBottom: 32, opacity: 0.8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Past flights · {past.length}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {past.map(r => <ReservationCard key={r.id} reservation={r} onClick={() => setSelected(r)} />)}
              </div>
            </div>
          )}
          {cancelled.length > 0 && (
            <div style={{ marginBottom: 32, opacity: 0.6 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Cancelled · {cancelled.length}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cancelled.map(r => <ReservationCard key={r.id} reservation={r} onClick={() => setSelected(r)} />)}
              </div>
            </div>
          )}
          {page < totalPages - 1 && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button onClick={() => { const next = page + 1; setPage(next); loadReservations(next, true); }} disabled={loadingMore}
                style={{ padding: '10px 28px', borderRadius: 10, border: '1.5px solid #e5e5e5', background: 'white', cursor: loadingMore ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 14, color: '#555' }}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
          {reservations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
              <p style={{ fontSize: 48 }}>✈️</p>
              <p>No reservations found</p>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1a1a2e', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 14, zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
