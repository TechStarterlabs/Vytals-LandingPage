import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, Plus, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function COABulkUpload() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [batches, setBatches] = useState([])
  const [coaEntries, setCoaEntries] = useState([
    { batch_id: "", file_url: "", issue_date: "" }
  ])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      const response = await apiClient.get('/admin/batches')
      setBatches(response.data.batches || [])
    } catch (error) {
      console.error('Failed to fetch batches:', error)
      toast({
        title: "Error",
        description: "Failed to load batches",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addEntry = () => {
    setCoaEntries([...coaEntries, { batch_id: "", file_url: "", issue_date: "" }])
  }

  const removeEntry = (index) => {
    if (coaEntries.length === 1) {
      toast({
        title: "Warning",
        description: "At least one entry is required",
        variant: "warning"
      })
      return
    }
    const newEntries = coaEntries.filter((_, i) => i !== index)
    setCoaEntries(newEntries)
    
    // Clear errors for this entry
    const newErrors = { ...errors }
    delete newErrors[`batch_id_${index}`]
    delete newErrors[`file_url_${index}`]
    delete newErrors[`issue_date_${index}`]
    setErrors(newErrors)
  }

  const updateEntry = (index, field, value) => {
    const newEntries = [...coaEntries]
    newEntries[index][field] = value
    setCoaEntries(newEntries)
    
    // Clear error for this field
    const errorKey = `${field}_${index}`
    if (errors[errorKey]) {
      const newErrors = { ...errors }
      delete newErrors[errorKey]
      setErrors(newErrors)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    coaEntries.forEach((entry, index) => {
      if (!entry.batch_id) {
        newErrors[`batch_id_${index}`] = "Batch is required"
      }
      
      if (!entry.file_url.trim()) {
        newErrors[`file_url_${index}`] = "File URL is required"
      } else if (!entry.file_url.match(/^https?:\/\/.+/)) {
        newErrors[`file_url_${index}`] = "Invalid URL"
      }
      
      if (!entry.issue_date) {
        newErrors[`issue_date_${index}`] = "Issue date is required"
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        coas: coaEntries.map(entry => ({
          batch_id: parseInt(entry.batch_id, 10),
          file_url: entry.file_url,
          issue_date: entry.issue_date
        }))
      }

      const response = await apiClient.post('/admin/coa/bulk', payload)
      
      const { created_count, failed_count, failed_batches } = response.data
      
      if (failed_count > 0) {
        toast({
          title: "Partial Success",
          description: `${created_count} COAs created, ${failed_count} failed. Check console for details.`,
          variant: "warning"
        })
        console.log('Failed batches:', failed_batches)
      } else {
        toast({
          title: "Success",
          description: `${created_count} COAs created successfully`,
          variant: "success"
        })
      }
      
      navigate("/admin/coa")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create COAs",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Bulk Upload COAs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload multiple COAs at once
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">COA Entries</h2>
            <Button
              type="button"
              onClick={addEntry}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* COA Entries */}
            {coaEntries.map((entry, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                {/* Remove Button */}
                {coaEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(index)}
                    className="absolute top-2 right-2 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                )}
                
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Entry #{index + 1}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Batch */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={entry.batch_id}
                      onChange={(e) => updateEntry(index, 'batch_id', e.target.value)}
                      className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#338291] focus:border-transparent ${
                        errors[`batch_id_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select batch</option>
                      {batches.map((batch) => (
                        <option key={batch.batch_id} value={String(batch.batch_id)}>
                          {batch.batch_code} - {batch.product?.name || 'Unknown'}
                        </option>
                      ))}
                    </select>
                    {errors[`batch_id_${index}`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`batch_id_${index}`]}</p>
                    )}
                  </div>

                  {/* Issue Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={entry.issue_date}
                      onChange={(e) => updateEntry(index, 'issue_date', e.target.value)}
                      className={errors[`issue_date_${index}`] ? 'border-red-500' : 'border-gray-300'}
                    />
                    {errors[`issue_date_${index}`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`issue_date_${index}`]}</p>
                    )}
                  </div>

                  {/* File URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File URL <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="url"
                      value={entry.file_url}
                      onChange={(e) => updateEntry(index, 'file_url', e.target.value)}
                      className={errors[`file_url_${index}`] ? 'border-red-500' : 'border-gray-300'}
                      placeholder="https://..."
                    />
                    {errors[`file_url_${index}`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`file_url_${index}`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Bulk Upload Guidelines</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Each batch can have only one COA</li>
                      <li>Duplicate batch entries will be skipped</li>
                      <li>COA files must be uploaded to CDN/cloud storage first</li>
                      <li>File URLs must be publicly accessible</li>
                      <li>Upload will continue even if some entries fail</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {coaEntries.length} {coaEntries.length === 1 ? 'entry' : 'entries'}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/coa")}
                className="border-gray-300"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#338291] to-[#2a6d7a] hover:from-[#2a6d7a] hover:to-[#1f5460] text-white"
                disabled={submitting}
              >
                <Upload className="h-4 w-4 mr-2" />
                {submitting ? 'Uploading...' : `Upload ${coaEntries.length} COAs`}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
