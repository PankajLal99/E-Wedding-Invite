import { useMemo } from 'react'
import { getSiteContent } from '../config/site'
import { useHostFamily } from './useHostFamily'

export function useSite() {
  const family = useHostFamily()
  return useMemo(() => getSiteContent(family.id), [family.id])
}
