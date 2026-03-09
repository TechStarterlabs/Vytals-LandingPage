import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive"
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            variant === 'destructive' ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <AlertTriangle className={`h-6 w-6 ${
              variant === 'destructive' ? 'text-red-600' : 'text-yellow-600'
            }`} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-300"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={variant === 'destructive' 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-[#11b5b2] hover:bg-[#0fa09d] text-white'
            }
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
