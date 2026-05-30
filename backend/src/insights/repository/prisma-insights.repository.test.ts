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

  describe('getDepartmentDistribution', () => {
    it('should return department distribution across all countries when no country is specified', async () => {
      await prisma.employee.createMany({
        data: [
          { full_name: 'Alice', job_title: 'Engineer', department: 'Engineering', country: 'USA', salary: 100000 },
          { full_name: 'Bob',   job_title: 'Engineer', department: 'Engineering', country: 'India', salary: 50000 },
          { full_name: 'Charlie', job_title: 'Manager', department: 'HR', country: 'USA', salary: 60000 },
        ]
      })

      const distribution = await repo.getDepartmentDistribution()
      expect(distribution).toHaveLength(2)
      
      const eng = distribution.find(d => d.department === 'Engineering')
      const hr = distribution.find(d => d.department === 'HR')
      
      expect(eng?.avg_salary).toBe(75000)
      expect(eng?.employee_count).toBe(2)
      expect(hr?.avg_salary).toBe(60000)
      expect(hr?.employee_count).toBe(1)
    })

    it('should filter department distribution by country when specified', async () => {
      await prisma.employee.createMany({
        data: [
          { full_name: 'Alice', job_title: 'Engineer', department: 'Engineering', country: 'USA', salary: 100000 },
          { full_name: 'Bob',   job_title: 'Engineer', department: 'Engineering', country: 'India', salary: 50000 },
          { full_name: 'Charlie', job_title: 'Manager', department: 'HR', country: 'USA', salary: 60000 },
        ]
      })

      const distribution = await repo.getDepartmentDistribution('USA')
      expect(distribution).toHaveLength(2)
      
      const eng = distribution.find(d => d.department === 'Engineering')
      const hr = distribution.find(d => d.department === 'HR')
      
      expect(eng?.avg_salary).toBe(100000)
      expect(eng?.employee_count).toBe(1)
      expect(hr?.avg_salary).toBe(60000)
      expect(hr?.employee_count).toBe(1)
    })
  })

  describe('getTopEarners', () => {
    it('should return top earners across all countries when no country is specified', async () => {
      await prisma.employee.createMany({
        data: [
          { full_name: 'Alice', job_title: 'Engineer', department: 'Engineering', country: 'USA', salary: 100000 },
          { full_name: 'Bob',   job_title: 'Engineer', department: 'Engineering', country: 'India', salary: 150000 },
          { full_name: 'Charlie', job_title: 'Manager', department: 'HR', country: 'USA', salary: 60000 },
        ]
      })

      const earners = await repo.getTopEarners(2)
      expect(earners).toHaveLength(2)
      expect(earners[0].full_name).toBe('Bob')
      expect(earners[1].full_name).toBe('Alice')
    })

    it('should filter top earners by country when specified', async () => {
      await prisma.employee.createMany({
        data: [
          { full_name: 'Alice', job_title: 'Engineer', department: 'Engineering', country: 'USA', salary: 100000 },
          { full_name: 'Bob',   job_title: 'Engineer', department: 'Engineering', country: 'India', salary: 150000 },
          { full_name: 'Charlie', job_title: 'Manager', department: 'HR', country: 'USA', salary: 120000 },
        ]
      })

      const earners = await repo.getTopEarners(2, 'USA')
      expect(earners).toHaveLength(2)
      expect(earners[0].full_name).toBe('Charlie')
      expect(earners[1].full_name).toBe('Alice')
    })
  })
})
