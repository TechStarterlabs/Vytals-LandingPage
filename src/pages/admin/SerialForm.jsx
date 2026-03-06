import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function SerialForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = id && id !== 'new'
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [batches, setBatches] = useState([])
  const [formData, setFormData] = useState({
    serial_number: "",
    batch_id: ""
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const initializeForm = async () => {
      await fetchBatches()
      if (isEdit) {
        await fetchSerial()
      } else {
        setLoading(false)
      }
    }
    
    initializeForm()
  }, [id, isEdit])

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
    }
  }

  const fetchSerial = async () => {
    try {
      const response = await apiClient.get(`/admin/serials/${id}`)
      const serialData = response.data
      
      const batchId = serialData.batch?.batch_id || serialData.batch_id || ""
      
      setFormData({
        serial_number: serialData.serial_number || "",
        batch_id: batchId ? String(batchId) : ""
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load serial number details",
        variant: "destructive"
      })
      navigate('/admin/serials')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.serial_number.trim()) {
      newErrors.serial_number = "Serial number is required"
    } else if (formData.serial_number.length < 3) {
      newErrors.serial_number = "Serial number must be at least 3 characters"
    }
    
    if (!formData.batch_id) {
      newErrors.batch_id = "Batch is required"
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
        ...formData,
        batch_id: parseInt(formData.batch_id, 10)
      }

      if (isEdit) {
        await apiClient.put(`/admin/serials/${id}`, payload)
        toast({
          title: "Success",
          description: "Serial number updated successfully",
          variant: "success"
        })
      } else {
        await apiClient.post('/admin/serials', payload)
        toast({
          title: "Success",
          description: "Serial number created successfully",
          variant: "success"
        })
      }
      navigate("/admin/serials")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEdit ? 'update' : 'create'} serial number`,
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
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
            {isEdit ? "Edit Serial Number" : "Add New Serial Number"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? "Update serial number information" : "Create a new serial number"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
            <h2 className="text-lg font-semibold text-white">Serial Number Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Serial Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => handleChange('serial_number', e.target.value.toUpperCase())}
                  className={`font-mono ${errors.serial_number ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="VSR000000001"
                  disabled={isEdit}
                />
                {errors.serial_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.serial_number}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {isEdit 
                    ? "Serial number cannot be changed after creation" 
                    : "Unique identifier (e.g., VSR000000001, SN-12345)"}
                </p>
              </div>

              {/* Batch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.batch_id}
                  onChange={(e) => handleChange('batch_id', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#338291] focus:border-transparent ${
                    errors.batch_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isEdit}
                >
                  <option value="">
                    {batches.length === 0 ? 'Loading batches...' : 'Select a batch'}
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
                  {isEdit 
                    ? "Batch cannot be changed after creation" 
                    : "Select the batch this serial belongs to"}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Serial Number Information</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Serial number must be unique across the entire system</li>
                      <li>Each serial represents one physical product unit</li>
                      <li>Serial numbers cannot be changed after creation</li>
                      <li>For bulk uploads, use the "Bulk Upload" button</li>
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
              className="bg-[#338291] hover:bg-[#2a6d7a] text-white"
              disabled={submitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Saving...' : (isEdit ? "Update Serial" : "Create Serial")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
