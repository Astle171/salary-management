import { EmployeeValidator } from './employee.validator'
import { ValidationError } from '../shared/errors/validation.error'

describe('EmployeeValidator', () => {
  describe('full_name', () => {
    it('should throw ValidationError when full_name is missing', () => {
      expect(() =>
        EmployeeValidator.validate({ full_name: '' })
      ).toThrow(ValidationError)
    })
  })

  describe('job_title', () => {
    it('should throw ValidationError when job_title is missing', () => {
      expect(() =>
        EmployeeValidator.validate({ full_name: 'Astle Machado', job_title: '' })
      ).toThrow(ValidationError)
    })
  })

  describe('country', () => {
    it('should throw ValidationError when country is missing', () => {
      expect(() =>
        EmployeeValidator.validate({ full_name: 'Astle Machado', job_title: 'Engineer', country: '' })
      ).toThrow(ValidationError)
    })
  })

  describe('salary', () => {
    it('should throw ValidationError when salary is missing', () => {
      expect(() =>
        EmployeeValidator.validate({ full_name: 'Astle Machado', job_title: 'Engineer', country: 'India' })
      ).toThrow(ValidationError)
    })

    it('should throw ValidationError when salary is zero', () => {
      expect(() =>
        EmployeeValidator.validate({ full_name: 'Astle Machado', job_title: 'Engineer', country: 'India', salary: 0 })
      ).toThrow(ValidationError)
    })

    it('should throw ValidationError when salary is negative', () => {
      expect(() =>
        EmployeeValidator.validate({ full_name: 'Astle Machado', job_title: 'Engineer', country: 'India', salary: -100 })
      ).toThrow(ValidationError)
    })

    it('should throw ValidationError when salary is not a number', () => {
      expect(() =>
        EmployeeValidator.validate({ full_name: 'Astle Machado', job_title: 'Engineer', country: 'India', salary: 'abc' })
      ).toThrow(ValidationError)
    })
  })

  describe('optional fields', () => {
    const validBase = {
      full_name: 'Astle Machado',
      job_title: 'Engineer',
      country: 'India',
      salary: 50000,
    }

    it('should return department as "General" when not provided', () => {
      const result = EmployeeValidator.validate(validBase)
      expect(result.department).toBe('General')
    })

    it('should return employment_type as "full_time" when not provided', () => {
      const result = EmployeeValidator.validate(validBase)
      expect(result.employment_type).toBe('full_time')
    })

    it('should throw when employment_type is an invalid value', () => {
      expect(() =>
        EmployeeValidator.validate({ ...validBase, employment_type: 'banana' })
      ).toThrow(ValidationError)
    })

    it('should return hire_date as today when not provided', () => {
      const result = EmployeeValidator.validate(validBase)
      const today = new Date().toDateString()
      expect(new Date(result.hire_date).toDateString()).toBe(today)
    })
  })
})
