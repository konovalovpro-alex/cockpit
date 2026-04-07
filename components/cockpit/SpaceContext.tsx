'use client'

import { createContext, useContext, useState } from 'react'
import type { Space } from '@/types'

interface SpaceContextValue {
  activeSpace: Space | null
  setActiveSpace: (s: Space | null) => void
}

const SpaceContext = createContext<SpaceContextValue>({ activeSpace: null, setActiveSpace: () => {} })

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const [activeSpace, setActiveSpace] = useState<Space | null>(null)
  return (
    <SpaceContext.Provider value={{ activeSpace, setActiveSpace }}>
      {children}
    </SpaceContext.Provider>
  )
}

export const useSpaceContext = () => useContext(SpaceContext)
