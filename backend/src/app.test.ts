import request from 'supertest'
import { createApp } from './app'

describe('App', () => {
  const app = createApp()

  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})