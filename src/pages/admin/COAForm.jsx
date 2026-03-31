import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function COAForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = id && id !== 'new'
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors
  } = useForm({
    defaultValues: {
      batch_id: "",
      file_url: "",
      issue_date: "",
      coa_data: ""
    }
  })

  useEffect(() => {
    const initializeForm = async () => {
      await fetchBatches()
      if (isEdit) {
        await fetchCOA()
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

  const fetchCOA = async () => {
    try {
      const response = await apiClient.get(`/admin/coa/${id}`)
      const coaData = response.data
      
      const batchId = coaData.batch?.batch_id || coaData.batch_id || ""
      
      reset({
        batch_id: batchId ? String(batchId) : "",
        file_url: coaData.file_url || "",
        issue_date: coaData.issue_date ? coaData.issue_date.split('T')[0] : "",
        coa_data: coaData.coa_data ? JSON.stringify(coaData.coa_data, null, 2) : ""
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load COA details",
        variant: "destructive"
      })
      navigate('/admin/coa')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      let parsedCoaData = null
      if (data.coa_data && data.coa_data.trim()) {
        try {
          parsedCoaData = JSON.parse(data.coa_data)
        } catch {
          setError("coa_data", { type: "manual", message: "coa_data must be valid JSON" })
          return
        }
      }

      const payload = {
        ...data,
        batch_id: parseInt(data.batch_id, 10),
        coa_data: parsedCoaData
      }

      if (isEdit) {
        await apiClient.put(`/admin/coa/${id}`, payload)
        toast({
          title: "Success",
          description: "COA updated successfully",
          variant: "success"
        })
      } else {
        await apiClient.post('/admin/coa', payload)
        toast({
          title: "Success",
          description: "COA created successfully",
          variant: "success"
        })
      }
      navigate("/admin/coa")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEdit ? 'update' : 'create'} COA`,
        variant: "destructive"
      })
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {isEdit ? "Edit COA" : "Add New COA"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? "Update COA information" : "Create a new Certificate of Analysis"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
            <h2 className="text-lg font-semibold text-white">COA Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Batch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("batch_id", { required: "Batch is required" })}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11b5b2] focus:border-transparent ${
                    errors.batch_id ? 'border-red-500' : 'border-gray-300'
                  }`}
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
                  <p className="mt-1 text-sm text-red-600">{errors.batch_id.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Select the batch this COA belongs to
                </p>
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("issue_date", { required: "Issue date is required" })}
                  type="date"
                  className={errors.issue_date ? 'border-red-500' : 'border-gray-300'}
                />
                {errors.issue_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.issue_date.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Date when the COA was issued
                </p>
              </div>

              {/* File URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File URL
                </label>
                <Input
                  {...register("file_url", {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Please enter a valid URL"
                    }
                  })}
                  type="url"
                  className={errors.file_url ? 'border-red-500' : 'border-gray-300'}
                  placeholder="https://cdn.example.com/coa/batch-00001.pdf"
                />
                {errors.file_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.file_url.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Optional: Enter the URL where the COA file is hosted
                </p>
              </div>

              {/* COA Data */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  COA Data (JSON)
                </label>
                <textarea
                  {...register("coa_data")}
                  rows={8}
                  className={`w-full border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#11b5b2] focus:border-transparent resize-y ${
                    errors.coa_data ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={'{\n  "header": {\n    "product_name": "Omega-3 Softgel 1000mg",\n    "document_no": "GEN/QC/25-26/001",\n    "effective_date": "10/25/2026",\n    "issue_date": "10/25/2026"\n  },\n  "meta": [\n    { "label": "Unique Product ID", "value": "BCH2025-001-00001" },\n    { "label": "Manufactured By", "value": "Maxcure India Pvt. Ltd." }\n  ],\n  "sections": [\n    {\n      "title": "Analytical Tests",\n      "columns": ["Parameter", "Specification", "Result", "Method Ref."],\n      "rows": [\n        ["Moisture Content", "< 5.0%", "3.40%", "Karl Fischer"]\n      ]\n    }\n  ]\n}'}
                />
                {errors.coa_data && (
                  <p className="mt-1 text-sm text-red-600">{errors.coa_data.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Optional: Enter structured COA metrics as a JSON object. This will be rendered dynamically on the verification page.
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
                  <h3 className="text-sm font-medium text-blue-800">COA Information</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Each batch can have only one COA</li>
                      <li>COA file must be uploaded to a CDN or cloud storage first</li>
                      <li>File URL must be publicly accessible for customers to view</li>
                      <li>Supported format: PDF</li>
                      <li>For bulk uploads, use the "Bulk Upload" button</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/coa")}
              className="border-gray-300 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#11b5b2] hover:bg-[#0fa09d] text-white w-full sm:w-auto"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : (isEdit ? "Update COA" : "Create COA")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
