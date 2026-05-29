import path from 'path'
import { NameGenerator } from './name-generator'

const FIXTURES = path.join(__dirname, '__fixtures__')
const firstNamesPath = path.join(FIXTURES, 'first_names_fixture.txt')
const lastNamesPath  = path.join(FIXTURES, 'last_names_fixture.txt')

describe('NameGenerator', () => {
  describe('readLines', () => {
    it('should read lines from a file and return trimmed non-empty strings', () => {
      const lines = NameGenerator.readLines(firstNamesPath)

      expect(lines).toHaveLength(5)
      expect(lines).toContain('Alice')
      expect(lines).toContain('Bob')
    })

    it('should trim whitespace from each line', () => {
      const lines = NameGenerator.readLines(firstNamesPath)

      lines.forEach(line => {
        expect(line).toBe(line.trim())
        expect(line.length).toBeGreaterThan(0)
      })
    })
  })

  describe('generateUnique', () => {
    it('should generate full names by combining first and last names', () => {
      const firstNames = ['Alice', 'Bob']
      const lastNames  = ['Smith', 'Jones']

      const names = NameGenerator.generateUnique(firstNames, lastNames, 4)

      expect(names).toContain('Alice Smith')
      expect(names).toContain('Alice Jones')
      expect(names).toContain('Bob Smith')
      expect(names).toContain('Bob Jones')
    })

    it('should return exactly the requested count', () => {
      const firstNames = ['Alice', 'Bob', 'Carol']
      const lastNames  = ['Smith', 'Jones', 'Brown']

      const names = NameGenerator.generateUnique(firstNames, lastNames, 5)

      expect(names).toHaveLength(5)
    })
  })
})