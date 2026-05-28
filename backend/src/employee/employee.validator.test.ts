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
  })
})
