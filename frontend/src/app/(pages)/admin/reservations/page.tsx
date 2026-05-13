'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiService } from '@/services/api'

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

  // Load reservations
  useEffect(() => {
    loadReservations()
  }, [page, username])

  // Reset page when username changes
  useEffect(() => {
    setPage(0)
  }, [username])

  async function loadReservations() {
    setLoading(true)
    try {
      const data = await apiService.getReservations(
        page,
        20,
        username || undefined
      )

      const filtered = (data?.content ?? []).filter(
  (r: any) => r.status === 'COMPLETED' || r.status === 'CONFIRMED'
)

setReservations(filtered)
      setTotalPages(data?.totalPages ?? 0)
    } catch (e: any) {
      setError(e.message || 'Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelReservation(reservationId: string) {
    if (!confirm('Cancel this reservation?')) return

    setCancelling(reservationId)

    try {
      await apiService.cancelReservationAdmin(reservationId)

      setReservations(prev =>
        prev.map(r =>
          r.id === reservationId
            ? { ...r, status: 'CANCELLED' }
            : r
        )
      )
    } catch (e: any) {
      alert(e.message || 'Failed to cancel reservation')
    } finally {
      setCancelling(null)
    }
  }

  const statusColor = (s: string) =>
    s === 'CANCELLED'
      ? '#e74c3c'
      : s === 'CONFIRMED'
      ? '#2ecc71'
      : '#378ADD'

  return (
    <div>
      <button
        onClick={() => router.back()}
        style={{
          marginBottom: 20,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#378ADD',
          fontSize: 15,
          fontFamily: 'inherit'
        }}
      >
        ← Back to Admin
      </button>

      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Reservations</h1>

      <p style={{ color: '#666', marginBottom: 28 }}>
        {username
          ? `Showing reservations for @${username}`
          : 'All reservations'}
      </p>

      {loading ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '3rem' }}>
          Loading...
        </p>
      ) : error ? (
        <div
          style={{
            background: '#fff0f0',
            border: '1px solid #e74c3c',
            borderRadius: 12,
            padding: '2rem',
            color: '#e74c3c'
          }}
        >
          ⚠️ {error}
        </div>
      ) : reservations.length === 0 ? (
        <p
          style={{
            color: '#999',
            textAlign: 'center',
            padding: '3rem'
          }}
        >
          No reservations found.
        </p>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginBottom: 24
            }}
          >
            {reservations.map(res => (
              <div
                key={res.id}
                onClick={() =>
                  router.push(`/admin/reservation/${res.id}`)
                }
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '1.2rem 1.5rem',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1.5px solid #e0e0e0'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 4
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: 15,
                        color: '#1a1a2e'
                      }}
                    >
                      {res.flightNumber} · {res.originCity} →{' '}
                      {res.destinationCity}
                    </p>

                    <span
                      style={{
                        fontSize: 11,
                        padding: '3px 8px',
                        borderRadius: 20,
                        background: statusColor(res.status),
                        color: 'white',
                        fontWeight: 700
                      }}
                    >
                      {res.status}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: '#666'
                    }}
                  >
                    {res.fullName} · {res.email} · {res.numSeats}{' '}
                    seat(s) · ${res.totalPrice} ·{' '}
                    {new Date(res.departureTime).toLocaleDateString()}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: '#999',
                      marginTop: 2,
                      fontFamily: 'monospace'
                    }}
                  >
                    {res.id}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {/* CANCEL BUTTON */}
                  {res.status !== 'CANCELLED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelReservation(res.id)
                      }}
                      disabled={cancelling === res.id}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: 'none',
                        background:
                          cancelling === res.id ? '#999' : '#e74c3c',
                        color: 'white',
                        cursor:
                          cancelling === res.id
                            ? 'not-allowed'
                            : 'pointer',
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      {cancelling === res.id
                        ? 'Cancelling...'
                        : 'Cancel'}
                    </button>
                  )}

                  <span style={{ color: '#378ADD', fontSize: 18 }}>
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {!username && totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  background: 'white',
                  cursor:
                    page === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                ← Prev
              </button>

              <span
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  color: '#666'
                }}
              >
                Page {page + 1} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setPage(p =>
                    Math.min(totalPages - 1, p + 1)
                  )
                }
                disabled={page === totalPages - 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  background: 'white',
                  cursor:
                    page === totalPages - 1
                      ? 'not-allowed'
                      : 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}