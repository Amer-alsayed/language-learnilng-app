# Content Pipeline

This folder contains CSV files used to seed lesson content into Supabase.

## Template

Start with `content/lessons-template.csv`. Columns:

- `unit_id` (optional if `--unit` is provided)
- `lesson_order` (integer)
- `lesson_title`
- `intro_video_url` (optional)
- `passing_score` (0 to 1, optional)
- `exercise_id` (optional, auto-generated if blank)
- `exercise_type` (`multiple_choice`, `word_bank`, `typing`, `match_pairs`, `listening`)
- `prompt`
- `audio_url` (optional)
- `options` (pipe-delimited, multiple choice)
- `correct_option_index` (0-based index)
- `explanation` (optional)
- `sentence_parts` (pipe-delimited, word bank)
- `correct_order` (pipe-delimited indices, word bank)
- `distractors` (pipe-delimited, optional)
- `correct_answer` (typing)
- `acceptable_answers` (pipe-delimited, optional)
- `pairs` (pipe-delimited `left:right` pairs, match pairs)
- `correct_transcript` (listening)

Notes:

- Fill only the fields required for the exercise type.
- Arrays use `|` as a delimiter. Quote values that contain commas.
- For `pairs`, use `left:right` and avoid `:` inside text.
- `lesson_order` can start at 0 or 1; just stay consistent within a unit.

## Run

```bash
npm run seed -- --file content/lessons.csv --unit <unit-uuid>
npm run seed:dry -- --file content/lessons.csv
```

Required environment variables:

- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`
