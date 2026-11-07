import { useMemo } from 'react'
import {
  hostFamilyConfig,
  resolveHostFamily,
  type HostFamilyConfig,
} from '../config/sides'

export function useHostFamily(): HostFamilyConfig {
  return useMemo(
    () => hostFamilyConfig(resolveHostFamily(window.location.search)),
    []
  )
}
