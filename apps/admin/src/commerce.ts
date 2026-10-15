import { localApi } from '../../../packages/commerce/client'
export * from '../../../packages/commerce/client'
const configuredApi = import.meta.env.VITE_COMMERCE_API_URL || (import.meta.env.DEV ? localApi : '')
// Keep Development cookies same-site when opening the panel on either loopback alias.
// Production and explicitly configured non-loopback services are never rewritten.
export const commerceApi = (() => {
  if (!import.meta.env.DEV || !configuredApi || typeof location === 'undefined') return configuredApi
  const loopback = (host: string) => host === 'localhost' || host === '127.0.0.1'
  const url = new URL(configuredApi, location.origin)
  if (loopback(location.hostname) && loopback(url.hostname)) url.hostname = location.hostname
  return url.toString().replace(/\/$/, '')
})()
