import { localApi } from '../../../packages/commerce/client'
export * from '../../../packages/commerce/client'
export const commerceApi = import.meta.env.VITE_COMMERCE_API_URL || (import.meta.env.DEV ? localApi : '')
