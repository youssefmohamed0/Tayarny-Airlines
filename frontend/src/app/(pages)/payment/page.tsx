'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/services/api'

export default function PaymentPage() {
  const router = useRouter()
  const [flight, setFlight] = useState<any>(null)
  const [fare, setFare] = useState<any>(null)
  const [travelers, setTravelers] = useState<any[]>([])
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardName, setCardName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const f = sessionStorage.getItem('selectedFlight')
    const fa = sessionStorage.getItem('selectedFare')
    const t = sessionStorage.getItem('travelers')
    if (!f || !fa || !t) { router.push('/search'); return }
    setFlight(JSON.parse(f)); setFare(JSON.parse(fa)); setTravelers(JSON.parse(t))
  }, [router])

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }
  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 6)
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }
  function validate() {
    const raw = cardNumber.replace(/\s/g, '')
    if (raw.length !== 16) return 'Card number must be 16 digits'
    if (!/^\d{2}\/\d{2,4}$/.test(cardExpiry)) return 'Expiry must be MM/YY or MM/YYYY'
    const [month] = cardExpiry.split('/').map(n => parseInt(n, 10))
    if (month < 1 || month > 12) return 'Invalid month'
    if (!cardName.trim()) return 'Cardholder name is required'
    return null
  }

  async function handlePay() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null); setLoading(true)
    try {
      const [month, year] = cardExpiry.split('/')
      const fullYear = year.length === 2 ? `20${year}` : year
      const fareClass = fare.cabinClass ?? (fare.fareName?.toUpperCase().includes('BUSINESS') ? 'BUSINESS' : 'ECONOMY')
      const payload = {
        flightNumber: flight.flightNumber, fareClass,
        travelers: travelers.map((t: any) => ({
          type: t.type, fullName: t.fullName,
          passportNumber: t.passportNumber || undefined,
          dateOfBirth: t.dateOfBirth || undefined,
          assignedSeat: t.assignedSeat,
        })),
        creditCardNumber: cardNumber.replace(/\s/g, ''),
        cardExpiryDate: `${month.padStart(2, '0')}/${fullYear}`,
      }
      const result = await apiService.checkout(payload)
      sessionStorage.setItem('confirmationData', JSON.stringify(result))
      sessionStorage.removeItem('selectedFlight'); sessionStorage.removeItem('selectedFare'); sessionStorage.removeItem('travelers')
      router.push('/confirmation')
    } catch (e: any) {
      setError(e.message || 'Payment failed. Please try again.')
    } finally { setLoading(false) }
  }

  function getCardBrand(num: string) {
    const raw = num.replace(/\s/g, '')
    if (raw.startsWith('4')) return 'VISA'
    if (raw.startsWith('5')) return 'MC'
    if (raw.startsWith('3')) return 'AMEX'
    return ''
  }

  if (!flight || !fare) return null
  const brand = getCardBrand(cardNumber)

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4fb', fontFamily: 'inherit' }}>
      {/* Top bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8e8f0', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#4B3BF5', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: 600 }}>
            ← Back
          </button>
          <div style={{ height: 20, width: 1, background: '#e8e8f0' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>Payment</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Secure Payment</h1>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Your data is protected with 256-bit SSL encryption 🔒</p>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Left: Card form */}
          <div style={{ flex: 1, minWidth: 300 }}>

            {/* Card visual */}
            <div style={{
              background: 'linear-gradient(135deg, #4B3BF5 0%, #7c3aed 100%)',
              borderRadius: 16, padding: '1.5rem', marginBottom: 20, color: 'white',
              minHeight: 150, boxShadow: '0 8px 28px rgba(75,59,245,0.35)', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <p style={{ fontSize: 11, opacity: 0.7, margin: '0 0 18px', letterSpacing: '0.12em', fontWeight: 600 }}>TAYARNY-AIRLINES</p>
              <p style={{ fontSize: 20, letterSpacing: '0.18em', margin: '0 0 20px', fontFamily: 'monospace', fontWeight: 300 }}>
                {cardNumber || '•••• •••• •••• ••••'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <p style={{ fontSize: 9, opacity: 0.6, margin: '0 0 2px', letterSpacing: '0.1em' }}>CARD HOLDER</p>
                  <p style={{ fontSize: 13, margin: 0, fontWeight: 600 }}>{cardName.toUpperCase() || 'YOUR NAME'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 9, opacity: 0.6, margin: '0 0 2px', letterSpacing: '0.1em' }}>EXPIRES</p>
                    <p style={{ fontSize: 13, margin: 0, fontWeight: 600 }}>{cardExpiry || 'MM/YY'}</p>
                  </div>
                  {brand && <p style={{ fontSize: 14, fontWeight: 800, margin: 0, alignSelf: 'flex-end' }}>{brand}</p>}
                </div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 14, border: '1px solid #e8e8f0', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 18 }}>Card Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="field-label">Card number</label>
                  <input value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    className="input" style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label className="field-label">Expiry date</label>
                    <input value={cardExpiry}
                      onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YYYY"
                      className="input" style={{ fontFamily: 'monospace' }} />
                  </div>
                </div>
                <div>
                  <label className="field-label">Cardholder name</label>
                  <input value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="input" />
                </div>
              </div>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 14 }}>
                {error}
              </div>
            )}

            <button onClick={handlePay} disabled={loading} style={{
              width: '100%', padding: '15px', borderRadius: 10, border: 'none',
              background: loading ? '#a5b4fc' : '#4B3BF5', color: 'white',
              fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 14px rgba(75,59,245,0.35)',
            }}>
              {loading ? 'Processing…' : `Pay $${fare.totalPrice?.toLocaleString()}`}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 10 }}>🔒 Secure payment · 256-bit SSL encryption</p>
          </div>

          {/* Right: Order summary */}
          <div style={{ minWidth: 280, maxWidth: 340 }}>
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e8e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0', background: '#fafafc' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Order Summary</h3>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ padding: '12px', borderRadius: 10, background: '#f4f4fb', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px', color: '#111827' }}>
                    {flight.flightNumber} · {fare.fareName}
                  </p>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 2px' }}>
                    {flight.departure?.airport} → {flight.arrival?.airport}
                  </p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                    {flight.departure?.time ? new Date(flight.departure.time).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : ''}
                  </p>
                </div>

                <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Passengers</p>
                {travelers.map((t: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{t.fullName || `${t.type} ${i + 1}`}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 6 }}>· Seat {t.assignedSeat}</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#4B3BF5', fontWeight: 700, padding: '2px 8px', background: '#eeeaff', borderRadius: 20 }}>{t.type}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginTop: 4, borderTop: '2px solid #f0f0f0' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Total</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#4B3BF5' }}>${fare.totalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
