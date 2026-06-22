const rawNodeApiBaseUrl = import.meta.env.VITE_NODE_API_BASE_URL ?? '/api/node'

export const NODE_API_BASE_URL = rawNodeApiBaseUrl.replace(/\/$/, '')

export function nodeApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${NODE_API_BASE_URL}${normalizedPath}`
}