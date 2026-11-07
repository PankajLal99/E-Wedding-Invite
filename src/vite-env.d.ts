/// <reference types="vite/client" />

interface ContactInfo {
  name?: string[] | string
  tel?: string[] | string
  email?: string[] | string
}

interface ContactsManager {
  select(
    properties: string[],
    options?: { multiple?: boolean }
  ): Promise<ContactInfo[]>
  getProperties?: () => Promise<string[]>
}

interface NavigatorUAData {
  mobile?: boolean
  brands?: Array<{ brand: string; version: string }>
  getHighEntropyValues?: (
    hints: string[]
  ) => Promise<{ model?: string; platform?: string }>
}

interface Navigator {
  contacts?: ContactsManager
  userAgentData?: NavigatorUAData
}
