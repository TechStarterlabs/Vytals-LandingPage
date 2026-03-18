import { useEffect, useState } from "react"
import { Eye, Edit, Trash2, Upload, RotateCcw } from "lucide-react"
import DataTable from "@/components/DataTable"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useNavigate, useLocation } from "react-router-dom"
import { usePermissions } from "@/contexts/PermissionContext"
import { useConfirm } from "@/hooks/use-confirm"
import ConfirmDialog from "@/components/ConfirmDialog"

export default function Serials() {
  const [serials, setSerials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleted, setShowDeleted] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { canCreate, canUpdate, canDelete } = usePermissions()
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirm()

  useEffect(() => {
    fetchSerials()
  }, [showDeleted])

  const fetchSerials = async () => {
    try {
      // Check if we need to filter by batch (from navigation state)
      const batchId = location.state?.batchId
      const params = { include_deleted: showDeleted }
      if (batchId) params.batch_id = batchId
      
      const response = await apiClient.get('/admin/serials', { params })
      setSerials(response.data.serials || [])
    } catch (error) {
      console.error('Failed to fetch serials:', error)
      toast({
        title: "Error",
        description: "Failed to load serial numbers",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleView = (serial) => {
    navigate(`/admin/serials/${serial.serial_number_id}`)
  }

  const handleEdit = (serial) => {
    navigate(`/admin/serials/${serial.serial_number_id}/edit`)
  }

  const handleDelete = async (serialId) => {
    const confirmed = await confirm({
      title: "Delete Serial Number",
      message: "Are you sure you want to delete this serial number? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
    try {
      await apiClient.delete(`/admin/serials/${serialId}`)
      toast({
        title: "Success",
        description: "Serial number deleted successfully",
        variant: "success"
      })
      fetchSerials()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete serial number. It may have been verified.",
        variant: "destructive"
      })
    }
  }

  const handleRestore = async (serialId) => {
    const confirmed = await confirm({
      title: "Restore Serial Number",
      message: "Are you sure you want to restore this serial number?",
      confirmText: "Restore",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
    try {
      await apiClient.post(`/admin/serials/${serialId}/restore`)
      toast({
        title: "Success",
        description: "Serial number restored successfully",
        variant: "success"
      })
      fetchSerials()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore serial number",
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
      header: "SERIAL NUMBER",
      cell: (row) => (
        <span className="text-sm">{row.serial_number}</span>
      )
    },
    {
      header: "BATCH",
      cell: (row) => (
        <div>
          <p className="text-gray-900">{row.batch_code || '-'}</p>
          <p className="text-xs text-gray-500">{row.product_name || '-'}</p>
        </div>
      )
    },
    {
      header: "PRODUCT CODE",
      cell: (row) => (
        <span className="text-xs text-gray-600">
          {row.product_code || '-'}
        </span>
      )
    },
    {
      header: "VERIFICATION",
      cell: (row) => (
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
            row.is_coa_unlocked 
              ? "bg-green-100 text-green-800" 
              : row.is_scanned 
                ? "bg-blue-100 text-blue-800" 
                : "bg-gray-100 text-gray-800"
          }`}>
            {row.is_coa_unlocked ? "✓ COA Unlocked" : row.is_scanned ? "◉ Scanned" : "○ Unscanned"}
          </span>
          {row.is_coa_unlocked && row.coa_unlocked_at && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(row.coa_unlocked_at).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          )}
        </div>
      )
    },
    {
      header: "VERIFIED BY",
      cell: (row) => {
        if (!row.verified_by) return '-'
        return (
          <div>
            <p className="text-sm text-gray-900">{row.verified_by.name || '-'}</p>
            <p className="text-xs text-gray-500">{row.verified_by.mobile_number || '-'}</p>
          </div>
        )
      }
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
              {canUpdate('serials') && (
                <button
                  onClick={() => handleEdit(row)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                  disabled={row.is_coa_unlocked}
                >
                  <Edit className={`h-4 w-4 ${row.is_coa_unlocked ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              )}
              {canDelete('serials') && (
                <button
                  onClick={() => handleDelete(row.serial_number_id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                  disabled={row.is_coa_unlocked}
                >
                  <Trash2 className={`h-4 w-4 ${row.is_coa_unlocked ? 'text-gray-300' : 'text-red-600'}`} />
                </button>
              )}
            </>
          ) : (
            <>
              {canDelete('serials') && (
                <button
                  onClick={() => handleRestore(row.serial_number_id)}
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
        title="Serial Numbers"
        subtitle="Manage all serial numbers in the system"
        columns={columns}
        data={serials}
        showAddButton={false}
        exportFileName="serial-numbers"
        customActions={canCreate('serials') ? (
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/serials/new')}
              className="px-4 py-2 bg-[#338291] hover:bg-[#2a6d7a] text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Single Serial
            </button>
            <button
              onClick={() => navigate('/admin/serials/bulk')}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-[#338291] border-2 border-[#338291] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </button>
          </div>
        ) : undefined}
        customHeaderActions={canDelete('serials') ? (
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showDeleted 
                ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
          </button>
        ) : undefined}
      />
    </div>
  )
}
