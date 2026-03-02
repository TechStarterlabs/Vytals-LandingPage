import { createContext, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "spunge-verification-state-v1"

const initialState = {
  serialNumber: "",
  batchId: "",
  homeCompleted: false,
  otpVerified: false,
  emailVerified: false,
}

const VerificationStoreContext = createContext(null)

export function VerificationStoreProvider({ children }) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      setState((prev) => ({ ...prev, ...parsed }))
    } catch {
      // Ignore malformed local storage payload.
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo(
    () => ({
      ...state,
      setSerialAndBatch(serialNumber, batchId) {
        setState((prev) => ({ ...prev, serialNumber, batchId }))
      },
      setHomeCompleted(completed) {
        setState((prev) => ({ ...prev, homeCompleted: completed }))
      },
      setOtpVerified(verified) {
        setState((prev) => ({ ...prev, otpVerified: verified }))
      },
      setEmailVerified(verified) {
        setState((prev) => ({ ...prev, emailVerified: verified }))
      },
      resetVerification() {
        setState(initialState)
      },
    }),
    [state],
  )

  return <VerificationStoreContext.Provider value={value}>{children}</VerificationStoreContext.Provider>
}

export function useVerificationStore() {
  const context = useContext(VerificationStoreContext)
  if (!context) throw new Error("useVerificationStore must be used inside VerificationStoreProvider")
  return context
}
