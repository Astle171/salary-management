import express, { Express } from 'express'
import cors from 'cors'
import { EmployeeService } from './employee/employee.service'
import { InsightsService } from './insights/insights.service'
import { SalaryHistoryService } from './salary-history/salary-history.service'
import { createEmployeeRouter } from './employee/employee.router'
import { createInsightsRouter } from './insights/insights.router'
import { createSalaryHistoryRouter } from './salary-history/salary-history.router'
import { errorHandlerMiddleware } from './shared/middleware/error-handler.middleware'
import { PrismaEmployeeRepository } from './employee/repository/prisma-employee.repository'
import { PrismaInsightsRepository } from './insights/repository/prisma-insights.repository'
import { PrismaSalaryHistoryRepository } from './salary-history/repository/prisma-salary-history.repository'

export interface AppDependencies {
  employeeService?: EmployeeService
  insightsService?: InsightsService
  salaryHistoryService?: SalaryHistoryService
}

export const createApp = (deps?: AppDependencies): Express => {
  const app = express()

  // Allow Vercel frontend + local dev
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8082',
    process.env.FRONTEND_URL,           // set on Railway to your Vercel URL
  ].filter(Boolean) as string[]

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true)
      
      // Allow local development, configured frontend, and all vercel preview subdomains
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true)
      }
      
      callback(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
  }))

  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV })
  })

  const employeeService =
    deps?.employeeService ??
    new EmployeeService(new PrismaEmployeeRepository())

  const insightsService =
    deps?.insightsService ??
    new InsightsService(new PrismaInsightsRepository())

  const salaryHistoryService =
    deps?.salaryHistoryService ??
    new SalaryHistoryService(new PrismaSalaryHistoryRepository())

  app.use('/api/employees', createEmployeeRouter(employeeService))
  app.use('/api/employees', createSalaryHistoryRouter(salaryHistoryService))
  app.use('/api/insights',  createInsightsRouter(insightsService))

  app.use(errorHandlerMiddleware)

  return app
}