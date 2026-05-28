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
})
