import { useCallback, useEffect, useState } from 'react'

/**
 * Loads data with `loader` (wrap it in useCallback) and loads again when `key` changes or
 * `reload()` is called. The previous data stays visible while the next request runs.
 */
export function useRemoteData(key, loader) {
  const [version, setVersion] = useState(0)
  const requestKey = `${key}#${version}`
  const [result, setResult] = useState({ requestKey: null, data: null, error: null })

  useEffect(() => {
    let active = true
    loader().then(
      (data) => {
        if (active) setResult({ requestKey, data, error: null })
      },
      (error) => {
        if (active) setResult({ requestKey, data: null, error })
      },
    )
    return () => {
      active = false
    }
  }, [requestKey, loader])

  const reload = useCallback(() => setVersion((current) => current + 1), [])
  const loading = result.requestKey !== requestKey
  return { data: result.data, error: loading ? null : result.error, loading, reload }
}
