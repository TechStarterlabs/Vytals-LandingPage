import { useState } from "react"

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState({})
  const [resolvePromise, setResolvePromise] = useState(null)

  const confirm = (options = {}) => {
    setConfig({
      title: options.title || "Confirm Action",
      message: options.message || "Are you sure you want to proceed?",
      confirmText: options.confirmText || "Confirm",
      cancelText: options.cancelText || "Cancel",
      variant: options.variant || "destructive"
    })
    setIsOpen(true)

    return new Promise((resolve) => {
      setResolvePromise(() => resolve)
    })
  }

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true)
    }
    setIsOpen(false)
  }

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false)
    }
    setIsOpen(false)
  }

  return {
    confirm,
    isOpen,
    config,
    handleConfirm,
    handleCancel
  }
}
