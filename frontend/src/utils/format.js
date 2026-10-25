const localeFor = (lang) => (lang === 'ar' ? 'ar-EG' : 'en-US')

export const formatMoney = (value, lang = 'en') =>
  new Intl.NumberFormat(localeFor(lang), {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

export const formatDate = (value, lang = 'en') => {
  if (!value) return ''
  return new Intl.DateTimeFormat(localeFor(lang), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export const formatDateTime = (value, lang = 'en') => {
  if (!value) return ''
  return new Intl.DateTimeFormat(localeFor(lang), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export const getApiErrorMessage = (error) => {
  if (!error) return 'Something went wrong'
  if (typeof error === 'string') return error
  if (Array.isArray(error)) return error.join(' ')
  if (error.fields && Object.keys(error.fields).length > 0) {
    return Object.entries(error.fields).map(([field, message]) => `${field}: ${message}`).join(' · ')
  }
  if (error.detail) return error.detail
  if (error.message) return error.message
  if (error.error) return error.error

  const firstKey = Object.keys(error)[0]
  const firstValue = error[firstKey]
  if (Array.isArray(firstValue)) return `${firstKey}: ${firstValue.join(' ')}`
  if (typeof firstValue === 'string') return `${firstKey}: ${firstValue}`
  if (firstValue && typeof firstValue === 'object') {
    return getApiErrorMessage(firstValue)
  }
  return 'Something went wrong'
}

// Convenience for pulling a readable message straight off a thrown error.
export const errorMessage = (error) =>
  getApiErrorMessage(error?.data ?? error?.message ?? error)
