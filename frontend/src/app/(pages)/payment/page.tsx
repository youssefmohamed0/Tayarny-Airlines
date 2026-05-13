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
    setFlight(JSON.parse(f))
    setFare(JSON.parse(fa))
    setTravelers(JSON.parse(t))
  }, [])

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  function validate() {
    const raw = cardNumber.replace(/\s/g, '')
    if (raw.length !== 16) return 'Card number must be 16 digits'
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) return 'Expiry must be MM/YY'
    if (!cardName.trim()) return 'Cardholder name is required'
    return null
  }

  async function handlePay() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setLoading(true)

    try {
      const payload = {
        flightNumber: flight.flightNumber,
        fareClass: fare.fareName,
        travelers: travelers.map((t: any) => ({
          type: t.type,
          fullName: t.fullName,
          passportNumber: t.passportNumber || undefined,
          dateOfBirth: t.dateOfBirth || undefined,
          assignedSeat: t.assignedSeat,
        })),
        creditCardNumber: cardNumber.replace(/\s/g, ''),
        cardExpiryDate: cardExpiry,
      }

      const result = await apiService.checkout(payload)
      sessionStorage.setItem('confirmationData', JSON.stringify(result))
      sessionStorage.removeItem('selectedFlight')
      sessionStorage.removeItem('selectedFare')
      sessionStorage.removeItem('travelers')
      router.push('/confirmation')
    } catch (e: any) {
      setError(e.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function getCardBrand(num: string) {
    const raw = num.replace(/\s/g, '')
    if (raw.startsWith('4')) return 'Visa'
    if (raw.startsWith('5')) return 'Mastercard'
    if (raw.startsWith('3')) return 'Amex'
    return ''
  }

  if (!flight || !fare) return null

  const brand = getCardBrand(cardNumber)

  return (
    <div>
      <button onClick={() => router.back()}
        style={{ background: 'none', border: 'none', color: '#378ADD', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', marginBottom: 16, padding: 0 }}>
        ← Back to passengers
      </button>

      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Payment</h1>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Left: Card form */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 20, color: '#1a1a2e' }}>💳 Card details</h3>

            {/* Card preview */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #378ADD 100%)',
              borderRadius: 16, padding: '1.5rem', marginBottom: 24, color: 'white',
              minHeight: 140, position: 'relative', boxShadow: '0 8px 24px rgba(55,138,221,0.3)'
            }}>
              <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 20px', letterSpacing: '0.1em' }}>TAYARNY AIRLINES</p>
              <p style={{ fontSize: 20, letterSpacing: '0.15em', margin: '0 0 20px', fontFamily: 'monospace' }}>
                {cardNumber || '•••• •••• •••• ••••'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <p style={{ fontSize: 10, opacity: 0.6, margin: '0 0 2px', letterSpacing: '0.08em' }}>CARD HOLDER</p>
                  <p style={{ fontSize: 13, margin: 0 }}>{cardName || 'YOUR NAME'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, opacity: 0.6, margin: '0 0 2px', letterSpacing: '0.08em' }}>EXPIRES</p>
                  <p style={{ fontSize: 13, margin: 0 }}>{cardExpiry || 'MM/YY'}</p>
                </div>
                {brand && <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{brand}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Card number</label>
                <input value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e5e5', fontSize: 16, outline: 'none', fontFamily: 'monospace', letterSpacing: '0.1em', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expiry date</label>
                  <input value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e5e5', fontSize: 15, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cardholder name</label>
                <input value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  placeholder="Name as on card"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e5e5', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: '#fff0f0', border: '1px solid #ffd0d0', color: '#c0392b', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button onClick={handlePay} disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: 12, border: 'none',
              background: loading ? '#aaa' : '#1a1a2e', color: 'white',
              fontSize: 17, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s'
            }}>
            {loading ? 'Processing…' : `Pay $${fare.totalPrice?.toLocaleString()}`}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 12 }}>
            🔒 Secure payment · Your data is encrypted
          </p>
        </div>

        {/* Right: Order summary */}
        <div style={{ minWidth: 280, maxWidth: 340 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontSize: 16, marginBottom: 16, color: '#1a1a2e' }}>Order summary</h3>

            <div style={{ padding: '12px', borderRadius: 10, background: '#f8f9ff', marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px', color: '#1a1a2e' }}>
                {flight.flightNumber} · {fare.fareName}
              </p>
              <p style={{ fontSize: 13, color: '#666', margin: '0 0 2px' }}>
                {flight.departure.airport} → {flight.arrival.airport}
              </p>
              <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
                {new Date(flight.departure.time).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Passengers</p>
              {travelers.map((t: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ fontSize: 13, color: '#555' }}>
                    {t.fullName || `${t.type} ${i + 1}`} · {t.assignedSeat}
                  </span>
                  <span style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 500 }}>
                    ${fare.priceBreakdown?.[t.type.toLowerCase()]?.farePerPassenger?.toLocaleString() ?? '—'}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '2px solid #f0f0f0' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#378ADD' }}>${fare.totalPrice?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
