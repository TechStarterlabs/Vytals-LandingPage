import { useEffect, useState } from "react"
import { Eye, Edit, Trash2, Upload, RotateCcw } from "lucide-react"
import DataTable from "@/components/DataTable"
import ConfirmDialog from "@/components/ConfirmDialog"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useConfirm } from "@/hooks/use-confirm"
import { usePermissions } from "@/contexts/PermissionContext"
import PermissionRoute from "@/components/PermissionRoute"

export default function COA() {
  const [coas, setCoas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleted, setShowDeleted] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirm()
  const { canCreate, canUpdate, canDelete } = usePermissions()

  useEffect(() => {
    fetchCOAs()
  }, [showDeleted])

  const fetchCOAs = async () => {
    try {
      const response = await apiClient.get('/admin/coa', {
        params: { include_deleted: showDeleted }
      })
      setCoas(response.data.coas || [])
    } catch (error) {
      console.error('Failed to fetch COAs:', error)
      toast({
        title: "Error",
        description: "Failed to load COAs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleView = (coa) => {
    navigate(`/admin/coa/${coa.coa_id}`)
  }

  const handleEdit = (coa) => {
    navigate(`/admin/coa/${coa.coa_id}/edit`)
  }

  const handleDelete = async (coaId) => {
    const confirmed = await confirm({
      title: "Delete COA",
      message: "Are you sure you want to delete this COA? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
    try {
      await apiClient.delete(`/admin/coa/${coaId}`)
      toast({
        title: "Success",
        description: "COA deleted successfully",
        variant: "success"
      })
      fetchCOAs()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete COA",
        variant: "destructive"
      })
    }
  }

  const handleRestore = async (coaId) => {
    const confirmed = await confirm({
      title: "Restore COA",
      message: "Are you sure you want to restore this COA?",
      confirmText: "Restore",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
    try {
      await apiClient.post(`/admin/coa/${coaId}/restore`)
      toast({
        title: "Success",
        description: "COA restored successfully",
        variant: "success"
      })
      fetchCOAs()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore COA",
        variant: "destructive"
      })
    }
  }

  const columns = [
    {
      header: "#",
      cell: (row, index) => index + 1
    },
    {
      header: "BATCH CODE",
      cell: (row) => (
        <span className="text-sm text-gray-900">
          {row.batch?.batch_code || '-'}
        </span>
      )
    },
    {
      header: "PRODUCT",
      cell: (row) => (
        <div>
          <p className="text-gray-900">{row.batch?.product?.name || '-'}</p>
          <p className="text-xs text-gray-500">{row.batch?.product?.product_code || '-'}</p>
        </div>
      )
    },
    {
      header: "ISSUE DATE",
      cell: (row) => {
        if (!row.issue_date) return "-"
        const date = new Date(row.issue_date)
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    },
    {
      header: "FILE",
      cell: (row) => (
        <a
          href={row.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#338291] hover:text-[#2a6d7a] text-sm underline"
        >
          View PDF
        </a>
      )
    },
    {
      header: "CREATED",
      cell: (row) => {
        if (!row.created_at) return "-"
        const date = new Date(row.created_at)
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
      }
    },
    {
      header: "ACTIONS",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {!row.deleted_at ? (
            <>
              <button
                onClick={() => handleView(row)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="View"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </button>
              {canUpdate('coa') && (
                <button
                  onClick={() => handleEdit(row)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
              )}
              {canDelete('coa') && (
                <button
                  onClick={() => handleDelete(row.coa_id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              )}
            </>
          ) : (
            <>
              {canDelete('coa') && (
                <button
                  onClick={() => handleRestore(row.coa_id)}
                  className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                  title="Restore"
                >
                  <RotateCcw className="h-4 w-4 text-green-600" />
                </button>
              )}
              <span className="text-xs text-red-600 font-medium">Deleted</span>
            </>
          )}
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        {...config}
      />
      <DataTable
        title="Certificates of Analysis (COA)"
        subtitle="Manage COA documents for batches"
        columns={columns}
        data={coas}
        showAddButton={false}
        exportFileName="coa-list"
        customActions={canCreate('coa') ? (
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/coa/new')}
              className="px-4 py-2 bg-[#11b5b2] hover:bg-[#0fa09d] text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Single COA
            </button>
            <button
              onClick={() => navigate('/admin/coa/bulk')}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-[#11b5b2] border-2 border-[#11b5b2] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </button>
          </div>
        ) : undefined}
      />
    </div>
  )
}
