import express, { Express } from 'express'
import cors from 'cors'
import { EmployeeService } from './employee/employee.service'
import { InsightsService } from './insights/insights.service'
import { createEmployeeRouter } from './employee/employee.router'
import { InMemoryEmployeeRepository } from './employee/repository/in-memory-employee.repository'

export interface AppDependencies {
  employeeService?: EmployeeService
  insightsService?: InsightsService
}

export const createApp = (deps?: AppDependencies): Express => {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  const employeeService =
    deps?.employeeService ??
    new EmployeeService(new InMemoryEmployeeRepository())

  app.use('/api/employees', createEmployeeRouter(employeeService))

  return app
}