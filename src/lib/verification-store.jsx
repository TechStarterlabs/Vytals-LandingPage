import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "spunge-verification-state-v1"

const initialState = {
  serialNumber: "",
  batchId: "",
  homeCompleted: false,
  otpVerified: false,
  emailVerified: false,
  productData: null,
  userData: null,
  coaData: null,
  customerToken: null,
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

  const setSerialAndBatch = useCallback((serialNumber, batchId) => {
    setState((prev) => ({ ...prev, serialNumber, batchId }))
  }, [])

  const setHomeCompleted = useCallback((completed) => {
    setState((prev) => ({ ...prev, homeCompleted: completed }))
  }, [])

  const setOtpVerified = useCallback((verified) => {
    setState((prev) => ({ ...prev, otpVerified: verified }))
  }, [])

  const setEmailVerified = useCallback((verified) => {
    setState((prev) => ({ ...prev, emailVerified: verified }))
  }, [])

  const setProductData = useCallback((productData) => {
    setState((prev) => ({ ...prev, productData }))
  }, [])

  const setUserData = useCallback((userData) => {
    setState((prev) => ({ ...prev, userData }))
  }, [])

  const setCoaData = useCallback((coaData) => {
    setState((prev) => ({ ...prev, coaData }))
  }, [])

  const setCustomerToken = useCallback((token) => {
    setState((prev) => ({ ...prev, customerToken: token }))
  }, [])

  const resetVerification = useCallback(() => {
    setState(initialState)
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      setSerialAndBatch,
      setHomeCompleted,
      setOtpVerified,
      setEmailVerified,
      setProductData,
      setUserData,
      setCoaData,
      setCustomerToken,
      resetVerification,
    }),
    [state, resetVerification, setCoaData, setCustomerToken, setEmailVerified, setHomeCompleted, setOtpVerified, setProductData, setSerialAndBatch, setUserData],
  )

  return <VerificationStoreContext.Provider value={value}>{children}</VerificationStoreContext.Provider>
}

export function useVerificationStore() {
  const context = useContext(VerificationStoreContext)
  if (!context) throw new Error("useVerificationStore must be used inside VerificationStoreProvider")
  return context
}
