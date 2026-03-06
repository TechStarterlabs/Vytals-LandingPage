import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, FileText, Package, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function COAView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [coa, setCoa] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCOA()
  }, [id])

  const fetchCOA = async () => {
    try {
      const response = await apiClient.get(`/admin/coa/${id}`)
      setCoa(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load COA details",
        variant: "destructive"
      })
      navigate('/admin/coa')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this COA? This action cannot be undone.")) return
    
    try {
      await apiClient.delete(`/admin/coa/${id}`)
      toast({
        title: "Success",
        description: "COA deleted successfully",
        variant: "success"
      })
      navigate("/admin/coa")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete COA",
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

  if (!coa) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">COA not found</div>
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
            onClick={() => navigate("/admin/coa")}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">COA Details</h1>
            <p className="text-sm text-gray-500 mt-1">Certificate of Analysis information</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/coa/${id}/edit`)}
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

      {/* COA Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
          <h2 className="text-lg font-semibold text-white">COA Information</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Batch Code</label>
            <p className="mt-1 text-base text-gray-900 font-mono">{coa.batch?.batch_code || '-'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Product</label>
            <p className="mt-1 text-base text-gray-900">{coa.batch?.product?.name || '-'}</p>
            <p className="text-xs text-gray-500 font-mono">{coa.batch?.product?.product_code || '-'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Issue Date</label>
            <p className="mt-1 text-base text-gray-900">
              {coa.issue_date ? new Date(coa.issue_date).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              }) : '-'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Batch Expiry</label>
            <p className="mt-1 text-base text-gray-900">
              {coa.batch?.expiry_date ? new Date(coa.batch.expiry_date).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              }) : '-'}
            </p>
          </div>
          
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">File URL</label>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm text-gray-600 break-all flex-1">{coa.file_url}</p>
              <a
                href={coa.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-[#338291] hover:text-[#2a6d7a]"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Created Date</label>
            <p className="mt-1 text-base text-gray-900">
              {coa.created_at ? new Date(coa.created_at).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '-'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="mt-1 text-base text-gray-900">
              {coa.updated_at ? new Date(coa.updated_at).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-500 border-b">
          <h2 className="text-lg font-semibold text-white">Document Preview</h2>
        </div>
        
        <div className="p-6">
          <div className="aspect-[8.5/11] bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={coa.file_url}
              className="w-full h-full"
              title="COA Document"
            />
          </div>
          <div className="mt-4 flex justify-center">
            <a
              href={coa.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#338291] hover:bg-[#2a6d7a] text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Open in New Tab
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate(`/admin/batches/${coa.batch?.batch_id}`)}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          disabled={!coa.batch?.batch_id}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">View Batch</p>
              <p className="text-lg font-bold text-gray-900">{coa.batch?.batch_code || '-'}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate(`/admin/products/${coa.batch?.product?.product_id}`)}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          disabled={!coa.batch?.product?.product_id}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">View Product</p>
              <p className="text-lg font-bold text-gray-900">{coa.batch?.product?.name || '-'}</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
