import { useEffect, useState } from 'react'
import { getProgress, saveProgress } from '../lib/db'
import {
  clampIndex,
  createDefaultProgress,
  getGroupSnapshot,
  normalizeCompletedOrders,
} from '../lib/study'
import type { StudyProgress } from '../types'

type UseStudySessionOptions = {
  deckId: string
  entryCount: number
  groupSize: number
}

export function useStudySession({ deckId, entryCount, groupSize }: UseStudySessionOptions) {
  const [completedEntryOrders, setCompletedEntryOrders] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [updatedAt, setUpdatedAt] = useState(0)
  const [hydratedDeckId, setHydratedDeckId] = useState<string | null>(null)

  useEffect(() => {
    if (!deckId) {
      return
    }

    let cancelled = false

    void (async () => {
      const stored = (await getProgress(deckId)) ?? createDefaultProgress(deckId)
      const normalizedCompleted = normalizeCompletedOrders(stored.completedEntryOrders, entryCount)
      const normalizedCurrentIndex = clampIndex(stored.currentEntryOrder, entryCount)
      const hydratedCompleted = normalizedCompleted.includes(normalizedCurrentIndex)
        ? normalizedCompleted
        : normalizeCompletedOrders([...normalizedCompleted, normalizedCurrentIndex], entryCount)

      if (cancelled) {
        return
      }

      setCompletedEntryOrders(hydratedCompleted)
      setCurrentIndex(normalizedCurrentIndex)
      setUpdatedAt(stored.updatedAt)
      setHydratedDeckId(deckId)
    })()

    return () => {
      cancelled = true
    }
  }, [deckId, entryCount])

  useEffect(() => {
    if (!deckId || entryCount === 0 || hydratedDeckId !== deckId) {
      return
    }

    const nextProgress: StudyProgress = {
      deckId,
      currentEntryOrder: clampIndex(currentIndex, entryCount),
      completedEntryOrders: normalizeCompletedOrders(completedEntryOrders, entryCount),
      updatedAt: Date.now(),
    }

    void saveProgress(nextProgress).then(() => {
      setUpdatedAt(nextProgress.updatedAt)
    })
  }, [completedEntryOrders, currentIndex, deckId, entryCount, hydratedDeckId])

  function visitIndex(nextIndex: number) {
    const normalizedIndex = clampIndex(nextIndex, entryCount)
    setCurrentIndex(normalizedIndex)
    setCompletedEntryOrders((current) => {
      if (current.includes(normalizedIndex)) {
        return current
      }

      return [...current, normalizedIndex].sort((left, right) => left - right)
    })
  }

  function goToIndex(nextIndex: number, nextDirection: 1 | -1) {
    if (entryCount === 0) {
      return
    }
    setDirection(nextDirection)
    visitIndex(nextIndex)
  }

  function goPrev() {
    goToIndex(currentIndex - 1, -1)
  }

  function goNext() {
    goToIndex(currentIndex + 1, 1)
  }

  function goPrevGroup() {
    const previousGroupStart = Math.max(0, Math.floor((currentIndex - groupSize) / groupSize) * groupSize)
    goToIndex(previousGroupStart, -1)
  }

  function goNextGroup() {
    const nextGroupStart = Math.min(
      Math.floor((currentIndex + groupSize) / groupSize) * groupSize,
      Math.max(entryCount - 1, 0),
    )
    goToIndex(nextGroupStart, 1)
  }

  function goToGroup(groupNumber: number) {
    if (entryCount === 0) {
      return
    }

    const safeGroupNumber = Math.max(1, Math.min(groupNumber, Math.ceil(entryCount / groupSize)))
    const targetIndex = (safeGroupNumber - 1) * Math.max(groupSize, 1)
    const nextDirection: 1 | -1 = targetIndex >= currentIndex ? 1 : -1
    goToIndex(targetIndex, nextDirection)
  }

  return {
    progress: deckId
      ? {
          deckId,
          currentEntryOrder: clampIndex(currentIndex, entryCount),
          completedEntryOrders,
          updatedAt,
        }
      : null,
    currentIndex,
    direction,
    goPrev,
    goNext,
    goPrevGroup,
    goNextGroup,
    goToGroup,
    groupSnapshot: getGroupSnapshot(
      entryCount,
      currentIndex,
      groupSize,
      completedEntryOrders,
    ),
  }
}
