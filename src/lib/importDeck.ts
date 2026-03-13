import type { DeckRecord, VocabEntry } from '../types'

function normalizeCell(value: unknown): string {
  return String(value ?? '').trim()
}

export function looksLikeHeaderRow(row: string[]): boolean {
  const joined = row
    .slice(0, 4)
    .join('|')
    .toLowerCase()

  return (
    joined.includes('英语') ||
    joined.includes('english') ||
    joined.includes('日语') ||
    joined.includes('japanese')
  )
}

export function rowsToEntries(rows: unknown[][], deckId: string): VocabEntry[] {
  const hasUsableFourthColumn = rows.some((row) => normalizeCell(row[3]).length > 0)
  if (!hasUsableFourthColumn) {
    throw new Error('The workbook needs four columns: English, English sentence, Japanese, and Japanese sentence.')
  }

  const normalizedRows = rows.map((row) =>
    Array.from({ length: 4 }, (_, index) => normalizeCell(row[index])),
  )

  const hasFourMappedColumns = normalizedRows.some((row) => row.some((cell) => cell))
  if (!hasFourMappedColumns) {
    throw new Error('The selected sheet does not contain four usable columns.')
  }

  const startIndex = normalizedRows[0] && looksLikeHeaderRow(normalizedRows[0]) ? 1 : 0
  const entries: VocabEntry[] = []

  for (let index = startIndex; index < normalizedRows.length; index += 1) {
    const [english, englishSentence, japanese, japaneseSentence] = normalizedRows[index]
    if (!english) {
      continue
    }

    entries.push({
      id: `${deckId}::${entries.length + 1}`,
      deckId,
      order: entries.length,
      english,
      englishSentence,
      japanese,
      japaneseSentence,
      origin: 'seed',
    })
  }

  if (entries.length === 0) {
    throw new Error('No vocabulary rows were found in this workbook.')
  }

  return entries
}

function toDeckId(baseName: string): string {
  const slug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `imported-${slug || 'deck'}-${Date.now()}`
}

export async function createImportedDeck(file: File): Promise<{
  deck: DeckRecord
  entries: VocabEntry[]
}> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const sheetName = workbook.SheetNames.includes('list 1') ? 'list 1' : workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  if (!sheet) {
    throw new Error('The workbook does not contain a readable sheet.')
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    blankrows: false,
  })
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'Imported Deck'
  const deckId = toDeckId(baseName)
  const entries = rowsToEntries(rows, deckId)
  const timestamp = Date.now()

  return {
    deck: {
      id: deckId,
      name: baseName,
      source: 'imported',
      version: String(timestamp),
      entryCount: entries.length,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    entries,
  }
}
