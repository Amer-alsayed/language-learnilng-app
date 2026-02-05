# Content Pipeline (JSON)

This folder contains JSON unit files used to seed lesson content into Supabase.

## Structure

- `content/units/*.json` contains one unit per file.
- `content/schema.json` provides JSON Schema validation in VS Code.
- Start from `content/units/00_template.json` as a reference.

## Workflow

1. Create a new file in `content/units/` (example: `01_basics.json`).
2. Validate it in VS Code (schema is auto-attached).
3. Seed the database:

```bash
npm run seed
npm run seed:dry
```

## Notes

- Exercise IDs must be valid UUIDs.
- For word bank exercises, include any extra words directly in `sentenceParts`.
- The CSV template in this folder is legacy and not used by the current seeder.
