import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"
import { usePermissions } from "@/contexts/PermissionContext"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { refreshPermissions } = usePermissions()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Login failed')
      }

      // Store token and user
      authService.setToken(result.data.token)
      authService.setUser(result.data.user)
      
      toast({
        title: "Success",
        description: "Login successful!",
        variant: "success",
      })
      
      // Refresh permissions and navigate
      await refreshPermissions()
      navigate('/admin/dashboard')
      
    } catch (err) {
      setError("root", {
        message: err.message || "Invalid email or password"
      })
      toast({
        title: "Error",
        description: err.message || "Invalid email or password",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-lg bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Admin Login</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access the admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-primary bg-background'
                }`}
                placeholder="admin@vytals.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
                className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.password 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-primary bg-background'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{errors.root.message}</span>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}
