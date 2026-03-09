import type { PointerEvent as ReactPointerEvent } from 'react'
import { useRef } from 'react'

type SwipeNavigationOptions = {
  onNext: () => void
  onPrev: () => void
  threshold?: number
}

export function useSwipeNavigation({
  onNext,
  onPrev,
  threshold = 70,
}: SwipeNavigationOptions) {
  const gesture = useRef({
    startX: 0,
    startY: 0,
    active: false,
  })

  function finishGesture(endX: number, endY: number) {
    if (!gesture.current.active) {
      return
    }

    const deltaX = endX - gesture.current.startX
    const deltaY = endY - gesture.current.startY
    gesture.current.active = false

    if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
      return
    }

    if (deltaX < 0) {
      onNext()
      return
    }

    onPrev()
  }

  return {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return
      }

      const target = event.target as HTMLElement | null
      if (target?.closest('button, input, select, textarea, a, label')) {
        gesture.current.active = false
        return
      }

      gesture.current = {
        startX: event.clientX,
        startY: event.clientY,
        active: true,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      finishGesture(event.clientX, event.clientY)
    },
    onPointerCancel() {
      gesture.current.active = false
    },
  }
}
