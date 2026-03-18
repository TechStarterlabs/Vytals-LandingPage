import { useState, useMemo } from "react"
import { Search, Download, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function DataTable({ 
  columns, 
  data, 
  title, 
  subtitle,
  onAdd,
  addButtonText = "Add New",
  showAddButton = true,
  exportFileName = "data",
  customActions,
  customHeaderActions,
  loading = false,
  pagination = null // { currentPage, totalPages, onPageChange }
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Use server-side pagination if provided, otherwise use client-side
  const isServerPagination = pagination !== null
  
  // Filter data based on search (only for client-side pagination)
  const filteredData = useMemo(() => {
    if (isServerPagination) return data // Don't filter on client if server-side
    if (!searchTerm) return data
    
    return data.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [data, searchTerm, isServerPagination])

  // Pagination (client-side)
  const totalPages = isServerPagination ? pagination.totalPages : Math.ceil(filteredData.length / itemsPerPage)
  const activePage = isServerPagination ? pagination.currentPage : currentPage
  const startIndex = (activePage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = isServerPagination ? data : filteredData.slice(startIndex, endIndex)
  const totalRecords = isServerPagination ? pagination.totalRecords || data.length : filteredData.length

  const handlePageChange = (newPage) => {
    if (isServerPagination) {
      pagination.onPageChange(newPage)
    } else {
      setCurrentPage(newPage)
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = columns.map(col => col.header).join(",")
    const rows = filteredData.map(row => 
      columns.map(col => {
        const value = col.accessor ? row[col.accessor] : col.cell(row)
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(",")
    ).join("\n")
    
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${exportFileName}.csv`
    a.click()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
        </div>
        {customActions ? (
          customActions
        ) : showAddButton && onAdd ? (
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-[#338291] hover:bg-[#2a6d7a] text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {addButtonText}
          </button>
        ) : null}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 flex-1 w-full">
          <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full border-gray-300 focus:border-[#338291] focus:ring-[#338291]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {customHeaderActions && (
            <div className="mr-2">
              {customHeaderActions}
            </div>
          )}
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b border-[#2a6d7a]">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#338291]"></div>
                    </div>
                  </td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={`transition-colors ${
                      rowIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                        {column.cell ? column.cell(row, startIndex + rowIndex) : row[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>
            
            <div className="text-sm text-gray-700">
              Showing {totalRecords > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, totalRecords)} of {totalRecords} entries
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, activePage - 1))}
              disabled={activePage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (activePage <= 3) {
                  pageNum = i + 1
                } else if (activePage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = activePage - 2 + i
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm rounded ${
                      activePage === pageNum
                        ? "bg-[#338291] text-white"
                        : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, activePage + 1))}
              disabled={activePage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
