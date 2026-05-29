import { CreateEmployeeInput } from '../shared/types/employee.types'

const JOB_TITLES = [
  'Software Engineer', 'Senior Engineer', 'Staff Engineer',
  'Product Manager', 'Senior Product Manager',
  'Data Analyst', 'Data Scientist',
  'UX Designer', 'UI Designer',
  'DevOps Engineer', 'Site Reliability Engineer',
  'QA Engineer', 'Security Engineer',
  'Engineering Manager', 'HR Manager',
  'Finance Analyst', 'Marketing Manager',
  'Sales Representative', 'Customer Support',
  'Business Analyst',
]

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Data',
  'DevOps', 'QA', 'Security', 'Management',
  'HR', 'Finance', 'Marketing', 'Sales', 'Support',
]

const COUNTRIES = [
  'India', 'USA', 'UK', 'Germany', 'Canada',
  'Australia', 'France', 'Netherlands', 'Singapore', 'Brazil',
]

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract'] as const

const SALARY_RANGES: Record<string, [number, number]> = {
  'Software Engineer':        [50000,  120000],
  'Senior Engineer':          [90000,  160000],
  'Staff Engineer':           [130000, 220000],
  'Product Manager':          [80000,  150000],
  'Senior Product Manager':   [110000, 190000],
  'Data Analyst':             [55000,  100000],
  'Data Scientist':           [80000,  150000],
  'UX Designer':              [60000,  120000],
  'UI Designer':              [55000,  110000],
  'DevOps Engineer':          [75000,  140000],
  'Site Reliability Engineer':[85000,  160000],
  'QA Engineer':              [50000,  100000],
  'Security Engineer':        [85000,  160000],
  'Engineering Manager':      [120000, 220000],
  'HR Manager':               [60000,  110000],
  'Finance Analyst':          [55000,  100000],
  'Marketing Manager':        [60000,  110000],
  'Sales Representative':     [45000,   90000],
  'Customer Support':         [35000,   65000],
  'Business Analyst':         [60000,  110000],
}

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]

const randomSalary = (jobTitle: string): number => {
  const [min, max] = SALARY_RANGES[jobTitle] ?? [40000, 100000]
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const randomDate = (yearsBack: number): Date => {
  const now = Date.now()
  const past = yearsBack * 365 * 24 * 60 * 60 * 1000
  return new Date(now - Math.floor(Math.random() * past))
}

export class EmployeeGenerator {
  static generate(names: string[]): CreateEmployeeInput[] {
    return names.map(full_name => {
      const job_title = pick(JOB_TITLES)
      return {
        full_name,
        job_title,
        department:      pick(DEPARTMENTS),
        country:         pick(COUNTRIES),
        salary:          randomSalary(job_title),
        currency:        'USD',
        employment_type: pick(EMPLOYMENT_TYPES),
        hire_date:       randomDate(10),
      }
    })
  }
}