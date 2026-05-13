'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiService } from '@/services/api'

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

export default function UserReservationsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const username = searchParams.get('username')

  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => { loadReservations() }, [page, username])
  useEffect(() => { setPage(0) }, [username])

  async function loadReservations() {
    setLoading(true)
    try {
      const data = await apiService.getReservations(page, 20, username || undefined)
      // Showing all results including CANCELLED for admin audit
      setReservations(data?.content ?? [])
      setTotalPages(data?.totalPages ?? 0)
    } catch (e: any) {
      setError(e.message || 'Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelReservation(reservationId: string) {
    if (!confirm('Are you sure you want to cancel this booking? This action is permanent.')) return
    setCancelling(reservationId)
    try {
      await apiService.cancelReservationAdmin(reservationId)
      setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status: 'CANCELLED' } : r))
    } catch (e: any) {
      alert(e.message || 'Failed to cancel reservation')
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            {username ? `Bookings for @${username}` : 'All Reservations'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>System-wide booking management and audit trail.</p>
        </div>
        <button onClick={() => router.push('/admin')} style={{
          padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e8e8f0', background: 'white',
          color: '#4b5563', fontSize: 14, fontWeight: 600, cursor: 'pointer'
        }}>← Back to Admin Dashboard</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
          <p>Fetching reservation data…</p>
        </div>
      ) : error ? (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '2rem', color: '#991b1b', textAlign: 'center' }}>
          <p style={{ fontSize: 24, marginBottom: 12 }}>⚠️</p>
          <p>{error}</p>
        </div>
      ) : reservations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 16, border: '1px solid #e8e8f0' }}>
          <p style={{ fontSize: 32, marginBottom: 16 }}>📋</p>
          <p style={{ color: '#6b7280' }}>No reservations found.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {reservations.map(res => (
              <div key={res.id} onClick={() => router.push(`/admin/reservation/${res.id}`)}
                className="card card-hover"
                style={{ background: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>{res.flightNumber}</span>
                    <span style={{ fontSize: 14, color: '#4b5563', fontWeight: 500 }}>{res.originCity} → {res.destinationCity}</span>
                    <StatusBadge status={res.status} />
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    <strong style={{ color: '#374151' }}>{res.fullName}</strong> • @{res.username} • {res.numSeats} seats • <span style={{ color: '#10b981', fontWeight: 700 }}>${res.totalPrice.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, fontFamily: 'monospace' }}>ID: {res.id}</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {res.status !== 'CANCELLED' && (
                    <button onClick={(e) => { e.stopPropagation(); handleCancelReservation(res.id); }}
                      disabled={cancelling === res.id}
                      style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #fee2e2', background: 'white', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: cancelling === res.id ? 'not-allowed' : 'pointer' }}>
                      {cancelling === res.id ? '...' : 'Cancel'}
                    </button>
                  )}
                  <span style={{ color: '#4B3BF5', fontSize: 20 }}>→</span>
                </div>
              </div>
            ))}
          </div>

          {!username && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e8e8f0', background: 'white', cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 }}>
                ← Previous
              </button>
              <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e8e8f0', background: 'white', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}