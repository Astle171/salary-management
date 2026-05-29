import express, { Express } from 'express'
import cors from 'cors'
import { EmployeeService } from './employee/employee.service'
import { InsightsService } from './insights/insights.service'

export interface AppDependencies {
  employeeService?: EmployeeService
  insightsService?: InsightsService
}

export const createApp = (_deps?: AppDependencies): Express => {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // Routes wired in each commit as they are built

  return app
}