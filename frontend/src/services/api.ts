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
  });

  // Check if the response is actually a success (200-299)
  if (!res.ok) {
    // This will tell you if it's a 403, 404, or 500
    throw new Error(`Server Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
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


}
export const apiService = new ApiService()