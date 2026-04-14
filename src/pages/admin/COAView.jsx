import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, FileText, Package, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function COAView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [coa, setCoa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    fetchCOA()
  }, [id])

  const fetchCOA = async () => {
    try {
      const response = await apiClient.get(`/admin/coa/${id}`)
      setCoa(response.data)
    } catch {
      toast({ title: "Error", description: "Failed to load COA details", variant: "destructive" })
      navigate('/admin/coa')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this COA? This action cannot be undone.")) return
    try {
      await apiClient.delete(`/admin/coa/${id}`)
      toast({ title: "Success", description: "COA deleted successfully", variant: "success" })
      navigate("/admin/coa")
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to delete COA", variant: "destructive" })
    }
  }

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true)
    try {
      const response = await apiClient.get(`/admin/coa/${id}/pdf`)
      toast({
        title: "Success",
        description: response.data.generated ? "PDF generated successfully" : "PDF already exists",
        variant: "success"
      })
      // Refresh COA data to get updated file_url and is_pdf_generated
      await fetchCOA()
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to generate PDF", variant: "destructive" })
    } finally {
      setGeneratingPdf(false)
    }
  }

  const formatDate = (d, withTime = false) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: withTime ? 'short' : 'long', year: 'numeric',
      ...(withTime && { hour: '2-digit', minute: '2-digit' })
    })
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>
  if (!coa) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">COA not found</div></div>

  const hasPdf = coa.is_pdf_generated && coa.file_url
  const hasData = !!coa.coa_data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/coa")} className="border-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">COA Details</h1>
            <p className="text-sm text-gray-500 mt-1">Certificate of Analysis information</p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasData && (
            <Button
              variant="outline"
              onClick={handleGeneratePdf}
              disabled={generatingPdf}
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${generatingPdf ? 'animate-spin' : ''}`} />
              {generatingPdf ? 'Generating...' : hasPdf ? 'Regenerate PDF' : 'Generate PDF'}
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/admin/coa/${id}/edit`)} className="border-gray-300">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete} className="border-red-300 text-red-600 hover:bg-red-50">
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
            <p className="text-xs text-gray-500 font-mono">{coa.batch?.product?.product_code || ''}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Issue Date</label>
            <p className="mt-1 text-base text-gray-900">{formatDate(coa.issue_date)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Batch Expiry</label>
            <p className="mt-1 text-base text-gray-900">{formatDate(coa.batch?.expiry_date)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">PDF Status</label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                hasPdf ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {hasPdf ? 'Generated' : 'Not generated'}
              </span>
            </p>
          </div>
          {hasPdf && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">File URL</label>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-gray-600 break-all flex-1">{coa.file_url}</p>
                <a href={coa.file_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-[#338291] hover:text-[#2a6d7a]">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Created</label>
            <p className="mt-1 text-base text-gray-900">{formatDate(coa.created_at, true)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="mt-1 text-base text-gray-900">{formatDate(coa.updated_at, true)}</p>
          </div>
        </div>
      </div>

      {/* PDF Preview — only when generated */}
      {hasPdf && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-500 border-b">
            <h2 className="text-lg font-semibold text-white">Document Preview</h2>
          </div>
          <div className="p-6">
            <div className="aspect-[8.5/11] bg-gray-100 rounded-lg overflow-hidden">
              <iframe src={coa.file_url} className="w-full h-full" title="COA Document" />
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
      )}

      {/* No PDF state */}
      {!hasPdf && hasData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <FileText className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-yellow-800">PDF not generated yet</p>
          <p className="text-xs text-yellow-600 mt-1 mb-4">Click "Generate PDF" above to create the document.</p>
        </div>
      )}

      {!hasData && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">No COA data entered</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Edit this COA and add JSON data to enable PDF generation.</p>
          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/coa/${id}/edit`)} className="border-gray-300">
            <Edit className="h-4 w-4 mr-2" />
            Add COA Data
          </Button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate(`/admin/batches/${coa.batch?.batch_id}`)}
          disabled={!coa.batch?.batch_id}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left disabled:opacity-50"
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
          disabled={!coa.batch?.product?.product_id}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left disabled:opacity-50"
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
