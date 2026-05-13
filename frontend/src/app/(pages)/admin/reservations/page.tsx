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
  const usernameParam = searchParams.get('username')

  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState(usernameParam || '')

  useEffect(() => { loadReservations() }, [page, usernameParam])
  useEffect(() => { setPage(0) }, [usernameParam])

  async function loadReservations() {
    setLoading(true)
    try {
      const data = await apiService.getReservations(page, 20, usernameParam || undefined)
      setReservations(data?.content ?? [])
      setTotalPages(data?.totalPages ?? 0)
    } catch (e: any) {
      setError(e.message || 'Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch() {
    if (searchQuery.trim()) {
      router.push(`/admin/reservations?username=${searchQuery.trim()}`)
    } else {
      router.push('/admin/reservations')
    }
  }

  async function handleCancelReservation() {
    if (!cancellingId) return
    setIsProcessing(true)
    try {
      await apiService.cancelReservationAdmin(cancellingId)
      setReservations(prev => prev.map(r => r.id === cancellingId ? { ...r, status: 'CANCELLED' } : r))
      setCancellingId(null)
    } catch (e: any) {
      alert(e.message || 'Failed to cancel reservation')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: '0 0 6px', letterSpacing: '-0.8px' }}>
            {usernameParam ? `Bookings for @${usernameParam}` : 'Global Reservations'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: 16, margin: 0 }}>Review, audit, and manage flight bookings.</p>
        </div>
        <button onClick={() => router.push('/admin')} className="btn btn-outline btn-sm">
          ← Back to Dashboard
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem', border: '1px solid #e8e8f0', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 20 }}>👤</div>
        <input 
          placeholder="Filter by customer username..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="input"
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 0', fontSize: 16 }}
        />
        <button onClick={handleSearch} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 10 }}>
          {usernameParam ? 'Update Filter' : 'Filter Bookings'}
        </button>
        {usernameParam && (
          <button onClick={() => { setSearchQuery(''); router.push('/admin/reservations'); }} className="btn btn-ghost" style={{ padding: '10px 16px', borderRadius: 10 }}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#9ca3af' }}>
          <p>Scanning reservation records…</p>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', borderColor: '#fca5a5', background: '#fee2e2' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
          <p style={{ color: '#991b1b', fontWeight: 600 }}>{error}</p>
        </div>
      ) : reservations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: 20, border: '1px solid #e8e8f0' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📋</p>
          <p style={{ color: '#6b7280', fontSize: 16 }}>No matching reservations found.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {reservations.map(res => (
              <div key={res.id} onClick={() => router.push(`/admin/reservation/${res.id}`)}
                className="card card-hover"
                style={{ background: 'white', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 17, color: '#111827' }}>{res.flightNumber}</span>
                    <span style={{ fontSize: 15, color: '#4b5563', fontWeight: 500 }}>{res.originCity} → {res.destinationCity}</span>
                    <StatusBadge status={res.status} />
                  </div>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>
                    <strong style={{ color: '#374151' }}>{res.fullName}</strong> • @{res.username} • {res.numSeats} passengers • <span style={{ color: '#10b981', fontWeight: 700 }}>${res.totalPrice.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                    📅 {new Date(res.departureTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • ID: {res.id}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  {res.status !== 'CANCELLED' && (
                    <button onClick={(e) => { e.stopPropagation(); setCancellingId(res.id); }}
                      className="btn btn-ghost btn-sm" style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
                      Cancel
                    </button>
                  )}
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f4f4fb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B3BF5', fontSize: 14 }}>
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!usernameParam && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 16 }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="btn btn-outline btn-sm" style={{ borderRadius: 10 }}>
                ← Prev
              </button>
              <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 600 }}>Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                className="btn btn-outline btn-sm" style={{ borderRadius: 10 }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Custom Confirmation Modal */}
      {cancellingId && (
        <div className="modal-overlay" onClick={() => setCancellingId(null)}>
          <div className="modal-content animate-in" style={{ maxWidth: 420, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>⚠️</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>Cancel Booking?</h3>
            <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px' }}>
              Are you sure you want to cancel this flight reservation? This will release all seats and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setCancellingId(null)} className="btn btn-outline" style={{ flex: 1 }}>Keep Booking</button>
              <button onClick={handleCancelReservation} disabled={isProcessing} className="btn btn-danger" style={{ flex: 1 }}>
                {isProcessing ? 'Processing...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}