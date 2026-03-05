import { useState } from "react"
import { Eye } from "lucide-react"
import DataTable from "@/components/DataTable"
import { useNavigate } from "react-router-dom"

export default function ScanLogs() {
  const [scanLogs] = useState([
    // Placeholder data - replace with API call
    {
      id: 1,
      serial_number: "SN123456789",
      customer_name: "Akash Shetty",
      customer_mobile: "9987900884",
      scanned_at: "05/03/26 10:30 AM",
      location: "Mumbai, India",
      status: "Verified"
    }
  ])
  const navigate = useNavigate()

  const handleView = (log) => {
    navigate(`/admin/scan-logs/${log.id}`)
  }

  const columns = [
    {
      header: "#",
      cell: (row, index) => index + 1
    },
    {
      header: "SERIAL NUMBER",
      accessor: "serial_number"
    },
    {
      header: "CUSTOMER NAME",
      accessor: "customer_name"
    },
    {
      header: "MOBILE",
      accessor: "customer_mobile"
    },
    {
      header: "SCANNED AT",
      accessor: "scanned_at"
    },
    {
      header: "LOCATION",
      accessor: "location"
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
      header: "ACTIONS",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <DataTable
        title="Scan Logs"
        subtitle="View all product scan activities"
        columns={columns}
        data={scanLogs}
        showAddButton={false}
        exportFileName="scan-logs"
      />
    </div>
  )
}
