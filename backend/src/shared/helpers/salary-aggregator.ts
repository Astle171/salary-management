export class SalaryAggregator {
  static min(salaries: number[]): number {
    return Math.min(...salaries)
  }

  static max(salaries: number[]): number {
    return Math.max(...salaries)
  }

  static avg(salaries: number[]): number {
    if (salaries.length === 0) return 0
    return salaries.reduce((a, b) => a + b, 0) / salaries.length
  }

  static summary(salaries: number[]): {
    min_salary: number
    max_salary: number
    avg_salary: number
  } {
    return {
      min_salary: this.min(salaries),
      max_salary: this.max(salaries),
      avg_salary: this.avg(salaries),
    }
  }
}
