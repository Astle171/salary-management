// In dev: VITE_API_URL is undefined → uses Vite proxy → relative path ''
// In prod: VITE_API_URL = 'https://your-app.railway.app'
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new ApiError(response.status, body.error ?? response.statusText)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string): Promise<T> =>
    fetch(`${BASE_URL}${path}`).then(r => handleResponse<T>(r)),

  post: <T>(path: string, body: unknown): Promise<T> =>
    fetch(`${BASE_URL}${path}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }).then(r => handleResponse<T>(r)),

  put: <T>(path: string, body: unknown): Promise<T> =>
    fetch(`${BASE_URL}${path}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }).then(r => handleResponse<T>(r)),

  delete: <T>(path: string): Promise<T> =>
    fetch(`${BASE_URL}${path}`, { method: 'DELETE' })
      .then(r => handleResponse<T>(r)),
}