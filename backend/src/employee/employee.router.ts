import { Router } from 'express'
import { EmployeeService } from './employee.service'
import { EmployeeController } from './employee.controller'

export const createEmployeeRouter = (service: EmployeeService): Router => {
  const router = Router()
  const controller = new EmployeeController(service)

  router.get('/', controller.list)
  router.post('/', controller.create)
  router.get('/:id', controller.getById)
  router.put('/:id', controller.update)
  router.delete('/:id', controller.remove)

  return router
}
