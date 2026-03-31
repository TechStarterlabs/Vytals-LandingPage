import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, User, ShoppingBag, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { shopifyApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function CustomerView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shopifyData, setShopifyData] = useState(null)
  const [shopifyLoading, setShopifyLoading] = useState(false)
  const [shopifyFetched, setShopifyFetched] = useState(false)

  useEffect(() => {
    fetchCustomer()
    fetchShopifyOrders()
  }, [id])

  const fetchCustomer = async () => {
    try {
      const response = await apiClient.get(`/admin/users/${id}`)
      const user = response.data.user
      setCustomer(user)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customer details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchShopifyOrders = async () => {
    setShopifyLoading(true)
    try {
      const response = await shopifyApi.getCustomerOrders(id)
      setShopifyData(response.data)
      setShopifyFetched(true)
      // Refresh customer to get updated is_shopify_customer flag
      const userRes = await apiClient.get(`/admin/users/${id}`)
      setCustomer(userRes.data.user)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Shopify data",
        variant: "destructive"
      })
    } finally {
      setShopifyLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer?")) return
    try {
      await apiClient.delete(`/admin/users/${id}`)
      toast({
        title: "Success",
        description: "Customer deleted successfully",
        variant: "success"
      })
      navigate("/admin/customers")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive"
      })
    }
  }

  // Derive unique products from scan logs via batch → product
  const getUniqueProducts = (scanLogs = []) => {
    const seen = new Set()
    const products = []
    for (const log of scanLogs) {
      const product = log.batch?.product
      if (product && !seen.has(product.product_id)) {
        seen.add(product.product_id)
        products.push(product)
      }
    }
    return products
  }

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Customer not found</div>
      </div>
    )
  }

  const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(" ")
  const scanLogs = customer.scan_logs || []
  const uniqueProducts = getUniqueProducts(scanLogs)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Details</h1>
            <p className="text-sm text-gray-500 mt-1">View customer information</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/customers/${id}/edit`)}
            className="border-gray-300"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Identity summary — Req 3.1, 3.5 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {fullName || customer.mobile_number}
            </h2>
            {fullName && (
              <p className="text-sm text-white/80">{customer.mobile_number}</p>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">First Name</label>
            <p className="mt-1 text-base text-gray-900">{customer.first_name || "-"}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Last Name</label>
            <p className="mt-1 text-base text-gray-900">{customer.last_name || "-"}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Mobile</label>
            <p className="mt-1 text-base text-gray-900">{customer.mobile_number}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-base text-gray-900">{customer.email || "-"}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  customer.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {customer.is_active ? "Active" : "Inactive"}
              </span>
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Points Balance</label>
            <p className="mt-1 text-base font-semibold text-[#338291]">
              {customer.points_balance || 0}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Total Scans</label>
            <p className="mt-1 text-base text-gray-900">{customer.scan_count || 0}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Last Login</label>
            <p className="mt-1 text-base text-gray-900">{formatDate(customer.last_login_at)}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Created Date</label>
            <p className="mt-1 text-base text-gray-900">
              {customer.created_at
                ? new Date(customer.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-"}
            </p>
          </div>

          {customer.role && (
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="mt-1 text-base text-gray-900 capitalize">{customer.role.name}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500">Shopify Customer</label>
            <p className="mt-1">
              {customer.is_shopify_customer === null || customer.is_shopify_customer === undefined ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Not checked
                </span>
              ) : customer.is_shopify_customer ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Yes
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  No
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Shopify Purchase History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Shopify Purchase History</h2>
            {shopifyFetched && !shopifyLoading && (
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                shopifyData?.is_shopify_customer
                  ? "bg-green-400/30 text-white"
                  : "bg-red-400/30 text-white"
              }`}>
                {shopifyData?.is_shopify_customer ? "Shopify Customer" : "Not on Shopify"}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchShopifyOrders}
            disabled={shopifyLoading}
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${shopifyLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="p-6">
          {shopifyLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : !shopifyData?.is_shopify_customer ? (
            <p className="text-sm text-gray-500">This customer has no Shopify account linked to their mobile number.</p>
          ) : shopifyData.shopify?.orders?.length === 0 ? (
            <p className="text-sm text-gray-500">Shopify customer found but no orders yet.</p>
          ) : (
            <div className="space-y-4">
              {shopifyData.shopify.orders.map((order, i) => (
                <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <span className="font-semibold text-gray-900 text-sm">{order.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </span>
                      <span className="text-sm font-semibold text-[#338291]">
                        ₹{parseFloat(order.total_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {order.line_items.map((item, j) => (
                        <tr key={j} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-gray-800">{item.title}</td>
                          <td className="px-4 py-2.5 text-center text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-right text-gray-800">₹{parseFloat(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scan History — Req 3.3 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
          <h2 className="text-lg font-semibold text-white">
            Scan History ({scanLogs.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {scanLogs.length === 0 ? (
            <div className="p-6">
              <p className="text-gray-500 text-sm">No scan history available</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Product Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Batch Code</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Serial Number</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Scan Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scanLogs.map((log) => (
                  <tr key={log.scan_log_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {log.batch?.product?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                      {log.batch?.batch_code || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                      {log.serial_number
                        ? log.serial_number.serial_code || log.serial_number.serial_number_id
                        : <span className="text-gray-400 italic">Batch Entry</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {log.scan_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.status === "SUCCESS"
                            ? "bg-green-100 text-green-700"
                            : log.status === "COA_UNLOCKED"
                            ? "bg-teal-100 text-teal-700"
                            : log.status === "EXPIRED"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
