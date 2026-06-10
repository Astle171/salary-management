-- CreateTable
CREATE TABLE "SalaryHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_id" TEXT NOT NULL,
    "salary" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "effective_date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalaryHistory_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SalaryHistory_employee_id_effective_date_idx" ON "SalaryHistory"("employee_id", "effective_date");
