import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "vytals-user-preferences"

const initialState = {
  // Only store user convenience data, not business logic
  customerToken: null,
  // Keep these for form convenience only
  lastMobile: "",
  lastEmail: "",
}

const VerificationStoreContext = createContext(null)

export function VerificationStoreProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return initialState
      const parsed = JSON.parse(raw)
      return { ...initialState, ...parsed }
    } catch {
      // Ignore malformed local storage payload and use defaults.
      return initialState
    }
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const setCustomerToken = useCallback((token) => {
    setState((prev) => ({ ...prev, customerToken: token }))
    // Also store in separate localStorage key for persistence
    if (token) {
      localStorage.setItem('vytals-user-token', token)
    } else {
      localStorage.removeItem('vytals-user-token')
    }
  }, [])

  const setLastMobile = useCallback((mobile) => {
    setState((prev) => ({ ...prev, lastMobile: mobile }))
  }, [])

  const setLastEmail = useCallback((email) => {
    setState((prev) => ({ ...prev, lastEmail: email }))
  }, [])

  const clearUserData = useCallback(() => {
    setState(initialState)
    localStorage.removeItem('vytals-user-token')
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      setCustomerToken,
      setLastMobile,
      setLastEmail,
      clearUserData,
    }),
    [state, setCustomerToken, setLastMobile, setLastEmail, clearUserData],
  )

  return <VerificationStoreContext.Provider value={value}>{children}</VerificationStoreContext.Provider>
}

export function useVerificationStore() {
  const context = useContext(VerificationStoreContext)
  if (!context) throw new Error("useVerificationStore must be used inside VerificationStoreProvider")
  return context
}
