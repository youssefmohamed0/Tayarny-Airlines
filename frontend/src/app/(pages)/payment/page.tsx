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
  }, [router])

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(val: string) {
    // Allows up to 6 digits (2 for month, 4 for year)
    const digits = val.replace(/\D/g, '').slice(0, 6)
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    return digits
  }

  function validate() {
    const raw = cardNumber.replace(/\s/g, '')
    if (raw.length !== 16) return 'Card number must be 16 digits'
    
    // Check format MM/YY or MM/YYYY
    if (!/^\d{2}\/\d{2,4}$/.test(cardExpiry)) return 'Expiry must be MM/YY or MM/YYYY'
    
    const [month, year] = cardExpiry.split('/').map(n => parseInt(n, 10))
    if (month < 1 || month > 12) return 'Invalid month'
    
    if (!cardName.trim()) return 'Cardholder name is required'
    return null
  }

  async function handlePay() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setLoading(true)

    try {
      // 1. Extract parts
      const [month, year] = cardExpiry.split('/')
      
      // 2. Normalize Year to 4 digits (converts '26' to '2026')
      const fullYear = year.length === 2 ? `20${year}` : year
      
      // 3. Final format for backend: "MM/YYYY" (e.g., "12/2026")
      const backendExpiry = `${month.padStart(2, '0')}/${fullYear}`

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
        cardExpiryDate: backendExpiry, 
      }

      const result = await apiService.checkout(payload)
      sessionStorage.setItem('confirmationData', JSON.stringify(result))
      
      // Clear session after success
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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <button onClick={() => router.back()}
        style={{ background: 'none', border: 'none', color: '#378ADD', cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>
        ← Back to passengers
      </button>

      <h1 style={{ fontSize: 28, marginBottom: 24, color: '#1a1a2e' }}>Payment</h1>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 20, color: '#1a1a2e' }}>💳 Card details</h3>

            {/* Credit Card UI Preview */}
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
                  <p style={{ fontSize: 13, margin: 0 }}>{cardName.toUpperCase() || 'YOUR NAME'}</p>
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
                <label style={{ fontSize: 11, color: '#999', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Card number</label>
                <input value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #e5e5e5', fontSize: 16, fontFamily: 'monospace', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: '#999', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Expiry date</label>
                  <input value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #e5e5e5', fontSize: 15, fontFamily: 'monospace', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: '#999', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Cardholder name</label>
                <input value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  placeholder="John Doe"
                  style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #e5e5e5', fontSize: 15, boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px', borderRadius: 10, background: '#fff0f0', border: '1px solid #ffd0d0', color: '#c0392b', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button onClick={handlePay} disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: 12, border: 'none',
              background: loading ? '#aaa' : '#1a1a2e', color: 'white',
              fontSize: 17, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
            }}>
            {loading ? 'Processing…' : `Pay $${fare.totalPrice?.toLocaleString()}`}
          </button>
        </div>

        <div style={{ minWidth: 280, maxWidth: 340 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontSize: 16, marginBottom: 16, color: '#1a1a2e' }}>Order summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '2px solid #f0f0f0' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#378ADD' }}>${fare.totalPrice?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}