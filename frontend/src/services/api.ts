import { getSession } from 'next-auth/react'

class ApiService {
  #baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090'

  async #getHeaders() {
    const session = await getSession()
    const token = (session as any)?.user?.accessToken ?? ''
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

  async addFlight(flight: any) {
    const headers = await this.#getHeaders()
    const res = await fetch(this.#baseUrl + '/api/admin/flight', {
      method: 'POST',
      headers,
      body: JSON.stringify(flight),
    })
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Add Flight Failed: ${res.status} - ${errorBody}`);
    }
    return res.json()
  }

  async modifyFlight(flightId: string, flight: any) {
    const headers = await this.#getHeaders()
    const res = await fetch(this.#baseUrl + '/api/admin/flight?flightId=' + flightId, {
      method: 'PUT',
      headers,
      body: JSON.stringify(flight),
    })
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Modify Flight Failed: ${res.status} - ${errorBody}`);
    }
    return res.json()
  }

  async getSingleFlight(flightNumber?: string) {
    const headers = await this.#getHeaders()
    const params = flightNumber ? `?flightNumber=${flightNumber}` : ''
    return await fetch(this.#baseUrl + '/api/admin/flight' + params, {
      headers,
    }).then(res => res.json())
  }

  async deleteFlight(flightId: string) {
    const headers = await this.#getHeaders()
    return await fetch(this.#baseUrl + '/api/admin/flight?flightId=' + flightId, {
      method: 'DELETE',
      headers,
    }).then(res => res.ok)
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

  async searchFlights(params: {
    origin: string
    destination: string
    departureDate: string
    travelers: { adults: number; children: number }
    cabinClass: string
  }) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/flights`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
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



  // ── Checkout ────────────────────────────────────────

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
    priceToken?: string // Made optional here
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

async getUserReservations(page = 0, size = 10) {
  const headers = await this.#getHeaders()
  const url = `${this.#baseUrl}/api/user/reservations?page=${page}&size=${size}`
  const res = await fetch(url, { method: 'GET', headers })
  if (!res.ok) throw new Error(`Failed to fetch reservations: ${res.status}`)
  return res.json()
}

async getReservations(page = 0, size = 10, username?: string) {
  const headers = await this.#getHeaders()
  let url = `${this.#baseUrl}/api/admin/reservations?page=${page}&size=${size}`
  
  if (username) {
    url += `&username=${encodeURIComponent(username)}`
  }

  const res = await fetch(url, { method: 'GET', headers })
  if (!res.ok) throw new Error(`Failed to fetch reservations: ${res.status}`)
  return res.json()
}

async getReservation(id: string) {
  const headers = await this.#getHeaders()
  const res = await fetch(`${this.#baseUrl}/api/admin/reservations/${id}`, { method: 'GET', headers })
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
    const res = await fetch(`${this.#baseUrl}/api/user/reservations/${id}/cancel`, { method: 'PUT', headers })
    if (!res.ok) throw new Error(`Failed to cancel reservation: ${res.status}`)
    return res.json()
  }

  async getTicket(ticketId: string) {
  const headers = await this.#getHeaders()
  const res = await fetch(`${this.#baseUrl}/api/admin/tickets/${ticketId}`, { method: 'GET', headers })
  if (!res.ok) throw new Error(`Failed to fetch ticket: ${res.status}`)
  return res.json()
}

async cancelTicket(ticketId: string) {
  const headers = await this.#getHeaders()

  const res = await fetch(
    `${this.#baseUrl}/api/admin/tickets/${ticketId}/cancel`,
    {
      method: 'PUT',
      headers,
    }
  )

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || `Failed to cancel ticket: ${res.status}`)
  }

  return res.json()
}

async getAllTickets(page = 0, size = 50) {
  const headers = await this.#getHeaders()

  const res = await fetch(
    `${this.#baseUrl}/api/admin/tickets?page=${page}&size=${size}`,
    {
      method: 'GET',
      headers,
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch tickets: ${res.status}`)
  }

  return res.json()
}
async cancelReservationAdmin(reservationId: string) {
  const headers = await this.#getHeaders()

  const res = await fetch(
    `${this.#baseUrl}/api/admin/reservations/${reservationId}/cancel`,
    {
      method: 'PUT',
      headers,
    }
  )

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || `Failed to cancel reservation: ${res.status}`)
  }

  return await res.json()
}
  async getReservationTicketsAdmin(id: string) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/admin/reservations/${id}/tickets`, { method: 'GET', headers })
    if (!res.ok) throw new Error(`Failed to fetch tickets: ${res.status}`)
    return res.json()
  }
  // ── Airports ────────────────────────────────────────

async getAirports() {
  const headers = await this.#getHeaders()
  const res = await fetch(`${this.#baseUrl}/api/admin/airports`, { method: 'GET', headers })
  if (!res.ok) throw new Error('Failed to fetch airports')
  return res.json()
}

async addAirport(airport: { name: string; city: string; country: string; iataCode: string }) {
  const headers = await this.#getHeaders()
  const res = await fetch(`${this.#baseUrl}/api/admin/airports`, {
    method: 'POST',
    headers,
    body: JSON.stringify(airport),
  })
  if (!res.ok) throw new Error('Failed to create airport')
  return res.json()
}

async deleteAirport(id: string) {
  const headers = await this.#getHeaders()
  const res = await fetch(`${this.#baseUrl}/api/admin/airports/${id}`, { method: 'DELETE', headers })
  return res.ok
}

// ── Airplanes & Models ──────────────────────────────


async getAirplanes() {
  const headers = await this.#getHeaders()
  const res = await fetch(`${this.#baseUrl}/api/admin/airplanes`, { method: 'GET', headers })
  if (!res.ok) throw new Error('Failed to fetch airplanes')
  return res.json()
}

async addAirplane(airplane: { modelId: string; condition: string; numberOfFlights: number }) {
  const headers = await this.#getHeaders()
  const res = await fetch(`${this.#baseUrl}/api/admin/airplanes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(airplane),
  })
  if (!res.ok) throw new Error('Failed to create airplane')
  return res.json()
}

async deleteAirplane(id: string) {
  const headers = await this.#getHeaders()
  const res = await fetch(`${this.#baseUrl}/api/admin/airplanes/${id}`, { method: 'DELETE', headers })
  return res.ok
}
}


export const apiService = new ApiService()