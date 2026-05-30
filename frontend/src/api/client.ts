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
  // 204 No Content
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string): Promise<T> =>
    fetch(path).then(r => handleResponse<T>(r)),

  post: <T>(path: string, body: unknown): Promise<T> =>
    fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(r => handleResponse<T>(r)),

  put: <T>(path: string, body: unknown): Promise<T> =>
    fetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(r => handleResponse<T>(r)),

  delete: <T>(path: string): Promise<T> =>
    fetch(path, { method: 'DELETE' }).then(r => handleResponse<T>(r)),
}