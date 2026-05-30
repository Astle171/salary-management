import express, { Express } from 'express'
import cors from 'cors'
import { EmployeeService } from './employee/employee.service'
import { InsightsService } from './insights/insights.service'
import { createEmployeeRouter } from './employee/employee.router'
import { createInsightsRouter } from './insights/insights.router'
import { errorHandlerMiddleware } from './shared/middleware/error-handler.middleware'
import { PrismaEmployeeRepository } from './employee/repository/prisma-employee.repository'
import { InMemoryInsightsRepository } from './insights/repository/in-memory-insights.repository'

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
    new EmployeeService(new PrismaEmployeeRepository())

  app.use('/api/employees', createEmployeeRouter(employeeService))

  const insightsService =
    deps?.insightsService ??
    new InsightsService(new InMemoryInsightsRepository())

  app.use('/api/insights', createInsightsRouter(insightsService))

  app.use(errorHandlerMiddleware)

  return app
}