import { getSession } from 'next-auth/react'

class ApiService {
  #baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090'

  async #getHeaders() {
    const session = await getSession()
    const token = session?.user?.accessToken ?? ''
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  // ── Auth ──────────────────────────────────────────

  async login(username: string, password: string) {
    return await fetch(this.#baseUrl + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(res => res.json())
  }

  async signup(username: string, password: string, fullName: string, email: string) {
    const res = await fetch(this.#baseUrl + '/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, fullName, email }),
    })
    if (!res.ok) throw new Error(`Server Error: ${res.status} ${res.statusText}`)
    return res.json()
  }

  async logout() {
    const headers = await this.#getHeaders()
    return await fetch(this.#baseUrl + '/api/auth/logout', {
      method: 'POST',
      headers,
    }).then(res => res.json())
  }

  async refresh(refreshToken: string) {
    return await fetch(this.#baseUrl + '/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).then(res => res.json())
  }

  // ── User Profile ────────────────────────────────────

  async getProfile() {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/user`, { method: 'GET', headers })
    if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`)
    return res.json()
  }

  async updateProfile(userData: { fullName: string; email: string; password?: string }) {
    const headers = await this.#getHeaders()
    const body = { ...userData }
    if (!body.password) delete body.password
    const res = await fetch(`${this.#baseUrl}/api/user`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const errorMsg = await res.text()
      throw new Error(errorMsg || 'Update failed')
    }
    return res.json()
  }

  // ── Admin ────────────────────────────────────────────

  async getUsers() {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/admin/users`, { method: 'GET', headers })
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`)
    return res.json()
  }

  async deleteUser(userId: string) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/admin/users/${userId}`, { method: 'DELETE', headers })
    return res.ok
  }

  async cancelTicket(ticketId: string) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/admin/tickets/${ticketId}/cancel`, { method: 'PUT', headers })
    if (!res.ok) throw new Error(`Failed to cancel ticket: ${res.status}`)
    return res.json()
  }

  // ── Airports ────────────────────────────────────────

  async searchAirports(keyword: string) {
    const res = await fetch(
      `${this.#baseUrl}/api/user/airports?keyword=${encodeURIComponent(keyword)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    )
    if (!res.ok) throw new Error(`Failed to search airports: ${res.status}`)
    return res.json()
  }

  // ── Flights ─────────────────────────────────────────

  // GET /api/flights with query params (GET with body is blocked by browsers)
// ── Updated Flights Service ─────────────────────────

async searchFlights(params: {
  origin: string
  destination: string
  departureDate: string
  travelers: { adults: number; children: number }
  cabinClass: string
}) {
  const headers = await this.#getHeaders()
  
  const res = await fetch(`${this.#baseUrl}/api/flights`, {
    method: 'POST', // Changed from GET to POST to allow a body
    headers,
    body: JSON.stringify(params), // This sends the { "origin": "LHR", ... } object
  })

  if (!res.ok) throw new Error(`Failed to search flights: ${res.status}`)
  return res.json()
}

  // ── Seats ───────────────────────────────────────────

  async getSeatsByFlight(flightId: string) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/user/seats/flight/${flightId}`, { method: 'GET', headers })
    if (!res.ok) throw new Error(`Failed to fetch seats: ${res.status}`)
    return res.json()
  }

  async getSeatsByModel(modelId: string) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/user/seats/model/${modelId}`, { method: 'GET', headers })
    if (!res.ok) throw new Error(`Failed to fetch seats: ${res.status}`)
    return res.json()
  }

  // ── Checkout ────────────────────────────────────────

  // POST /api/checkout — no priceToken needed
  async checkout(payload: {
    flightNumber: string
    fareClass: string
    travelers: {
      type: string
      fullName: string
      passportNumber?: string
      dateOfBirth?: string
      assignedSeat: string
    }[]
    creditCardNumber: string
    cardExpiryDate: string
  }) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || `Checkout failed: ${res.status}`)
    }
    return res.json()
  }

  // ── Reservations ────────────────────────────────────

  // GET /api/user/reservations?page=0&size=10 — paginated response
  async getReservations(page = 0, size = 10) {
    const headers = await this.#getHeaders()
    const res = await fetch(
      `${this.#baseUrl}/api/user/reservations?page=${page}&size=${size}`,
      { method: 'GET', headers }
    )
    if (!res.ok) throw new Error(`Failed to fetch reservations: ${res.status}`)
    return res.json()
  }

  async getReservation(id: string) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/user/reservations/${id}`, { method: 'GET', headers })
    if (!res.ok) throw new Error(`Failed to fetch reservation: ${res.status}`)
    return res.json()
  }

  async getReservationTickets(id: string) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/user/reservations/${id}/tickets`, { method: 'GET', headers })
    if (!res.ok) throw new Error(`Failed to fetch tickets: ${res.status}`)
    return res.json()
  }

  async cancelReservation(id: string) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/user/reservation/${id}/cancel`, { method: 'PUT', headers })
    if (!res.ok) throw new Error(`Failed to cancel reservation: ${res.status}`)
    return res.json()
  }
}

export const apiService = new ApiService()