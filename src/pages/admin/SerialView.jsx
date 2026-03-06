import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, Package, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function SerialView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [serial, setSerial] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSerial()
  }, [id])

  const fetchSerial = async () => {
    try {
      const response = await apiClient.get(`/admin/serials/${id}`)
      setSerial(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load serial number details",
        variant: "destructive"
      })
      navigate('/admin/serials')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this serial number? This action cannot be undone.")) return
    
    try {
      await apiClient.delete(`/admin/serials/${id}`)
      toast({
        title: "Success",
        description: "Serial number deleted successfully",
        variant: "success"
      })
      navigate("/admin/serials")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete serial number. It may have been verified.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!serial) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Serial number not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/serials")}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Serial Number Details</h1>
            <p className="text-sm text-gray-500 mt-1">View serial number information</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!serial.is_verified && (
            <>
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/serials/${id}/edit`)}
                className="border-gray-300"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Serial Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
          <h2 className="text-lg font-semibold text-white">Serial Number Information</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">Serial Number</label>
            <p className="mt-1 text-xl text-gray-900 font-mono">{serial.serial_number}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Batch Code</label>
            <p className="mt-1 text-base text-gray-900 font-mono">{serial.batch?.batch_code || '-'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Product</label>
            <p className="mt-1 text-base text-gray-900">{serial.batch?.product?.name || '-'}</p>
            <p className="text-xs text-gray-500">{serial.batch?.product?.product_code || '-'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Verification Status</label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                serial.is_verified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {serial.is_verified ? "✓ Verified" : "Not Verified"}
              </span>
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Verified Date</label>
            <p className="mt-1 text-base text-gray-900">
              {serial.verified_at ? new Date(serial.verified_at).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '-'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Created Date</label>
            <p className="mt-1 text-base text-gray-900">
              {serial.created_at ? new Date(serial.created_at).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              }) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Verified By Info */}
      {serial.is_verified && serial.verified_by && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 border-b">
            <h2 className="text-lg font-semibold text-white">Verification Details</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Customer Name</label>
              <p className="mt-1 text-base text-gray-900">{serial.verified_by.name || '-'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Mobile Number</label>
              <p className="mt-1 text-base text-gray-900">{serial.verified_by.mobile_number || '-'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-base text-gray-900">{serial.verified_by.email || '-'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Points Awarded</label>
              <p className="mt-1 text-base text-gray-900">10 points</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate(`/admin/batches/${serial.batch?.batch_id}`)}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          disabled={!serial.batch?.batch_id}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">View Batch</p>
              <p className="text-lg font-bold text-gray-900">{serial.batch?.batch_code || '-'}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            // Generate QR code or show QR URL
            toast({
              title: "Info",
              description: "QR code generation coming soon",
            })
          }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">QR Code</p>
              <p className="text-lg font-bold text-gray-900">Generate QR</p>
            </div>
          </div>
        </button>
      </div>

      {/* Warning for Verified Serials */}
      {serial.is_verified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Verified Serial Number</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>This serial number has been verified by a customer and cannot be edited or deleted.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
