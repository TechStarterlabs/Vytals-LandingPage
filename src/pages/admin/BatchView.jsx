import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, Barcode, FileText, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function BatchView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBatch()
  }, [id])

  const fetchBatch = async () => {
    try {
      const response = await apiClient.get(`/admin/batches/${id}`)
      setBatch(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load batch details",
        variant: "destructive"
      })
      navigate('/admin/batches')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this batch? This action cannot be undone.")) return
    
    try {
      await apiClient.delete(`/admin/batches/${id}`)
      toast({
        title: "Success",
        description: "Batch deleted successfully",
        variant: "success"
      })
      navigate("/admin/batches")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete batch. It may have associated serial numbers.",
        variant: "destructive"
      })
    }
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Batch not found</div>
      </div>
    )
  }

  const expired = isExpired(batch.expiry_date)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/batches")}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Batch Details</h1>
            <p className="text-sm text-gray-500 mt-1">View batch information and statistics</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/batches/${id}/edit`)}
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
        </div>
      </div>

      {/* Batch Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
          <h2 className="text-lg font-semibold text-white">Batch Information</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Batch Code</label>
            <p className="mt-1 text-base text-gray-900 font-mono">{batch.batch_code}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Product</label>
            <p className="mt-1 text-base text-gray-900">{batch.product?.name || '-'}</p>
            <p className="text-xs text-gray-500">{batch.product?.product_code || '-'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Expiry Date</label>
            <p className={`mt-1 text-base ${expired ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
              {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              }) : '-'}
            </p>
            {expired && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                Expired
              </span>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                expired ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
              }`}>
                {expired ? "Expired" : "Active"}
              </span>
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Total Serial Numbers</label>
            <p className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {batch.serial_count || 0} Serials
              </span>
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Verified Serials</label>
            <p className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {batch.verified_count || 0} Verified
              </span>
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">COA Status</label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                batch.has_coa ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {batch.has_coa ? "✓ Uploaded" : "✗ Not Uploaded"}
              </span>
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Created Date</label>
            <p className="mt-1 text-base text-gray-900">
              {batch.created_at ? new Date(batch.created_at).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              }) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/admin/serials', { state: { batchId: id } })}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Barcode className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Serial Numbers</p>
              <p className="text-2xl font-bold text-gray-900">{batch.serial_count || 0}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate(`/admin/products/${batch.product?.product_id}`)}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          disabled={!batch.product?.product_id}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">View Product</p>
              <p className="text-lg font-bold text-gray-900 truncate">{batch.product?.name || '-'}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            if (batch.has_coa) {
              // Navigate to COA management or view COA
              toast({
                title: "Info",
                description: "COA viewer coming soon",
              })
            } else {
              toast({
                title: "Info",
                description: "No COA uploaded for this batch",
                variant: "destructive"
              })
            }
          }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${batch.has_coa ? 'bg-green-100' : 'bg-gray-100'}`}>
              <FileText className={`h-6 w-6 ${batch.has_coa ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">COA Document</p>
              <p className="text-lg font-bold text-gray-900">{batch.has_coa ? 'View COA' : 'Not Uploaded'}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
          <h2 className="text-lg font-semibold text-white">Verification Statistics</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Serials</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{batch.serial_count || 0}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Verified</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{batch.verified_count || 0}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {(batch.serial_count || 0) - (batch.verified_count || 0)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Verification Rate</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {batch.serial_count > 0 
                  ? Math.round((batch.verified_count / batch.serial_count) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
