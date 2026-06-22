const rawPythonApiBaseUrl = import.meta.env.VITE_PYTHON_API_BASE_URL ?? '/api/python'

export const PYTHON_API_BASE_URL = rawPythonApiBaseUrl.replace(/\/$/, '')

export function pythonApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${PYTHON_API_BASE_URL}${normalizedPath}`
}