import { useEffect, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key)
    if (storedValue === null) return initialValue

    try {
      return JSON.parse(storedValue)
    } catch {
      return storedValue
    }
  })

  useEffect(() => {
    if (value === null || value === undefined || value === '') {
      localStorage.removeItem(key)
      return
    }

    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
