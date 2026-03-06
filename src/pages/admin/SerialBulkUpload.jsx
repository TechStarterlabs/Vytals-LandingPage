import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function SerialBulkUpload() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [batches, setBatches] = useState([])
  const [formData, setFormData] = useState({
    batch_id: "",
    serial_numbers_text: ""
  })
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState([])

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

  const handleTextChange = (value) => {
    setFormData(prev => ({ ...prev, serial_numbers_text: value }))
    
    // Generate preview
    const lines = value.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
    
    setPreview(lines)
    
    if (errors.serial_numbers_text) {
      setErrors(prev => ({ ...prev, serial_numbers_text: undefined }))
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      handleTextChange(text)
    }
    reader.readAsText(file)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.batch_id) {
      newErrors.batch_id = "Batch is required"
    }
    
    if (!formData.serial_numbers_text.trim()) {
      newErrors.serial_numbers_text = "Serial numbers are required"
    } else if (preview.length === 0) {
      newErrors.serial_numbers_text = "No valid serial numbers found"
    } else if (preview.length > 1000) {
      newErrors.serial_numbers_text = "Maximum 1000 serial numbers allowed per upload"
    }
    
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
        batch_id: parseInt(formData.batch_id, 10),
        serial_numbers: preview
      }

      const response = await apiClient.post('/admin/serials/bulk', payload)
      
      const { created_count, failed_count, failed_serials } = response.data
      
      if (failed_count > 0) {
        toast({
          title: "Partial Success",
          description: `${created_count} serials created, ${failed_count} failed. Check console for details.`,
          variant: "warning"
        })
        console.log('Failed serials:', failed_serials)
      } else {
        toast({
          title: "Success",
          description: `${created_count} serial numbers created successfully`,
          variant: "success"
        })
      }
      
      navigate("/admin/serials")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create serial numbers",
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
          onClick={() => navigate("/admin/serials")}
          className="border-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Bulk Upload Serial Numbers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload multiple serial numbers at once
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
            <h2 className="text-lg font-semibold text-white">Upload Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Batch Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.batch_id}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, batch_id: e.target.value }))
                  if (errors.batch_id) {
                    setErrors(prev => ({ ...prev, batch_id: undefined }))
                  }
                }}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#338291] focus:border-transparent ${
                  errors.batch_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">
                  {batches.length === 0 ? 'No batches available' : 'Select a batch'}
                </option>
                {batches.map((batch) => (
                  <option key={batch.batch_id} value={String(batch.batch_id)}>
                    {batch.batch_code} - {batch.product?.name || 'Unknown Product'}
                  </option>
                ))}
              </select>
              {errors.batch_id && (
                <p className="mt-1 text-sm text-red-600">{errors.batch_id}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                All serial numbers will be assigned to this batch
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV/TXT File (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Choose file or drag here</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Upload a CSV or TXT file with one serial number per line
              </p>
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial Numbers <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.serial_numbers_text}
                onChange={(e) => handleTextChange(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                  errors.serial_numbers_text ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={10}
                placeholder="VSR000000001&#10;VSR000000002&#10;VSR000000003&#10;..."
              />
              {errors.serial_numbers_text && (
                <p className="mt-1 text-sm text-red-600">{errors.serial_numbers_text}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter one serial number per line. Maximum 1000 serials per upload.
              </p>
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Preview</h3>
                  <span className="text-xs text-gray-500">{preview.length} serial numbers</span>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  <div className="space-y-1">
                    {preview.slice(0, 10).map((serial, index) => (
                      <div key={index} className="text-xs font-mono text-gray-600 bg-white px-2 py-1 rounded">
                        {index + 1}. {serial}
                      </div>
                    ))}
                    {preview.length > 10 && (
                      <p className="text-xs text-gray-500 italic px-2 py-1">
                        ... and {preview.length - 10} more
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                      <li>Each serial number must be unique across the entire system</li>
                      <li>Duplicate serial numbers will be skipped</li>
                      <li>Empty lines will be ignored</li>
                      <li>Maximum 1000 serial numbers per upload</li>
                      <li>Upload will continue even if some serials fail</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/serials")}
              className="border-gray-300"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#338291] to-[#2a6d7a] hover:from-[#2a6d7a] hover:to-[#1f5460] text-white"
              disabled={submitting || preview.length === 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              {submitting ? 'Uploading...' : `Upload ${preview.length} Serials`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
