import { useEffect, useState } from "react"
import { Eye, Edit, Trash2, Upload } from "lucide-react"
import DataTable from "@/components/DataTable"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useNavigate, useLocation } from "react-router-dom"

export default function Serials() {
  const [serials, setSerials] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchSerials()
  }, [])

  const fetchSerials = async () => {
    try {
      // Check if we need to filter by batch (from navigation state)
      const batchId = location.state?.batchId
      const endpoint = batchId 
        ? `/admin/serials?batch_id=${batchId}`
        : '/admin/serials'
      
      const response = await apiClient.get(endpoint)
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
    if (!confirm("Are you sure you want to delete this serial number? This action cannot be undone.")) return
    
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

  const columns = [
    {
      header: "#",
      cell: (row, index) => index + 1
    },
    {
      header: "SERIAL NUMBER",
      cell: (row) => (
        <span className="font-mono text-sm">{row.serial_number}</span>
      )
    },
    {
      header: "BATCH",
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.batch?.batch_code || '-'}</p>
          <p className="text-xs text-gray-500">{row.batch?.product?.name || '-'}</p>
        </div>
      )
    },
    {
      header: "PRODUCT CODE",
      cell: (row) => (
        <span className="font-mono text-xs text-gray-600">
          {row.batch?.product?.product_code || '-'}
        </span>
      )
    },
    {
      header: "VERIFICATION",
      cell: (row) => (
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.is_verified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}>
            {row.is_verified ? "✓ Verified" : "Not Verified"}
          </span>
          {row.is_verified && row.verified_at && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(row.verified_at).toLocaleDateString('en-GB', { 
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
          <button
            onClick={() => handleView(row)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
            disabled={row.is_verified}
          >
            <Edit className={`h-4 w-4 ${row.is_verified ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => handleDelete(row.serial_number_id)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
            disabled={row.is_verified}
          >
            <Trash2 className={`h-4 w-4 ${row.is_verified ? 'text-gray-300' : 'text-red-600'}`} />
          </button>
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
    <div className="space-y-4">
      {/* Action Buttons */}
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
          className="px-4 py-2 bg-gradient-to-r from-[#338291] to-[#2a6d7a] hover:from-[#2a6d7a] hover:to-[#1f5460] text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Bulk Upload
        </button>
      </div>

      <DataTable
        title="Serial Numbers"
        subtitle="Manage all serial numbers in the system"
        columns={columns}
        data={serials}
        showAddButton={false}
        exportFileName="serial-numbers"
      />
    </div>
  )
}
