import { useState } from "react"
import { Eye, Edit, Trash2 } from "lucide-react"
import DataTable from "@/components/DataTable"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

export default function Rewards() {
  const [rewards] = useState([
    // Placeholder data - replace with API call
    {
      id: 1,
      reward_name: "10% Discount",
      reward_type: "Discount Code",
      value: "10%",
      total_issued: 50,
      total_redeemed: 25,
      status: "Active",
      created: "01/01/26"
    }
  ])
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleView = (reward) => {
    navigate(`/admin/rewards/${reward.id}`)
  }

  const handleEdit = (reward) => {
    navigate(`/admin/rewards/${reward.id}/edit`)
  }

  const handleDelete = (rewardId) => {
    if (!confirm("Are you sure you want to delete this reward?")) return
    toast({
      title: "Info",
      description: "Delete functionality coming soon",
    })
  }

  const columns = [
    {
      header: "#",
      cell: (row, index) => index + 1
    },
    {
      header: "REWARD NAME",
      accessor: "reward_name"
    },
    {
      header: "TYPE",
      accessor: "reward_type"
    },
    {
      header: "VALUE",
      accessor: "value"
    },
    {
      header: "ISSUED",
      accessor: "total_issued"
    },
    {
      header: "REDEEMED",
      accessor: "total_redeemed"
    },
    {
      header: "STATUS",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {row.status}
        </span>
      )
    },
    {
      header: "CREATED",
      accessor: "created"
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
          >
            <Edit className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <DataTable
        title="Rewards"
        subtitle="Manage all rewards and discount codes"
        columns={columns}
        data={rewards}
        onAdd={() => navigate('/admin/rewards/new')}
        addButtonText="Add Reward"
        exportFileName="rewards"
      />
    </div>
  )
}
