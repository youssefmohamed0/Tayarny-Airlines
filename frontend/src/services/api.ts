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

    if (!res.ok) {
      throw new Error(`Server Error: ${res.status} ${res.statusText}`)
    }

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
  async getUsers() {
  const headers = await this.#getHeaders()
  return await fetch(this.#baseUrl + '/api/admin/users', {
    headers,
  }).then(res => res.json())
}

async deleteUser(userId: string) {
  const headers = await this.#getHeaders()
  return await fetch(this.#baseUrl + '/api/admin/users/' + userId, {
    method: 'DELETE',
    headers,
  }).then(res => res.ok)
}

  // ── User Profile ────────────────────────────────────

  /**
   * Fetches the current user's profile data
   * GET /api/user
   */
  async getProfile() {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/user`, {
      method: 'GET',
      headers,
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch profile: ${res.status}`)
    }

    return res.json()
  }

  /**
   * Updates the user's profile (requires password for verification)
   * PUT /api/user
   */
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

  // ── Reservations ────────────────────────────────────

  /**
   * Fetches all reservations for the current user
   * GET /api/user/reservation
   */
async getReservations() {
  const session = await getSession()
  console.log('FULL SESSION:', JSON.stringify(session))
  const headers = await this.#getHeaders()
  console.log('AUTH HEADER:', headers['Authorization'])
  
  const res = await fetch(`${this.#baseUrl}/api/user/reservations`, {
    method: 'GET',
    headers,
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch reservations: ${res.status}`)
  }

  return res.json()
}

  /**
   * Fetches a single reservation by ID
   * GET /api/user/reservation/:id
   */
  async getReservation(id: string) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/user/reservations/${id}`, {
      method: 'GET',
      headers,
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch reservation: ${res.status}`)
    }

    return res.json()
  }

  /**
   * Fetches all tickets for a reservation
   * GET /api/user/reservation/:id/tickets
   */
  async getReservationTickets(id: string) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/user/reservations/${id}/tickets`, {
      method: 'GET',
      headers,
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch tickets: ${res.status}`)
    }

    return res.json()
  }

  /**
   * Cancels a reservation by ID
   * PUT /api/user/reservation/:id/cancel
   */
  async cancelReservation(id: string) {
    const headers = await this.#getHeaders()
    const res = await fetch(`${this.#baseUrl}/api/user/reservation/${id}/cancel`, {
      method: 'PUT',
      headers,
    })

    if (!res.ok) {
      throw new Error(`Failed to cancel reservation: ${res.status}`)
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

async addFlight(flight: any) {
  const headers = await this.#getHeaders()
  // Ensure we aren't sending an empty flightId for a new flight
  const { flightId, ...payload } = flight;

  const res = await fetch(this.#baseUrl + '/api/admin/flight', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Add Flight Failed: ${res.status} - ${errorBody}`);
  }
  return res.json()
}

async modifyFlight(flightId: string, flight: any) {
  const headers = await this.#getHeaders()
  // Fixed the '&' to '?' in the URL below
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

async deleteFlight(flightId: string) {
  const headers = await this.#getHeaders()
  return await fetch(this.#baseUrl + '/api/admin/flight?flightId=' + flightId, {
    method: 'DELETE',
    headers,
  }).then(res => res.ok)
}
  
}

export const apiService = new ApiService()