import { describe, expect, it } from 'vitest'
import { clampIndex, getGroupSnapshot, normalizeCompletedOrders } from './study'

describe('study helpers', () => {
  it('clamps indexes to the available entry range', () => {
    expect(clampIndex(-3, 10)).toBe(0)
    expect(clampIndex(12, 10)).toBe(9)
    expect(clampIndex(0, 0)).toBe(0)
  })

  it('normalizes completion arrays', () => {
    expect(normalizeCompletedOrders([2, 2, -1, 99, 0], 5)).toEqual([0, 2])
  })

  it('computes group progress dynamically from completed cards', () => {
    expect(getGroupSnapshot(45, 22, 20, [0, 1, 2, 20, 21, 22])).toMatchObject({
      currentGroupNumber: 2,
      totalGroups: 3,
      currentIndexInGroup: 3,
      currentGroupSize: 20,
      currentGroupCompleted: 3,
      completedEntries: 6,
    })
  })
})
