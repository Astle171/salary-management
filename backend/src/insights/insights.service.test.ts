import { InsightsService } from './insights.service'
import { InMemoryInsightsRepository } from './repository/in-memory-insights.repository'
import { Employee } from '../shared/types/employee.types'

const makeEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  id: Math.random().toString(),
  full_name: 'Test User',
  job_title: 'Engineer',
  department: 'Engineering',
  country: 'India',
  salary: 60000,
  currency: 'USD',
  employment_type: 'full_time',
  hire_date: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
})

describe('InsightsService', () => {
  let repo: InMemoryInsightsRepository
  let service: InsightsService

  beforeEach(() => {
    repo = new InMemoryInsightsRepository()
    service = new InsightsService(repo)
  })

  describe('getCountryStats', () => {
    it('should return min, max, avg salary and count for a country', async () => {
      repo.seedEmployees([
        makeEmployee({ country: 'India', salary: 40000 }),
        makeEmployee({ country: 'India', salary: 60000 }),
        makeEmployee({ country: 'India', salary: 80000 }),
        makeEmployee({ country: 'USA',   salary: 120000 }),
      ])

      const stats = await service.getCountryStats('India')

      expect(stats).not.toBeNull()
      expect(stats?.country).toBe('India')
      expect(stats?.min_salary).toBe(40000)
      expect(stats?.max_salary).toBe(80000)
      expect(stats?.avg_salary).toBe(60000)
      expect(stats?.employee_count).toBe(3)
    })

    it('should return null when country has no employees', async () => {
      repo.seedEmployees([makeEmployee({ country: 'India' })])

      const stats = await service.getCountryStats('USA')

      expect(stats).toBeNull()
    })
  })

  describe('getJobTitleStats', () => {
    it('should return avg salary and count for a job title in a country', async () => {
      repo.seedEmployees([
        makeEmployee({ job_title: 'Engineer', country: 'India', salary: 50000 }),
        makeEmployee({ job_title: 'Engineer', country: 'India', salary: 70000 }),
        makeEmployee({ job_title: 'Engineer', country: 'USA',   salary: 120000 }),
        makeEmployee({ job_title: 'Manager',  country: 'India', salary: 90000 }),
      ])

      const stats = await service.getJobTitleStats('Engineer', 'India')

      expect(stats).not.toBeNull()
      expect(stats?.job_title).toBe('Engineer')
      expect(stats?.country).toBe('India')
      expect(stats?.avg_salary).toBe(60000)
      expect(stats?.employee_count).toBe(2)
    })

    it('should return null when no match found', async () => {
      repo.seedEmployees([makeEmployee({ job_title: 'Engineer', country: 'India' })])

      const stats = await service.getJobTitleStats('Designer', 'India')

      expect(stats).toBeNull()
    })
  })
})
