import type { GroupSnapshot, StudyProgress } from '../types'

export function clampIndex(index: number, entryCount: number): number {
  if (entryCount <= 0) {
    return 0
  }

  return Math.min(Math.max(index, 0), entryCount - 1)
}

export function normalizeCompletedOrders(
  completedEntryOrders: number[],
  entryCount: number,
): number[] {
  const normalized = new Set<number>()

  for (const value of completedEntryOrders) {
    if (!Number.isInteger(value)) {
      continue
    }

    if (value < 0 || value >= entryCount) {
      continue
    }

    normalized.add(value)
  }

  return Array.from(normalized).sort((left, right) => left - right)
}

export function createDefaultProgress(deckId: string): StudyProgress {
  return {
    deckId,
    currentEntryOrder: 0,
    completedEntryOrders: [],
    updatedAt: Date.now(),
  }
}

export function getGroupSnapshot(
  entryCount: number,
  currentIndex: number,
  groupSize: number,
  completedEntryOrders: number[],
): GroupSnapshot {
  const safeEntryCount = Math.max(entryCount, 0)
  const safeGroupSize = Math.max(groupSize, 1)
  const totalGroups = Math.max(1, Math.ceil(safeEntryCount / safeGroupSize))
  const safeIndex = clampIndex(currentIndex, safeEntryCount)
  const currentGroupZeroIndex = Math.min(Math.floor(safeIndex / safeGroupSize), totalGroups - 1)
  const currentGroupStart = currentGroupZeroIndex * safeGroupSize
  const currentGroupEnd = Math.min(currentGroupStart + safeGroupSize, safeEntryCount)
  const normalizedCompleted = normalizeCompletedOrders(completedEntryOrders, safeEntryCount)

  let currentGroupCompleted = 0
  for (const order of normalizedCompleted) {
    if (order >= currentGroupStart && order < currentGroupEnd) {
      currentGroupCompleted += 1
    }
  }

  return {
    currentGroupNumber: currentGroupZeroIndex + 1,
    totalGroups,
    currentIndexInGroup: safeEntryCount === 0 ? 0 : safeIndex - currentGroupStart + 1,
    currentGroupSize: Math.max(currentGroupEnd - currentGroupStart, 0),
    currentGroupCompleted,
    currentGroupStart,
    currentGroupEnd,
    completedEntries: normalizedCompleted.length,
    totalEntries: safeEntryCount,
  }
}

export function getDeckCompletionRatio(entryCount: number, completedEntryOrders: number[]): number {
  if (entryCount <= 0) {
    return 0
  }

  return normalizeCompletedOrders(completedEntryOrders, entryCount).length / entryCount
}
