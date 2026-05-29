import fs from 'fs'

export class NameGenerator {
  static readLines(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8')
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
  }

  static generateUnique(
    firstNames: string[],
    lastNames: string[],
    count: number
  ): string[] {
    const maxPossible = firstNames.length * lastNames.length

    if (count > maxPossible) {
      throw new Error(
        `Cannot generate ${count} unique names from ` +
        `${firstNames.length} first names × ${lastNames.length} last names ` +
        `(max: ${maxPossible})`
      )
    }

    const names: string[] = []
    for (const first of firstNames) {
      for (const last of lastNames) {
        names.push(`${first} ${last}`)
        if (names.length === count) return names
      }
    }

    return names
  }
}