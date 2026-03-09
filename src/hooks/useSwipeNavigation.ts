import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
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
    suppressClick: false,
  })

  function finishGesture(endX: number, endY: number) {
    if (!gesture.current.active) {
      return
    }

    const deltaX = endX - gesture.current.startX
    const deltaY = endY - gesture.current.startY
    gesture.current.active = false
    gesture.current.suppressClick = false

    if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
      return
    }

    gesture.current.suppressClick = true

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
      if (target?.closest('input, select, textarea')) {
        gesture.current.active = false
        return
      }

      gesture.current = {
        startX: event.clientX,
        startY: event.clientY,
        active: true,
        suppressClick: false,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerMove(event: ReactPointerEvent<HTMLElement>) {
      if (!gesture.current.active) {
        return
      }

      const deltaX = event.clientX - gesture.current.startX
      const deltaY = event.clientY - gesture.current.startY

      if (Math.abs(deltaX) > 12 && Math.abs(deltaX) > Math.abs(deltaY) * 1.05) {
        event.preventDefault()
      }
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      finishGesture(event.clientX, event.clientY)
    },
    onPointerCancel() {
      gesture.current.active = false
      gesture.current.suppressClick = false
    },
    onClickCapture(event: ReactMouseEvent<HTMLElement>) {
      if (!gesture.current.suppressClick) {
        return
      }

      gesture.current.suppressClick = false
      event.preventDefault()
      event.stopPropagation()
    },
  }
}
