import { Router } from 'express'
import { EmployeeService } from './employee.service'
import { EmployeeController } from './employee.controller'
import { validateBody, validateQuery } from '../shared/middleware/validate-request.middleware'
import {
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  ListEmployeesQuerySchema,
} from './employee.schemas'

export const createEmployeeRouter = (service: EmployeeService): Router => {
  const router = Router()
  const controller = new EmployeeController(service)

  router.get('/', validateQuery(ListEmployeesQuerySchema), controller.list)
  router.post('/', validateBody(CreateEmployeeSchema), controller.create)
  router.get('/:id', controller.getById)
  router.put('/:id', validateBody(UpdateEmployeeSchema), controller.update)
  router.delete('/:id', controller.remove)

  return router
}
