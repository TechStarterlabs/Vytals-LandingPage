import { useState } from "react"
import { ChevronDown, ChevronRight, Play, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

const BC_BASE = "https://api.businesscentral.dynamics.com/v2.0/Sandbox1511_Test/api/bctech/tgl/v1.0"
const COMPANY_ID = "e801bcfb-6cd1-ed11-a7c9-000d3af27dfa"
const DEFAULT_TENANT_ID = import.meta.env.VITE_BC_TENANT_ID || ""
const DEFAULT_CLIENT_ID = import.meta.env.VITE_BC_CLIENT_ID || ""
const DEFAULT_CLIENT_SECRET = import.meta.env.VITE_BC_CLIENT_SECRET || ""

const ENDPOINTS = [
  // ── QR Details ──────────────────────────────────────────────────────────────
  {
    id: "qr-all",
    group: "QR Details",
    name: "Get All QR Details",
    method: "GET",
    path: `/companies(${COMPANY_ID})/qrDetailsAPI`,
    description: "Fetch all QR detail records from Business Central.",
    query: { $top: "10" },
    body: null,
  },
  {
    id: "qr-filter-f",
    group: "QR Details",
    name: "Filter — itemNo starts with 'F' & qrURL contains 'verify'",
    method: "GET",
    path: `/companies(${COMPANY_ID})/qrDetailsAPI`,
    description: "Exact filter from the client's curl example. Returns items where itemNo starts with 'F' and qrURL contains 'verify'.",
    query: { $filter: "startswith(itemNo,'F') and contains(qrURL,'verify')", $top: "20" },
    body: null,
  },
  {
    id: "qr-filter-v",
    group: "QR Details",
    name: "Filter — itemNo starts with 'V' & qrURL contains 'verify'",
    method: "GET",
    path: `/companies(${COMPANY_ID})/qrDetailsAPI`,
    description: "Same filter pattern for itemNo starting with 'V'.",
    query: { $filter: "startswith(itemNo,'V') and contains(qrURL,'verify')", $top: "20" },
    body: null,
  },
  {
    id: "qr-filter-verify",
    group: "QR Details",
    name: "Filter — qrURL contains 'verify'",
    method: "GET",
    path: `/companies(${COMPANY_ID})/qrDetailsAPI`,
    description: "All QR records where qrURL contains 'verify', regardless of itemNo.",
    query: { $filter: "contains(qrURL,'verify')", $top: "20" },
    body: null,
  },
  // ── COA Report ───────────────────────────────────────────────────────────────
  {
    id: "coa-all",
    group: "COA Report",
    name: "Get All COA Reports",
    method: "GET",
    path: `/companies(${COMPANY_ID})/coaReport`,
    description: "Fetch all COA reports without line expansion.",
    query: { $top: "10" },
    body: null,
  },
  {
    id: "coa-expand",
    group: "COA Report",
    name: "Get COA Reports — Expand coaReportLine",
    method: "GET",
    path: `/companies(${COMPANY_ID})/coaReport`,
    description: "Fetch COA reports with all test line items expanded.",
    query: { $expand: "coaReportLine", $top: "5" },
    body: null,
  },
  {
    id: "coa-by-id",
    group: "COA Report",
    name: "Get COA Report — By uniqueProductID",
    method: "GET",
    path: `/companies(${COMPANY_ID})/coaReport`,
    description: "Fetch COA report with lines for a specific uniqueProductID. This is the exact query from the client's curl example.",
    query: { $expand: "coaReportLine", $filter: "uniqueProductID eq '022503000001'" },
    body: null,
  },
]

const METHOD_COLORS = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-green-100 text-green-700",
}

// Group endpoints by their group label
const GROUPS = [...new Set(ENDPOINTS.map(e => e.group))]

function EndpointCard({ endpoint, token }) {
  const [open, setOpen] = useState(false)
  const [queryParams, setQueryParams] = useState(endpoint.query || {})
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const run = async () => {
    if (!token.trim()) {
      toast({ title: "No token", description: "Fetch a token first using the Auth panel above.", variant: "destructive" })
      return
    }
    setLoading(true)
    setResponse(null)
    try {
      const qs = Object.entries(queryParams)
        .filter(([, v]) => v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&")
      const fullUrl = `${BC_BASE}${endpoint.path}${qs ? "?" + qs : ""}`

      const proxyResponse = await apiClient.post('/admin/erp-proxy/request', {
        url: fullUrl,
        token
      })

      const result = {
        status: proxyResponse.status,
        ok: proxyResponse.ok,
        data: proxyResponse.data,
        elapsed: proxyResponse.elapsed
      }
      setResponse(result)

      // Fire-and-forget log
      apiClient.post('/admin/erp-logs', {
        endpoint: endpoint.path,
        method: endpoint.method,
        query_params: queryParams,
        response_status: proxyResponse.status,
        response_body: proxyResponse.data,
        error_message: proxyResponse.ok ? null : (proxyResponse.data?.error?.message || null),
        processing_time_ms: proxyResponse.elapsed
      }).catch(() => {})

    } catch (err) {
      const result = { status: 0, ok: false, data: { error: err.message }, elapsed: 0 }
      setResponse(result)
      apiClient.post('/admin/erp-logs', {
        endpoint: endpoint.path,
        method: endpoint.method,
        query_params: queryParams,
        response_status: 0,
        response_body: null,
        error_message: err.message,
        processing_time_ms: 0
      }).catch(() => {})
    } finally {
      setLoading(false)
    }
  }

  const methodColor = METHOD_COLORS[endpoint.method] || ""
  const fullUrl = `${BC_BASE}${endpoint.path}`

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-gray-800 shrink-0">{endpoint.name}</span>
        <div className="flex items-center gap-2 min-w-0">
          <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold font-mono ${methodColor}`}>
            {endpoint.method}
          </span>
          {open ? <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* LEFT — request */}
          <div className="px-5 py-4 space-y-4">
            <p className="text-sm text-gray-500">{endpoint.description}</p>

            <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 font-mono text-xs text-gray-600 break-all">
              <span className={`mr-2 font-bold rounded px-1.5 py-0.5 ${methodColor}`}>{endpoint.method}</span>
              {fullUrl}
            </div>

            {endpoint.query && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Query Parameters</p>
                <div className="space-y-2">
                  {Object.entries(queryParams).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="font-mono w-24 shrink-0 text-gray-500">{key}</span>
                      <Input
                        value={val}
                        onChange={(e) => setQueryParams(p => ({ ...p, [key]: e.target.value }))}
                        className="h-8 text-xs font-mono border-gray-200 flex-1"
                        placeholder={key}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={run}
              disabled={loading}
              className="bg-[#338291] hover:bg-[#2a6d7a] text-white h-9 px-5 text-sm"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Running...</>
                : <><Play className="h-4 w-4 mr-2" />Send Request</>
              }
            </Button>
          </div>

          {/* RIGHT — response */}
          <div className="px-5 py-4 flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">Response</p>

            {!response && !loading && (
              <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 min-h-[160px]">
                <p className="text-xs text-gray-400">Hit "Send Request" to see the response</p>
              </div>
            )}
            {loading && (
              <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 min-h-[160px]">
                <Loader2 className="h-5 w-5 text-[#338291] animate-spin" />
              </div>
            )}
            {response && (
              <div className="rounded-lg border border-gray-200 overflow-hidden flex flex-col flex-1">
                <div className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium shrink-0 ${response.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                  {response.ok ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <span>Status {response.status}</span>
                  {response.data?.value && (
                    <span className="text-xs opacity-70">· {response.data.value.length} record(s)</span>
                  )}
                  <span className="ml-auto text-xs font-normal opacity-70">{response.elapsed}ms</span>
                </div>
                <pre className="bg-gray-950 text-gray-100 text-xs p-4 overflow-auto max-h-96 leading-relaxed flex-1">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ERPApiTester() {
  const [clientId, setClientId] = useState(DEFAULT_CLIENT_ID)
  const [clientSecret, setClientSecret] = useState(DEFAULT_CLIENT_SECRET)
  const [tenantId, setTenantId] = useState(DEFAULT_TENANT_ID)
  const [token, setToken] = useState("")
  const [tokenLoading, setTokenLoading] = useState(false)
  const [tokenExpiry, setTokenExpiry] = useState(null)
  const { toast } = useToast()

  const fetchToken = async () => {
    setTokenLoading(true)
    try {
      const response = await apiClient.post('/admin/erp-proxy/token', {
        client_id: clientId,
        client_secret: clientSecret,
        tenant_id: tenantId
      })
      const data = response.data
      setToken(data.access_token)
      setTokenExpiry(new Date(Date.now() + data.expires_in * 1000))
      toast({ title: "Token fetched", description: `Expires in ${Math.round(data.expires_in / 60)} minutes`, variant: "success" })
    } catch (err) {
      toast({ title: "Auth failed", description: err.message, variant: "destructive" })
    } finally {
      setTokenLoading(false)
    }
  }

  const tokenIsValid = token && tokenExpiry && new Date() < tokenExpiry

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ERP API Tester</h1>
        <p className="text-sm text-gray-500 mt-1">
          Test Microsoft Dynamics 365 Business Central APIs — QR Details &amp; COA Reports
        </p>
      </div>

      {/* Auth Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
          <h2 className="text-sm font-semibold text-white">OAuth2 — Client Credentials</h2>
          <p className="text-xs text-white/70 mt-0.5">Token is fetched server-side to avoid CORS</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="text-sm font-medium text-gray-700">
              Tenant ID
              <Input value={tenantId} onChange={e => setTenantId(e.target.value)} className="mt-1.5 font-mono text-xs border-gray-300" />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Client ID
              <Input value={clientId} onChange={e => setClientId(e.target.value)} className="mt-1.5 font-mono text-xs border-gray-300" />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Client Secret
              <Input type="password" value={clientSecret} onChange={e => setClientSecret(e.target.value)} className="mt-1.5 font-mono text-xs border-gray-300" />
            </label>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={fetchToken}
              disabled={tokenLoading}
              className="bg-[#338291] hover:bg-[#2a6d7a] text-white h-9 px-5 text-sm"
            >
              {tokenLoading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Fetching...</>
                : <><RefreshCw className="h-4 w-4 mr-2" />{token ? "Refresh Token" : "Get Token"}</>
              }
            </Button>

            {token && (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  tokenIsValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${tokenIsValid ? "bg-green-500" : "bg-red-500"}`} />
                  {tokenIsValid ? `Valid · expires ${tokenExpiry.toLocaleTimeString()}` : "Expired"}
                </span>
              </div>
            )}
          </div>

          {token && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
              <p className="text-xs text-gray-500 mb-1 font-medium">Bearer Token (first 80 chars)</p>
              <p className="font-mono text-xs text-gray-700 break-all">{token.substring(0, 80)}...</p>
            </div>
          )}
        </div>
      </div>

      {/* Endpoint Groups */}
      {GROUPS.map(group => (
        <div key={group} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-800">{group}</h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          {ENDPOINTS.filter(e => e.group === group).map(ep => (
            <EndpointCard key={ep.id} endpoint={ep} token={token} />
          ))}
        </div>
      ))}
    </div>
  )
}
