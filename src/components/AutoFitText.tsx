import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type FitCacheEntry = {
  fontSize: number
  width: number
  height: number
}

type FitState = {
  cacheKey: string
  fontSize: number
}

type AutoFitTextProps = {
  children: ReactNode
  containerClassName?: string
  textClassName?: string
  fitKey: string
  contentKey?: string
  minFontSize: number
  maxFontSize: number
  lineHeight?: number
  multiline?: boolean
  safePaddingX?: number
  safePaddingY?: number
}

const fitCache = new Map<string, FitCacheEntry>()
const fitSlotCache = new Map<string, number>()

function getInitialFontSize(fitKey: string, cacheKey: string, maxFontSize: number) {
  return fitCache.get(cacheKey)?.fontSize ?? fitSlotCache.get(fitKey) ?? maxFontSize
}

export function AutoFitText({
  children,
  containerClassName = '',
  textClassName = '',
  fitKey,
  contentKey,
  minFontSize,
  maxFontSize,
  lineHeight = 1.1,
  multiline = true,
  safePaddingX = 0,
  safePaddingY = 0,
}: AutoFitTextProps) {
  const cacheKey = contentKey ? `${fitKey}::${contentKey}` : fitKey
  const containerRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLDivElement | null>(null)
  const [fitState, setFitState] = useState<FitState>(() => ({
    cacheKey,
    fontSize: getInitialFontSize(fitKey, cacheKey, maxFontSize),
  }))
  const fontSize =
    fitState.cacheKey === cacheKey
      ? fitState.fontSize
      : getInitialFontSize(fitKey, cacheKey, maxFontSize)

  useLayoutEffect(() => {
    const container = containerRef.current
    const text = textRef.current

    if (!container || !text) {
      return
    }

    let frameId = 0

    const fitText = () => {
      const availableWidth = Math.max(0, container.clientWidth - safePaddingX * 2)
      const availableHeight = Math.max(0, container.clientHeight - safePaddingY * 2)

      if (!availableWidth || !availableHeight) {
        return
      }

      let low = minFontSize
      let high = maxFontSize
      let best = minFontSize

      while (low <= high) {
        const probe = Math.floor((low + high) / 2)
        text.style.fontSize = `${probe}px`
        text.style.lineHeight = String(lineHeight)
        text.style.whiteSpace = multiline ? 'normal' : 'nowrap'
        text.style.width = multiline ? '100%' : 'auto'

        const fits =
          text.scrollWidth <= availableWidth + 1 && text.scrollHeight <= availableHeight + 1

        if (fits) {
          best = probe
          low = probe + 1
        } else {
          high = probe - 1
        }
      }

      fitCache.set(cacheKey, {
        fontSize: best,
        width: availableWidth,
        height: availableHeight,
      })
      fitSlotCache.set(fitKey, best)
      setFitState({
        cacheKey,
        fontSize: best,
      })
    }

    const scheduleFit = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(fitText)
    }

    const cached = fitCache.get(cacheKey)
    const width = container.clientWidth
    const height = container.clientHeight

    if (!(cached && Math.abs(cached.width - width) <= 1 && Math.abs(cached.height - height) <= 1)) {
      scheduleFit()
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      const nextWidth = Math.round(entry.contentRect.width)
      const nextHeight = Math.round(entry.contentRect.height)
      const nextCached = fitCache.get(cacheKey)

      if (
        nextCached &&
        Math.abs(nextCached.width - nextWidth) <= 1 &&
        Math.abs(nextCached.height - nextHeight) <= 1
      ) {
        return
      }

      scheduleFit()
    })
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
    }
  }, [cacheKey, fitKey, lineHeight, maxFontSize, minFontSize, multiline, safePaddingX, safePaddingY])

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full items-center justify-center overflow-hidden ${containerClassName}`.trim()}
    >
      <div
        ref={textRef}
        className={textClassName}
        style={{
          fontSize,
          lineHeight,
          whiteSpace: multiline ? 'normal' : 'nowrap',
          width: multiline ? '100%' : 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}
