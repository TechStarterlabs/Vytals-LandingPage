import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
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
        description: "Failed to load serial details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this serial number?")) return
    
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
        description: error.message || "Failed to delete serial number",
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Serial Number Details</h1>
            <p className="text-sm text-gray-500 mt-1">View serial number information</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/serials/${id}/edit`)}
            className="border-gray-300 flex-1 sm:flex-none"
            disabled={serial.is_coa_unlocked}
            title={serial.is_coa_unlocked ? "COA unlocked serials cannot be edited" : "Edit serial"}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="border-red-300 text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
            disabled={serial.is_coa_unlocked}
            title={serial.is_coa_unlocked ? "COA unlocked serials cannot be deleted" : "Delete serial"}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Serial Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
          <h2 className="text-lg font-semibold text-white">Serial Number Information</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Serial Number</label>
            <p className="mt-1 text-base text-gray-900 font-mono">{serial.serial_number}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Batch Code</label>
            <p className="mt-1 text-base text-gray-900">{serial.batch?.batch_code || "N/A"}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Product</label>
            <p className="mt-1 text-base text-gray-900">{serial.batch?.product?.name || "N/A"}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Product Code</label>
            <p className="mt-1 text-base text-gray-900">{serial.batch?.product?.product_code || "N/A"}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Verification Status</label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                serial.is_coa_unlocked 
                  ? "bg-green-100 text-green-800" 
                  : serial.is_scanned 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-gray-100 text-gray-800"
              }`}>
                {serial.is_coa_unlocked ? "COA Unlocked" : serial.is_scanned ? "Scanned" : "Unscanned"}
              </span>
            </p>
          </div>
          
          {serial.is_scanned && serial.scanned_at && (
            <div>
              <label className="text-sm font-medium text-gray-500">Scanned At</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(serial.scanned_at).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
          
          {serial.is_coa_unlocked && serial.coa_unlocked_at && (
            <div>
              <label className="text-sm font-medium text-gray-500">COA Unlocked At</label>
              <p className="mt-1 text-base text-gray-900">
                {new Date(serial.coa_unlocked_at).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          )}
          
          {serial.verified_by && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-500">Verified By</label>
                <p className="mt-1 text-base text-gray-900">{serial.verified_by.name || "N/A"}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Customer Mobile</label>
                <p className="mt-1 text-base text-gray-900 font-mono">{serial.verified_by.mobile_number || "N/A"}</p>
              </div>
            </>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-500">Created Date</label>
            <p className="mt-1 text-base text-gray-900">
              {new Date(serial.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
