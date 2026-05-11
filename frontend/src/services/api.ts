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

    if (!res.ok) {
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

  // ── User Profile ────────────────────────────────────

  /**
   * Fetches the current user's profile data
   * GET /api/user
   */
  async getProfile() {
    const headers = await this.#getHeaders();
    const res = await fetch(`${this.#baseUrl}/api/user`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch profile: ${res.status}`);
    }

    return res.json();
  }

  /**
   * Updates the user's profile (requires password for verification)
   * PUT /api/user
   */
async updateProfile(userData: { fullName: string; email: string; password?: string }) {
  const headers = await this.#getHeaders();
  
  // Create the body. If password is empty string, we can choose to omit it or send it as is
  const body = { ...userData };
  if (!body.password) delete body.password; 

  const res = await fetch(`${this.#baseUrl}/api/user`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || 'Update failed');
  }
  return res.json();
}
}

export const apiService = new ApiService()