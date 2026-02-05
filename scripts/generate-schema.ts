import { zodToJsonSchema } from 'zod-to-json-schema'
import fs from 'node:fs/promises'
import path from 'node:path'
import { UnitFileSchema } from '../src/types/schemas'

// Define the schema for a "Unit File" -> Imported from schemas.ts

async function main() {
  console.log('Generating JSON Schema for Content...')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = zodToJsonSchema(UnitFileSchema as any, {
    name: 'german-mastery-unit-scchema',
    target: 'jsonSchema7', // VS Code supports Draft 7 widely
  })

  // Ensure 'content' dir exists
  const contentDir = path.resolve(process.cwd(), 'content')
  await fs.mkdir(contentDir, { recursive: true })

  const schemaPath = path.join(contentDir, 'schema.json')

  await fs.writeFile(schemaPath, JSON.stringify(jsonSchema, null, 2), 'utf-8')

  console.log(`✅ Schema generated at: ${schemaPath}`)
  console.log('You can now configure VS Code to use this schema.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
