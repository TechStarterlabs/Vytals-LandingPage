import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function CustomerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = id && id !== 'new'
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      mobile_number: "",
      email: "",
      is_active: true
    }
  })

  useEffect(() => {
    if (isEdit) {
      fetchCustomer()
    }
  }, [id])

  const fetchCustomer = async () => {
    try {
      const response = await apiClient.get(`/admin/users/${id}`)
      const user = response.data.user
      
      reset({
        mobile_number: user.mobile_number,
        email: user.email || '',
        is_active: user.is_active
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customer details",
        variant: "destructive"
      })
    }
  }

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await apiClient.put(`/admin/users/${id}`, {
          email: data.email,
          is_active: data.is_active
        })
        toast({
          title: "Success",
          description: "Customer updated successfully",
          variant: "success"
        })
      } else {
        await apiClient.post('/admin/users', {
          mobile_number: data.mobile_number,
          email: data.email,
          role_id: null, // Customer role
          is_active: data.is_active
        })
        toast({
          title: "Success",
          description: "Customer created successfully",
          variant: "success"
        })
      }
      navigate("/admin/customers")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save customer",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/customers")}
          className="border-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {isEdit ? "Edit Customer" : "Add New Customer"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? "Update customer information" : "Create a new customer"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
            <h2 className="text-lg font-semibold text-white">Customer Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("mobile_number", {
                    required: "Mobile is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Mobile must be 10 digits"
                    }
                  })}
                  className={errors.mobile_number ? 'border-red-500' : 'border-gray-300'}
                  placeholder="Enter mobile number"
                  disabled={isEdit}
                />
                {errors.mobile_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.mobile_number.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  {...register("email", {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address"
                    }
                  })}
                  className={errors.email ? 'border-red-500' : 'border-gray-300'}
                  placeholder="Enter email address"
                  type="email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("is_active", { required: "Status is required" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11b5b2] focus:border-transparent"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
                {errors.is_active && (
                  <p className="mt-1 text-sm text-red-600">{errors.is_active.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/customers")}
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
              {isSubmitting ? "Saving..." : isEdit ? "Update Customer" : "Create Customer"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
