import { PrismaInsightsRepository } from './prisma-insights.repository'
import { prisma } from '../../lib/prisma'

describe('PrismaInsightsRepository', () => {
  let repo: PrismaInsightsRepository

  beforeAll(async () => {
    repo = new PrismaInsightsRepository()
    await prisma.employee.deleteMany()
  })

  afterEach(async () => {
    await prisma.employee.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('getCountryStats', () => {
    it('should return country stats for an existing country', async () => {
      await prisma.employee.createMany({
        data: [
          { full_name: 'Alice', job_title: 'Engineer', department: 'Engineering', country: 'USA', salary: 100000 },
          { full_name: 'Bob',   job_title: 'Engineer', department: 'Engineering', country: 'USA', salary: 150000 },
          { full_name: 'Charlie', job_title: 'Manager', department: 'HR', country: 'USA', salary: 80000 },
          { full_name: 'Dave',  job_title: 'Engineer', department: 'Engineering', country: 'UK', salary: 90000 },
        ]
      })

      const stats = await repo.getCountryStats('USA')
      
      expect(stats).toEqual({
        country: 'USA',
        min_salary: 80000,
        max_salary: 150000,
        avg_salary: 110000,
        employee_count: 3
      })
    })

    it('should return null if country has no employees', async () => {
      const stats = await repo.getCountryStats('Canada')
      expect(stats).toBeNull()
    })
  })
})
