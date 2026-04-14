import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, FileText, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useConfirm } from "@/hooks/use-confirm"
import ConfirmDialog from "@/components/ConfirmDialog"

export default function BatchView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirm()
  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBatch()
  }, [id])

  const fetchBatch = async () => {
    try {
      const response = await apiClient.get(`/admin/batches/${id}`)
      setBatch(response.data)
    } catch {
      toast({ title: "Error", description: "Failed to load batch details", variant: "destructive" })
      navigate('/admin/batches')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Batch",
      message: "Are you sure you want to delete this batch? This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel"
    })
    if (!confirmed) return

    try {
      await apiClient.delete(`/admin/batches/${id}`)
      toast({ title: "Success", description: "Batch deleted successfully", variant: "success" })
      navigate("/admin/batches")
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to delete batch", variant: "destructive" })
    }
  }

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : '-'

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>
  if (!batch) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Batch not found</div></div>

  const isExpired = batch.expiry_date && new Date(batch.expiry_date) < new Date()

  return (
    <div className="space-y-6">
      <ConfirmDialog isOpen={isOpen} onClose={handleCancel} onConfirm={handleConfirm} {...config} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/batches")} className="border-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Batch Details</h1>
            <p className="text-sm text-gray-500 mt-1">View batch information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/batches/${id}/edit`)} className="border-gray-300 flex-1 sm:flex-none">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete} className="border-red-300 text-red-600 hover:bg-red-50 flex-1 sm:flex-none">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Batch Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
          <h2 className="text-lg font-semibold text-white">Batch Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Batch Code</label>
            <p className="mt-1 text-base font-mono text-gray-900">{batch.batch_code}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Product</label>
            <p className="mt-1 text-base text-gray-900">{batch.product?.name || '-'}</p>
            <p className="text-xs text-gray-500">{batch.product?.product_code || ''}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Expiry Date</label>
            <p className={`mt-1 text-base ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDate(batch.expiry_date)}
              {isExpired && <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Expired</span>}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {isExpired ? 'Expired' : 'Active'}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Serial Numbers</label>
            <p className="mt-1 text-base text-gray-900">
              {batch.serial_count ?? 0} total &nbsp;·&nbsp; {batch.verified_count ?? 0} verified
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">COA</label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                batch.coa?.file_url ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {batch.coa?.file_url ? 'Available' : 'Not generated'}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created</label>
            <p className="mt-1 text-base text-gray-900">{formatDate(batch.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/admin/serials', { state: { batchId: batch.batch_id } })}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Serial Numbers</p>
              <p className="text-lg font-bold text-gray-900">{batch.serial_count ?? 0}</p>
            </div>
          </div>
        </button>

        {batch.coa ? (
          <button
            onClick={() => navigate(`/admin/coa/${batch.coa.coa_id}`)}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <FileText className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">View COA</p>
                <p className="text-lg font-bold text-gray-900">{batch.coa.file_url ? 'PDF Ready' : 'No PDF yet'}</p>
              </div>
            </div>
          </button>
        ) : (
          <button
            onClick={() => navigate('/admin/coa/new')}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">COA</p>
                <p className="text-lg font-bold text-gray-900">Add COA</p>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
