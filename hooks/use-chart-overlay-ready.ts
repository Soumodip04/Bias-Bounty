"use client"

import { useEffect, useState } from "react"

// Ensures charts mount only after the overlay has a measurable size.
// Uses double requestAnimationFrame, then triggers a window resize so
// Recharts' ResponsiveContainer re-measures correctly.
export function useChartOverlayReady(isOpen: boolean) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setReady(false)
      return
    }

    let raf1 = 0 as number
    let raf2 = 0 as number

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setReady(true)
        try {
          window.dispatchEvent(new Event("resize"))
        } catch {}
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      setReady(false)
    }
  }, [isOpen])

  return ready
}