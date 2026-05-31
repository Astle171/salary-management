import { PrismaEmployeeRepository } from './prisma-employee.repository'
import { prisma } from '../../lib/prisma'

describe('PrismaEmployeeRepository', () => {
  let repo: PrismaEmployeeRepository

  beforeAll(async () => {
    repo = new PrismaEmployeeRepository()
    await prisma.employee.deleteMany()
  })

  afterEach(async () => {
    await prisma.employee.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('find with search', () => {
    it('should successfully search employees by full_name case-insensitively', async () => {
      await prisma.employee.create({
        data: {
          full_name: 'Shiva Kumar',
          job_title: 'Engineer',
          department: 'Engineering',
          country: 'India',
          salary: 60000,
        },
      })

      // Search using uppercase 'S' which was failing in production
      const result = await repo.find({ search: 'S', country: 'India' })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].full_name).toBe('Shiva Kumar')
    })
  })
})
