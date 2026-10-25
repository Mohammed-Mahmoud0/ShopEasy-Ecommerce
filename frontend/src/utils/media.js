import { API_ORIGIN } from '../api/client'

export const resolveMediaUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${API_ORIGIN}${url}`
}
