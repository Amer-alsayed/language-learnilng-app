import { config as loadEnv } from 'dotenv'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { UnitFileSchema } from '../src/types/schemas'

type Exercise =
  | {
      id: string
      type: 'match_pairs'
      prompt: string
      pairs: { left: string; right: string }[]
      audioUrl?: string
    }
  | {
      id: string
      type: 'multiple_choice'
      prompt: string
      options: string[]
      correctOptionIndex: number
      explanation?: string
      audioUrl?: string
    }
  | {
      id: string
      type: 'typing'
      prompt: string
      correctAnswer: string
      acceptableAnswers?: string[]
      audioUrl?: string
    }
  | {
      id: string
      type: 'word_bank'
      prompt: string
      sentenceParts: string[]
      correctOrder: number[]
      distractors?: string[]
      audioUrl?: string
    }
  | {
      id: string
      type: 'listening'
      prompt: string
      correctTranscript: string
      // Optional: when no audioUrl is provided, the app uses browser TTS.
      ttsText?: string
      audioUrl?: string
    }

type Lesson = {
  title: string
  order: number
  content: {
    exercises: Exercise[]
    passingScore?: number
  }
}

type Unit = {
  $schema?: string
  title: string
  description?: string
  order: number
  lessons: Lesson[]
}

function uuid() {
  return crypto.randomUUID()
}

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i)
}

function dedupe<T>(items: T[]) {
  return [...new Set(items)]
}

function shuffleDeterministic<T>(items: T[], seed: string) {
  // Deterministic Fisher–Yates using a simple xorshift32 seeded from sha256(seed).
  const hash = crypto.createHash('sha256').update(seed).digest()
  let state =
    (hash[0] << 24) | (hash[1] << 16) | (hash[2] << 8) | (hash[3] << 0)

  const next = () => {
    // xorshift32
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return state >>> 0
  }

  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = next() % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function pickDistinct(
  pool: string[],
  count: number,
  exclude: Set<string> = new Set()
) {
  const filtered = pool.filter((x) => !exclude.has(x))
  const picked: string[] = []
  for (const item of filtered) {
    picked.push(item)
    if (picked.length >= count) break
  }
  return picked
}

function mcq(
  prompt: string,
  correct: string,
  distractors: string[],
  explanation?: string
): Exercise {
  const options = shuffleDeterministic(
    dedupe([correct, ...distractors]).slice(0, 4),
    `${prompt}::${correct}`
  )
  const correctOptionIndex = options.indexOf(correct)
  if (correctOptionIndex < 0) {
    throw new Error('MCQ correct option missing from options.')
  }
  return {
    id: uuid(),
    type: 'multiple_choice',
    prompt,
    options,
    correctOptionIndex,
    ...(explanation ? { explanation } : {}),
  }
}

function matchPairs(prompt: string, pairs: { left: string; right: string }[]) {
  return {
    id: uuid(),
    type: 'match_pairs' as const,
    prompt,
    pairs,
  }
}

function typing(
  prompt: string,
  correctAnswer: string,
  acceptableAnswers?: string[]
) {
  return {
    id: uuid(),
    type: 'typing' as const,
    prompt,
    correctAnswer,
    ...(acceptableAnswers?.length ? { acceptableAnswers } : {}),
  }
}

function wordBank(prompt: string, sentenceParts: string[]) {
  return {
    id: uuid(),
    type: 'word_bank' as const,
    prompt,
    sentenceParts,
    correctOrder: range(sentenceParts.length),
  }
}

function listening(
  prompt: string,
  correctTranscript: string,
  ttsText?: string
): Exercise {
  return {
    id: uuid(),
    type: 'listening' as const,
    prompt,
    correctTranscript,
    ...(ttsText ? { ttsText } : {}),
  }
}

const alphabet = [
  { letter: 'A', sound: 'ah', example: 'Apfel', arabic: 'تفاحة' },
  { letter: 'B', sound: 'bay', example: 'Ball', arabic: 'كرة' },
  { letter: 'C', sound: 'tsay', example: 'Computer', arabic: 'حاسوب' },
  { letter: 'D', sound: 'day', example: 'Dorf', arabic: 'قرية' },
  { letter: 'E', sound: 'ay', example: 'Elefant', arabic: 'فيل' },
  { letter: 'F', sound: 'eff', example: 'Fisch', arabic: 'سمكة' },
  { letter: 'G', sound: 'gee', example: 'Garten', arabic: 'حديقة' },
  { letter: 'H', sound: 'hah', example: 'Haus', arabic: 'منزل' },
  { letter: 'I', sound: 'ee', example: 'Igel', arabic: 'قنفذ' },
  { letter: 'J', sound: 'yot', example: 'Jacke', arabic: 'سترة' },
  { letter: 'K', sound: 'kah', example: 'Kind', arabic: 'طفل' },
  { letter: 'L', sound: 'ell', example: 'Lampe', arabic: 'مصباح' },
  { letter: 'M', sound: 'em', example: 'Mond', arabic: 'قمر' },
  { letter: 'N', sound: 'en', example: 'Nase', arabic: 'أنف' },
  { letter: 'O', sound: 'oh', example: 'Ohr', arabic: 'أذن' },
  { letter: 'P', sound: 'pay', example: 'Papier', arabic: 'ورقة' },
  { letter: 'Q', sound: 'koo', example: 'Quelle', arabic: 'مصدر' },
  { letter: 'R', sound: 'air', example: 'Rose', arabic: 'وردة' },
  { letter: 'S', sound: 'ess', example: 'Sonne', arabic: 'شمس' },
  { letter: 'T', sound: 'tay', example: 'Tisch', arabic: 'طاولة' },
  { letter: 'U', sound: 'oo', example: 'Uhr', arabic: 'ساعة' },
  { letter: 'V', sound: 'fow', example: 'Vogel', arabic: 'طائر' },
  { letter: 'W', sound: 'vay', example: 'Wasser', arabic: 'ماء' },
  { letter: 'X', sound: 'iks', example: 'Xylofon', arabic: 'إكسيليفون' },
  { letter: 'Y', sound: 'ypsilon', example: 'Yacht', arabic: 'يخت' },
  { letter: 'Z', sound: 'tset', example: 'Zebra', arabic: 'حمار وحشي' },
]

const specialChars = [
  { letter: 'Ä', sound: 'eh (air)', example: 'Äpfel', arabic: 'تفاح' },
  { letter: 'Ö', sound: 'oeh (rounded)', example: 'Öl', arabic: 'زيت' },
  { letter: 'Ü', sound: 'ueh (rounded)', example: 'Tür', arabic: 'باب' },
  { letter: 'ß', sound: 'ss (Eszett)', example: 'Straße', arabic: 'شارع' },
]

const vowelCombos = [
  { combo: 'ei', sound: 'eye (my)', example: 'Mai', arabic: 'مايو' },
  { combo: 'ai', sound: 'eye (my)', example: 'Kaiser', arabic: 'إمبراطور' },
  { combo: 'ie', sound: 'ee (see)', example: 'Liebe', arabic: 'حب' },
  { combo: 'au', sound: 'ow (cow)', example: 'Haus', arabic: 'منزل' },
  { combo: 'eu', sound: 'oy (boy)', example: 'neu', arabic: 'جديد' },
  { combo: 'äu', sound: 'oy (boy)', example: 'Häuser', arabic: 'منازل' },
]

const consonantCombos = [
  {
    combo: 'ch (after a/o/u)',
    sound: 'kh (strong)',
    example: 'Buch',
    arabic: 'كتاب',
  },
  {
    combo: 'ch (after i/e/ä/ö/ü)',
    sound: 'soft (hissing)',
    example: 'ich',
    arabic: 'أنا',
  },
  { combo: 'chs', sound: 'x (iks)', example: 'sechs', arabic: 'ستة' },
  { combo: 'sch', sound: 'sh (shoe)', example: 'Schule', arabic: 'مدرسة' },
  { combo: 'sp (start)', sound: 'shp', example: 'Sport', arabic: 'رياضة' },
  { combo: 'st (start)', sound: 'sht', example: 'Stadt', arabic: 'مدينة' },
  { combo: 'pf', sound: 'pf', example: 'Apfel', arabic: 'تفاحة' },
  { combo: 'ck', sound: 'k (short vowel)', example: 'Jacke', arabic: 'سترة' },
  { combo: 'tz', sound: 'ts', example: 'Katze', arabic: 'قطة' },
  { combo: 'qu', sound: 'kv', example: 'Quelle', arabic: 'مصدر' },
  { combo: 'ng', sound: 'ng', example: 'singen', arabic: 'يغني' },
  { combo: 'ph', sound: 'f', example: 'Philosophie', arabic: 'فلسفة' },
  { combo: 'th', sound: 't', example: 'Theater', arabic: 'مسرح' },
  { combo: 'dt', sound: 't', example: 'Stadt', arabic: 'مدينة' },
]

const greetings = [
  {
    de: 'Guten Morgen',
    ar: 'صباح الخير',
    formality: 'Formal',
    note: 'until ~11 AM',
  },
  {
    de: 'Guten Tag',
    ar: 'مرحبا / يوم سعيد',
    formality: 'Formal',
    note: '~11 AM to 6 PM',
  },
  {
    de: 'Guten Abend',
    ar: 'مساء الخير',
    formality: 'Formal',
    note: 'from ~6 PM',
  },
  { de: 'Hallo', ar: 'مرحبا / أهلا', formality: 'Informal', note: 'any time' },
  { de: 'Willkommen', ar: 'أهلا وسهلا', formality: 'Both', note: 'welcome' },
]

const farewells = [
  { de: 'Auf Wiedersehen', ar: 'إلى اللقاء', formality: 'Formal' },
  { de: 'Tschüss', ar: 'وداعاً / باي', formality: 'Informal' },
  { de: "Mach's gut", ar: 'اعتن بنفسك', formality: 'Informal' },
  { de: 'Bis bald', ar: 'أراك قريباً', formality: 'Both' },
  { de: 'Bis morgen', ar: 'أراك غداً', formality: 'Both' },
]

function buildAlphabetLesson(
  title: string,
  order: number,
  slice: typeof alphabet
): Lesson {
  const letters = slice.map((x) => x.letter)
  const sounds = slice.map((x) => x.sound)
  const examples = slice.map((x) => x.example)
  const arabics = slice.map((x) => x.arabic)

  const pairs = slice.map((x) => ({ left: x.letter, right: x.sound }))

  const idx = 0
  const soundQuestion = slice[Math.min(2, slice.length - 1)]
  const exampleQuestion = slice[Math.min(3, slice.length - 1)]
  const typingQuestion = slice[Math.min(4, slice.length - 1)]

  const allLetterPool = alphabet.map((x) => x.letter)
  const allSoundPool = alphabet.map((x) => x.sound)
  const allExamplePool = alphabet.map((x) => x.example)

  return {
    title,
    order,
    content: {
      passingScore: 0.8,
      exercises: [
        matchPairs(
          'Match each letter to its German pronunciation (اسم الحرف)',
          pairs
        ),
        mcq(
          `Which letter is pronounced "${soundQuestion.sound}"?`,
          soundQuestion.letter,
          pickDistinct(allLetterPool, 4, new Set([soundQuestion.letter])).slice(
            0,
            3
          )
        ),
        mcq(
          `Which word starts with the letter "${exampleQuestion.letter}"?`,
          exampleQuestion.example,
          pickDistinct(
            allExamplePool,
            4,
            new Set([exampleQuestion.example])
          ).slice(0, 3),
          `Correct: "${exampleQuestion.example}" starts with ${exampleQuestion.letter}.`
        ),
        typing(
          `Type the German word for "${typingQuestion.arabic}" (starts with ${typingQuestion.letter}).`,
          typingQuestion.example
        ),
        mcq(
          'Choose the correct pronunciation (اسم الحرف) for the letter shown: ' +
            letters[idx],
          sounds[idx],
          pickDistinct(allSoundPool, 4, new Set([sounds[idx]])).slice(0, 3)
        ),
      ],
    },
  }
}

function buildGreetingLesson(title: string, order: number): Lesson {
  const pairs = greetings.map((g) => ({ left: g.de, right: g.ar }))
  return {
    title,
    order,
    content: {
      exercises: [
        matchPairs('Match the greeting to the Arabic meaning', pairs),
        mcq(
          'Which greeting is most appropriate for the morning? (الصباح)',
          'Guten Morgen',
          ['Guten Abend', 'Hallo', 'Guten Tag']
        ),
        mcq('Pick the informal greeting (غير رسمي)', 'Hallo', [
          'Guten Tag',
          'Guten Abend',
          'Auf Wiedersehen',
        ]),
        wordBank('Build the sentence: "Good morning!"', ['Guten', 'Morgen']),
        typing('Type: "Welcome" in German (أهلا وسهلا)', 'Willkommen'),
      ],
    },
  }
}

function buildIntroduceLesson(title: string, order: number): Lesson {
  return {
    title,
    order,
    content: {
      exercises: [
        mcq(
          'Choose the formal question: "What is your name?" (رسمي)',
          'Wie heißen Sie?',
          ['Wie heißt du?', 'Wie geht es dir?', 'Woher kommst du?']
        ),
        wordBank('Build the formal question: "What is your name?"', [
          'Wie',
          'heißen',
          'Sie',
        ]),
        wordBank('Build the answer: "My name is Ahmed."', [
          'Ich',
          'heiße',
          'Ahmed',
        ]),
        mcq(
          'Choose the informal question: "How old are you?" (غير رسمي)',
          'Wie alt bist du?',
          ['Wie alt sind Sie?', 'Woher kommen Sie?', 'Wie geht es Ihnen?']
        ),
        typing('Complete: "Ich bin ___ Jahre alt" (type a number)', '20', [
          '18',
          '19',
          '21',
          '22',
          '25',
          '30',
        ]),
      ],
    },
  }
}

function buildFarewellLesson(title: string, order: number): Lesson {
  const pairs = farewells.map((g) => ({ left: g.de, right: g.ar }))
  return {
    title,
    order,
    content: {
      exercises: [
        matchPairs('Match the farewell to the Arabic meaning', pairs),
        mcq(
          'Which farewell is typically used on the phone? (رسمي)',
          'Auf Wiederhören',
          ['Auf Wiedersehen', 'Tschüss', 'Bis morgen'],
          'Auf Wiederhören is used on the phone.'
        ),
        mcq('Pick the informal goodbye (غير رسمي)', 'Tschüss', [
          'Auf Wiedersehen',
          'Einen schönen Tag noch',
          'Willkommen',
        ]),
        wordBank('Build: "See you tomorrow"', ['Bis', 'morgen']),
        typing('Type: "See you soon" in German', 'Bis bald'),
      ],
    },
  }
}

function buildSpecialCharsUnit(): Unit {
  const pairs = specialChars.map((x) => ({ left: x.letter, right: x.sound }))
  return {
    $schema: '../schema.json',
    title: 'Special Characters & Umlauts',
    description:
      'Learn Ä/Ö/Ü and ß (Eszett), and practice spelling and meaning.',
    order: 2,
    lessons: [
      {
        title: 'Ä, Ö, Ü — The Umlauts',
        order: 1,
        content: {
          exercises: [
            matchPairs('Match the umlaut to its sound', pairs.slice(0, 3)),
            mcq('Which word contains "Ä"?', 'Äpfel', ['Apfel', 'Öl', 'Tür']),
            typing('Type the German word for "باب"', 'Tür'),
            typing('Type the German word for "زيت"', 'Öl'),
            mcq('Which letter is pronounced "ueh (rounded)"?', 'Ü', [
              'Ö',
              'Ä',
              'U',
            ]),
          ],
        },
      },
      {
        title: 'ß (Eszett) — Sharp "ss"',
        order: 2,
        content: {
          exercises: [
            mcq('What is the German character "ß" called?', 'Eszett', [
              'Umlaut',
              'Beta',
              'Ypsilon',
            ]),
            mcq('Choose the correct spelling for "street"', 'Straße', [
              'Strasse',
              'Strase',
              'Strasße',
            ]),
            mcq('What is "Straße" in Arabic?', 'شارع', ['مدينة', 'بيت', 'باب']),
            typing('Type the German word: شارع', 'Straße'),
            mcq('ß is pronounced like:', 'ss', ['z', 'sh', 'ts']),
          ],
        },
      },
      {
        title: 'Review: Umlauts & ß',
        order: 3,
        content: {
          exercises: [
            matchPairs(
              'Match the German word to the Arabic meaning',
              specialChars.map((x) => ({ left: x.example, right: x.arabic }))
            ),
            mcq('Pick the word with Ö', 'Öl', ['Tür', 'Äpfel', 'Straße']),
            mcq('Pick the word with Ü', 'Tür', ['Öl', 'Apfel', 'Rose']),
            mcq('Pick the word with ß', 'Straße', [
              'Schule',
              'Stadt',
              'Wasser',
            ]),
            mcq('Choose the correct spelling', 'Äpfel', [
              'Apfel',
              'Aepfel',
              'Äpvel',
            ]),
          ],
        },
      },
      {
        title: 'Vowel Combinations: ei / ie',
        order: 4,
        content: {
          exercises: [
            matchPairs('Match the combination to its sound', [
              { left: 'ei', right: 'eye (my)' },
              { left: 'ie', right: 'ee (see)' },
            ]),
            mcq('Which combination sounds like "eye"?', 'ei', [
              'ie',
              'au',
              'eu',
            ]),
            mcq('Which word contains "ie"?', 'Liebe', ['Mai', 'Haus', 'neu']),
            typing('Type the German word for "حب"', 'Liebe'),
            mcq('Choose the correct spelling for "my":', 'mein', [
              'mien',
              'meien',
              'miener',
            ]),
          ],
        },
      },
      {
        title: 'Vowel Combinations: au / eu / äu',
        order: 5,
        content: {
          exercises: [
            matchPairs('Match the combination to its sound', [
              { left: 'au', right: 'ow (cow)' },
              { left: 'eu', right: 'oy (boy)' },
              { left: 'äu', right: 'oy (boy)' },
            ]),
            mcq('Which word contains "au"?', 'Haus', ['neu', 'Liebe', 'Mai']),
            mcq('Which word contains "eu"?', 'neu', [
              'Häuser',
              'Haus',
              'Liebe',
            ]),
            mcq('Which word contains "äu"?', 'Häuser', ['neu', 'Haus', 'Mai']),
            typing('Type the German word for "منازل"', 'Häuser'),
          ],
        },
      },
    ],
  }
}

function buildConsonantUnit(): Unit {
  const pool = consonantCombos.map((x) => x.combo)
  const byKey = new Map(consonantCombos.map((x) => [x.combo, x]))

  const lesson1 = ['ch (after a/o/u)', 'ch (after i/e/ä/ö/ü)', 'sch', 'chs']
  const lesson2 = ['sp (start)', 'st (start)', 'pf', 'ck', 'tz']
  const lesson3 = ['qu', 'ng', 'ph', 'th', 'dt']

  const buildComboLesson = (
    title: string,
    order: number,
    combos: string[]
  ): Lesson => {
    const rows = combos.map((c) => byKey.get(c)!).filter(Boolean)
    const pairs = rows.map((x) => ({ left: x.combo, right: x.sound }))
    const examplePairs = rows.map((x) => ({ left: x.example, right: x.arabic }))
    const mc = rows[0]
    return {
      title,
      order,
      content: {
        exercises: [
          matchPairs('Match the spelling pattern to the sound', pairs),
          matchPairs('Match the example word to Arabic meaning', examplePairs),
          mcq(
            `Which spelling pattern matches the example "${mc.example}"?`,
            mc.combo,
            pickDistinct(pool, 4, new Set([mc.combo])).slice(0, 3)
          ),
          typing(
            `Type the German word for "${rows[1]?.arabic ?? rows[0].arabic}"`,
            rows[1]?.example ?? rows[0].example
          ),
          mcq(
            'Choose the correct spelling:',
            rows[2]?.example ?? rows[0].example,
            pickDistinct(
              consonantCombos.map((x) => x.example),
              4,
              new Set([rows[2]?.example ?? rows[0].example])
            ).slice(0, 3)
          ),
        ],
      },
    }
  }

  return {
    $schema: '../schema.json',
    title: 'Consonant Combinations (Digraphs)',
    description:
      'Practice ch/sch/sp/st/pf/ck/tz and other common combinations with real examples.',
    order: 3,
    lessons: [
      buildComboLesson('ch, sch, chs', 1, lesson1),
      buildComboLesson('sp, st, pf, ck, tz', 2, lesson2),
      buildComboLesson('qu, ng, ph, th, dt', 3, lesson3),
      {
        title: 'Spelling Focus: ck vs k / tz vs z',
        order: 4,
        content: {
          exercises: [
            mcq('Choose the correct spelling for "cat" (قطة)', 'Katze', [
              'Kaze',
              'Kattze',
              'Katse',
            ]),
            mcq('Choose the correct spelling for "jacket" (سترة)', 'Jacke', [
              'Jake',
              'Jace',
              'Jakke',
            ]),
            mcq('Which pattern makes the vowel short?', 'ck', [
              'ch',
              'sch',
              'ng',
            ]),
            typing('Type the German word for "ستة"', 'sechs'),
            matchPairs('Match the pattern to the example', [
              { left: 'tz', right: 'Katze' },
              { left: 'ck', right: 'Jacke' },
              { left: 'sch', right: 'Schule' },
              { left: 'sp', right: 'Sport' },
            ]),
          ],
        },
      },
      {
        title: 'Review Quiz: Consonant Combinations',
        order: 5,
        content: {
          exercises: [
            mcq('Which pattern is pronounced "sh"?', 'sch', ['sp', 'st', 'ch']),
            mcq('Which word contains "sp" at the start?', 'Sport', [
              'Stadt',
              'Schule',
              'Rose',
            ]),
            mcq('Which word contains "qu"?', 'Quelle', [
              'Katze',
              'Lampe',
              'Liebe',
            ]),
            matchPairs('Match the word to the correct pattern', [
              { left: 'Stadt', right: 'st (start)' },
              { left: 'Sport', right: 'sp (start)' },
              { left: 'Schule', right: 'sch' },
              { left: 'Buch', right: 'ch (after a/o/u)' },
            ]),
            typing('Type the German word: "مدينة"', 'Stadt'),
          ],
        },
      },
    ],
  }
}

function buildRulesUnit(): Unit {
  return {
    $schema: '../schema.json',
    title: 'Pronunciation Rules & Common Mistakes',
    description:
      'Train your ear: b/d/g at the end, S vs Z, V vs W, and ei vs ie.',
    order: 4,
    lessons: [
      {
        title: 'End Devoicing: b / d / g',
        order: 1,
        content: {
          exercises: [
            mcq('At the end of a word, "d" is pronounced like:', 't', [
              'd',
              'th',
              'z',
            ]),
            mcq('At the end of a word, "g" often sounds like:', 'k', [
              'g',
              'ch',
              'j',
            ]),
            mcq('Which spelling is correct even if you hear "Tak"?', 'Tag', [
              'Tak',
              'Takk',
              'Tach',
            ]),
            typing(
              'Type the correct spelling: "day" in German (sounds like "Tak")',
              'Tag'
            ),
            mcq(
              'Tip: To check the real letter at the end, look at:',
              'the plural form (e.g., Tage)',
              ['the Arabic translation', 'the first letter', 'the last vowel']
            ),
          ],
        },
      },
      {
        title: 'S vs Z',
        order: 2,
        content: {
          exercises: [
            mcq('In German, Z is always pronounced:', 'ts', ['z', 's', 'sh']),
            mcq('Which word starts with voiced S (like "z" sound)?', 'Sonne', [
              'Zebra',
              'Katze',
              'Tür',
            ]),
            mcq('Which spelling matches the sound "tsait"?', 'Zeit', [
              'Seit',
              'Zait',
              'Sait',
            ]),
            matchPairs('Match the letter to the sound', [
              { left: 'S (start + vowel)', right: 'voiced (like z)' },
              { left: 'S (end)', right: 'voiceless (sharp s)' },
              { left: 'Z', right: 'ts' },
            ]),
            typing('Type the German word for "sun" (شمس)', 'Sonne'),
          ],
        },
      },
      {
        title: 'V vs W',
        order: 3,
        content: {
          exercises: [
            mcq('W is pronounced like English:', 'v', ['w', 'f', 'b']),
            mcq('V is usually pronounced like:', 'f', ['v', 'w', 'z']),
            mcq('Choose the correct spelling (don’t write Fogel):', 'Vogel', [
              'Fogel',
              'Wogel',
              'Vogell',
            ]),
            mcq('Choose the correct spelling:', 'Wasser', [
              'Vasser',
              'Waser',
              'Wasser',
            ]),
            typing('Type the German word: "ماء"', 'Wasser'),
          ],
        },
      },
      {
        title: 'ei vs ie',
        order: 4,
        content: {
          exercises: [
            mcq('ei sounds like:', 'eye', ['ee', 'ay', 'ow']),
            mcq('ie sounds like:', 'ee', ['eye', 'oy', 'ow']),
            mcq('Choose the correct spelling for "love" (حب)', 'Liebe', [
              'Leibe',
              'Libee',
              'Liebee',
            ]),
            mcq('Choose the correct spelling for "my"', 'mein', [
              'mien',
              'meien',
              'miener',
            ]),
            typing('Type the German word: "حب"', 'Liebe'),
          ],
        },
      },
      {
        title: 'Mixed Test: Spelling & Pronunciation',
        order: 5,
        content: {
          exercises: [
            mcq('Choose the correct spelling:', 'Vogel', [
              'Fogel',
              'Vogel',
              'Wogel',
            ]),
            mcq('Choose the correct spelling:', 'Zeit', [
              'Seit',
              'Zeit',
              'Zait',
            ]),
            mcq('Choose the correct spelling:', 'Tag', ['Tak', 'Tag', 'Takk']),
            mcq('Choose the correct spelling:', 'Liebe', [
              'Leibe',
              'Liebe',
              'Libee',
            ]),
            typing('Type the correct spelling for "street" (شارع)', 'Straße'),
          ],
        },
      },
    ],
  }
}

function buildGreetingsUnit(): Unit {
  return {
    $schema: '../schema.json',
    title: 'Greetings & Introductions',
    description:
      'Master formal vs informal greetings, introductions, and everyday phrases.',
    order: 5,
    lessons: [
      buildGreetingLesson('Greetings (General)', 1),
      buildIntroduceLesson('Names & Ages (Formal vs Informal)', 2),
      {
        title: 'Where are you from?',
        order: 3,
        content: {
          exercises: [
            mcq(
              'Choose the formal question: "Where are you from?" (رسمي)',
              'Woher kommen Sie?',
              ['Woher kommst du?', 'Wie heißt du?', 'Wie geht es dir?']
            ),
            wordBank('Build the informal question: "Where are you from?"', [
              'Woher',
              'kommst',
              'du',
            ]),
            wordBank('Build the answer: "I come from Lebanon."', [
              'Ich',
              'komme',
              'aus',
              'dem',
              'Libanon',
            ]),
            mcq(
              'Pick the correct answer to "Woher kommen Sie?"',
              'Ich komme aus...',
              ['Ich heiße...', 'Ich bin ... Jahre alt', 'Wie geht es dir?']
            ),
            typing('Type: "I come from..." in German', 'Ich komme aus...'),
          ],
        },
      },
      {
        title: 'How are you?',
        order: 4,
        content: {
          exercises: [
            mcq('Formal: "How are you?" (رسمي)', 'Wie geht es Ihnen?', [
              'Wie geht es dir?',
              'Wie heißt du?',
              'Woher kommst du?',
            ]),
            mcq('Pick a polite formal reply:', 'Gut, danke. Und Ihnen?', [
              'So lala',
              'Bis morgen',
              'Wie heißt du?',
            ]),
            mcq('Pick the informal reply:', 'Gut, danke. Und dir?', [
              'Gut, danke. Und Ihnen?',
              'Auf Wiedersehen',
              'Einen schönen Tag noch',
            ]),
            wordBank('Build: "Not so good."', ['Nicht', 'so', 'gut']),
            typing('Type: "So-so" (informal)', 'So lala'),
          ],
        },
      },
      buildFarewellLesson('Farewells', 5),
    ],
  }
}

function buildAlphabetUnit(): Unit {
  const slices = [
    { title: 'Alphabet A–F', order: 1, from: 0, to: 6 },
    { title: 'Alphabet G–L', order: 2, from: 6, to: 12 },
    { title: 'Alphabet M–R', order: 3, from: 12, to: 18 },
    { title: 'Alphabet S–Z', order: 4, from: 18, to: 26 },
  ]

  const lessons = slices.map((s) =>
    buildAlphabetLesson(s.title, s.order, alphabet.slice(s.from, s.to))
  )

  const allLetters = alphabet.map((x) => x.letter)
  const allExamples = alphabet.map((x) => x.example)

  lessons.push({
    title: 'Review Quiz: Whole Alphabet',
    order: 5,
    content: {
      exercises: [
        matchPairs(
          'Match the letter to the example word',
          alphabet
            .slice(0, 8)
            .map((x) => ({ left: x.letter, right: x.example }))
        ),
        mcq('Which letter is pronounced "tset"?', 'Z', ['S', 'C', 'X']),
        mcq('Which word starts with the letter "W"?', 'Wasser', [
          'Vogel',
          'Rose',
          'Uhr',
        ]),
        typing('Type the German word for "ساعة"', 'Uhr'),
        mcq(
          'Which letter starts the word "Quelle" (مصدر)?',
          'Q',
          pickDistinct(allLetters, 4, new Set(['Q'])).slice(0, 3)
        ),
      ],
    },
  })

  return {
    $schema: '../schema.json',
    title: 'Alphabet & Letter Names',
    description:
      'Learn the German alphabet (اسم الحروف) with clear examples and Arabic meanings.',
    order: 1,
    lessons,
  }
}

function buildVowelCombosMiniUnit(): Unit {
  const comboPairs = vowelCombos.map((v) => ({ left: v.combo, right: v.sound }))
  return {
    $schema: '../schema.json',
    title: 'Vowel Combinations (Extra Practice)',
    description:
      'Extra drills for ei/ie/au/eu/äu using high-frequency example words.',
    order: 6,
    lessons: [
      {
        title: 'Match vowel combos to sounds',
        order: 1,
        content: {
          exercises: [
            matchPairs('Match the vowel combination to its sound', comboPairs),
            mcq('Which combo is "ee" like in "see"?', 'ie', ['ei', 'au', 'eu']),
            mcq('Which word contains "au"?', 'Haus', ['Liebe', 'Mai', 'neu']),
            mcq('Which word contains "eu"?', 'neu', ['Mai', 'Haus', 'Liebe']),
            typing('Type the German word for "منزل"', 'Haus'),
          ],
        },
      },
      {
        title: 'ei vs ie (Spelling drill)',
        order: 2,
        content: {
          exercises: [
            mcq('Choose the correct spelling for "love" (حب)', 'Liebe', [
              'Leibe',
              'Libee',
              'Liebee',
            ]),
            mcq('Choose the correct spelling for "May" (مايو)', 'Mai', [
              'Mie',
              'Mei',
              'May',
            ]),
            typing('Type: "mein" (my)', 'mein'),
            mcq('The sound "eye" is usually written as:', 'ei', [
              'ie',
              'eu',
              'au',
            ]),
            matchPairs('Match the word to the combo', [
              { left: 'Liebe', right: 'ie' },
              { left: 'Mai', right: 'ai' },
              { left: 'Haus', right: 'au' },
              { left: 'neu', right: 'eu' },
            ]),
          ],
        },
      },
      {
        title: 'Review Quiz: Vowels',
        order: 3,
        content: {
          exercises: [
            mcq('Pick the word with "äu"', 'Häuser', ['Haus', 'neu', 'Liebe']),
            mcq('Pick the word with "ie"', 'Liebe', ['Mai', 'neu', 'Haus']),
            mcq('Pick the word with "ei"', 'mein', ['mien', 'miener', 'mine']),
            typing('Type: "new" in German', 'neu'),
            typing('Type: "houses" in German', 'Häuser'),
          ],
        },
      },
    ],
  }
}

function buildExamUnit(): Unit {
  return {
    $schema: '../schema.json',
    title: 'Exams & Dialogues (TTS)',
    description:
      'Mixed review tests + formal/informal mini-dialogues. Listening uses browser TTS (no audio files).',
    order: 7,
    lessons: [
      {
        title: 'Exam 1: Alphabet + Special Characters',
        order: 1,
        content: {
          passingScore: 0.85,
          exercises: [
            matchPairs('Match the letter to its pronunciation', [
              { left: 'A', right: 'ah' },
              { left: 'E', right: 'ay' },
              { left: 'I', right: 'ee' },
              { left: 'J', right: 'yot' },
              { left: 'V', right: 'fow' },
              { left: 'W', right: 'vay' },
            ]),
            mcq('Which letter is pronounced "tset"?', 'Z', ['S', 'C', 'X']),
            mcq('Which word contains "Ü"?', 'Tür', ['Öl', 'Apfel', 'Rose']),
            mcq('Choose the correct spelling for "street" (شارع)', 'Straße', [
              'Strasse',
              'Strasße',
              'Strase',
            ]),
            typing('Type the German word for "تفاح" (umlaut)', 'Äpfel'),
          ],
        },
      },
      {
        title: 'Exam 2: Spelling Traps (V/W, S/Z, ei/ie)',
        order: 2,
        content: {
          passingScore: 0.85,
          exercises: [
            mcq('You hear "Fogel" — how do you spell it correctly?', 'Vogel', [
              'Fogel',
              'Wogel',
              'Vogell',
            ]),
            mcq('Wasser is pronounced like English:', 'v', ['w', 'f', 'z']),
            mcq('Which is correct for the sound "tsait"?', 'Zeit', [
              'Seit',
              'Zait',
              'Sait',
            ]),
            mcq('Choose the correct spelling for "love" (حب)', 'Liebe', [
              'Leibe',
              'Libee',
              'Liebee',
            ]),
            typing(
              'Type the correct spelling: "day" in German (sounds like "Tak")',
              'Tag'
            ),
          ],
        },
      },
      {
        title: 'Dialogue (Formal) — Sie',
        order: 3,
        content: {
          exercises: [
            listening(
              'Listen (formal) and type what you hear.',
              'Guten Tag. Wie heißen Sie?'
            ),
            listening(
              'Listen (formal) and type what you hear.',
              'Gut, danke. Und Ihnen?'
            ),
            mcq('Which question is formal? (رسمي)', 'Woher kommen Sie?', [
              'Woher kommst du?',
              'Wie geht es dir?',
              'Wie heißt du?',
            ]),
            wordBank('Build the formal question: "How are you?"', [
              'Wie',
              'geht',
              'es',
              'Ihnen',
            ]),
            typing(
              'Type the formal goodbye (face-to-face):',
              'Auf Wiedersehen'
            ),
          ],
        },
      },
      {
        title: 'Dialogue (Informal) — du',
        order: 4,
        content: {
          exercises: [
            listening(
              'Listen (informal) and type what you hear.',
              'Hi! Wie heißt du?'
            ),
            listening(
              'Listen (informal) and type what you hear.',
              'Gut, danke. Und dir?'
            ),
            mcq(
              'Pick the informal question: "Where are you from?" (غير رسمي)',
              'Woher kommst du?',
              ['Woher kommen Sie?', 'Wie heißen Sie?', 'Wie geht es Ihnen?']
            ),
            wordBank('Build: "See you tomorrow"', ['Bis', 'morgen']),
            typing('Type the informal goodbye:', 'Tschüss'),
          ],
        },
      },
      {
        title: 'Final Exam: Mixed Review',
        order: 5,
        content: {
          passingScore: 0.9,
          exercises: [
            mcq('Which pattern is pronounced "sh"?', 'sch', ['sp', 'st', 'ch']),
            mcq('Z is always pronounced:', 'ts', ['z', 's', 'sh']),
            mcq('Which word contains "äu"?', 'Häuser', [
              'Haus',
              'neu',
              'Liebe',
            ]),
            mcq('Choose the correct spelling:', 'Wasser', [
              'Vasser',
              'Waser',
              'Wasser',
            ]),
            listening('Listen and type what you hear.', 'Guten Morgen!'),
            typing('Type the German word for "منزل"', 'Haus'),
            matchPairs('Match the combination to the sound', [
              { left: 'ie', right: 'ee (see)' },
              { left: 'ei', right: 'eye (my)' },
              { left: 'au', right: 'ow (cow)' },
              { left: 'eu', right: 'oy (boy)' },
            ]),
            mcq('Pick the formal farewell on the phone:', 'Auf Wiederhören', [
              'Auf Wiedersehen',
              'Tschüss',
              'Bis dann',
            ]),
          ],
        },
      },
    ],
  }
}

function buildUnits(): Unit[] {
  return [
    buildAlphabetUnit(),
    buildSpecialCharsUnit(),
    buildConsonantUnit(),
    buildRulesUnit(),
    buildGreetingsUnit(),
    buildVowelCombosMiniUnit(),
    buildExamUnit(),
  ]
}

async function writeUnits(units: Unit[]) {
  const outDir = path.resolve(process.cwd(), 'content/units')
  await fs.mkdir(outDir, { recursive: true })

  // Remove existing JSON files so the curriculum is truly "from scratch".
  const existing = await fs.readdir(outDir)
  await Promise.all(
    existing
      .filter((f) => f.toLowerCase().endsWith('.json'))
      .map((f) => fs.unlink(path.join(outDir, f)))
  )

  for (const unit of units) {
    const filename = `${unit.order.toString().padStart(2, '0')}_${unit.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')}.json`

    const full = path.join(outDir, filename)
    const withSchema = { ...unit, $schema: unit.$schema ?? '../schema.json' }

    // Validate before writing.
    UnitFileSchema.parse(withSchema)
    await fs.writeFile(
      full,
      JSON.stringify(withSchema, null, 2) + '\n',
      'utf-8'
    )
    console.log('Wrote', path.relative(process.cwd(), full))
  }
}

async function main() {
  loadEnv({ path: path.resolve(process.cwd(), '.env.local') })
  loadEnv({ path: path.resolve(process.cwd(), '.env') })

  const units = buildUnits()
  await writeUnits(units)

  console.log(`\nDone. Generated ${units.length} units.`)
  console.log(
    'Next: run `npm run seed:dry` to validate, then `npm run seed` to seed.'
  )
  console.log(
    'Tip: add `--reset` to seed to wipe units/lessons first (destructive).'
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
