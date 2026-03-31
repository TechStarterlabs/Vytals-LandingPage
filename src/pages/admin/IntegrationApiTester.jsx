import { useState } from "react"
import { ChevronDown, ChevronRight, Play, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1").replace("/api/v1", "")

const ENDPOINTS = [
  {
    id: "sync-product",
    name: "Sync Product",
    method: "POST",
    path: "/api/v1/integration/products",
    description: "Create or update a product. If product_code exists, it updates. Otherwise creates a new one.",
    body: { product_code: "VSR001", name: "Premium Omega-3", pack_type: "Bottle", pack_size: "60 capsules" },
    query: null,
  },
  {
    id: "sync-batch",
    name: "Sync Batch",
    method: "POST",
    path: "/api/v1/integration/batches",
    description: "Create or update a batch. Product must exist before creating a batch.",
    body: { batch_code: "BATCH-2024-001", product_code: "VSR001", expiry_date: "2025-12-31" },
    query: null,
  },
  {
    id: "sync-serials",
    name: "Sync Serials (Bulk)",
    method: "POST",
    path: "/api/v1/integration/serials/bulk",
    description: "Create serial numbers in bulk (max 10,000 per request). Batch must exist first.",
    body: { batch_code: "BATCH-2024-001", serial_numbers: ["VSR000000001", "VSR000000002", "VSR000000003"] },
    query: null,
  },
  {
    id: "sync-coa",
    name: "Sync Certificate of Analysis",
    method: "POST",
    path: "/api/v1/integration/coa",
    description: "Create or update Certificate of Analysis for a batch. Batch must exist first.",
    body: { batch_code: "BATCH-2024-001", file_url: "http://localhost:8080/uploads/sample-coa.pdf", issue_date: "2024-11-07" },
    query: null,
  },
  {
    id: "get-status",
    name: "Get Status",
    method: "GET",
    path: "/api/v1/integration/status",
    description: "Get integration statistics: total requests, success rate, and average processing time.",
    body: null,
    query: null,
  },
  {
    id: "get-logs",
    name: "Get Logs",
    method: "GET",
    path: "/api/v1/integration/logs",
    description: "Get integration request logs with pagination. Optionally filter by status (success / error).",
    body: null,
    query: { page: "1", limit: "50", status: "" },
  },
]

const METHOD_COLORS = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-green-100 text-green-700",
  PUT: "bg-yellow-100 text-yellow-700",
  DELETE: "bg-red-100 text-red-700",
}

function EndpointCard({ endpoint, apiKey }) {
  const [open, setOpen] = useState(false)
  const [bodyText, setBodyText] = useState(
    endpoint.body ? JSON.stringify(endpoint.body, null, 2) : ""
  )
  const [queryParams, setQueryParams] = useState(endpoint.query || {})
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const run = async () => {
    if (!apiKey.trim()) {
      toast({ title: "API Key required", description: "Enter an API key above before running.", variant: "destructive" })
      return
    }
    setLoading(true)
    setResponse(null)
    try {
      let url = BASE_URL + endpoint.path
      if (endpoint.query) {
        const qs = Object.entries(queryParams)
          .filter(([, v]) => v !== "")
          .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
          .join("&")
        if (qs) url += "?" + qs
      }
      const options = {
        method: endpoint.method,
        headers: {
          "X-API-Key": apiKey,
          ...(endpoint.body !== null && { "Content-Type": "application/json" }),
        },
      }
      if (endpoint.method !== "GET" && bodyText.trim()) {
        options.body = bodyText
      }
      const start = Date.now()
      const res = await fetch(url, options)
      const elapsed = Date.now() - start
      const data = await res.json().catch(() => null)
      setResponse({ status: res.status, ok: res.ok, data, elapsed })
    } catch (err) {
      setResponse({ status: 0, ok: false, data: { error: err.message }, elapsed: 0 })
    } finally {
      setLoading(false)
    }
  }

  const methodColor = METHOD_COLORS[endpoint.method] || ""

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Accordion header: name left, method + path + chevron right */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-gray-800 shrink-0">{endpoint.name}</span>
        <div className="flex items-center gap-2 min-w-0">
          <span className={"shrink-0 rounded px-2 py-0.5 text-xs font-bold font-mono " + methodColor}>
            {endpoint.method}
          </span>
          <span className="font-mono text-xs text-gray-500 truncate hidden sm:block">{endpoint.path}</span>
          {open
            ? <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            : <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
          }
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

          {/* LEFT — request */}
          <div className="px-5 py-4 space-y-4">
            <p className="text-sm text-gray-500">{endpoint.description}</p>

            {/* Full URL */}
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 font-mono text-xs text-gray-600 break-all">
              <span className={"mr-2 font-bold rounded px-1.5 py-0.5 " + methodColor}>
                {endpoint.method}
              </span>
              {BASE_URL}{endpoint.path}
            </div>

            {/* Query params */}
            {endpoint.query && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Query Parameters</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(queryParams).map(([key, val]) => (
                    <label key={key} className="text-xs text-gray-600">
                      <span className="font-mono">{key}</span>
                      <Input
                        value={val}
                        onChange={(e) => setQueryParams((p) => ({ ...p, [key]: e.target.value }))}
                        className="mt-1 h-8 text-xs font-mono border-gray-200"
                        placeholder={key}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Body */}
            {endpoint.body !== null && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Request Body</p>
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={Object.keys(endpoint.body).length + 3}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#338291]/30 resize-y"
                  spellCheck={false}
                />
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
                <p className="text-xs text-gray-400">Hit &quot;Send Request&quot; to see the response</p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 min-h-[160px]">
                <Loader2 className="h-5 w-5 text-[#338291] animate-spin" />
              </div>
            )}

            {response && (
              <div className="rounded-lg border border-gray-200 overflow-hidden flex flex-col flex-1">
                <div className={"flex items-center gap-2 px-4 py-2.5 text-sm font-medium shrink-0 " + (response.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800")}>
                  {response.ok
                    ? <CheckCircle className="h-4 w-4" />
                    : <XCircle className="h-4 w-4" />
                  }
                  <span>Status {response.status}</span>
                  <span className="ml-auto text-xs font-normal opacity-70">{response.elapsed}ms</span>
                </div>
                <pre className="bg-gray-950 text-gray-100 text-xs p-4 overflow-auto max-h-80 leading-relaxed flex-1">
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

export default function IntegrationApiTester() {
  const [apiKey, setApiKey] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Integration API Tester</h1>
        <p className="text-sm text-gray-500 mt-1">Test the Vytals Integration API endpoints directly from the admin portal</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <label className="flex-1 text-sm font-medium text-gray-700">
            API Key (X-API-Key)
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1.5 font-mono text-sm border-gray-300"
              placeholder="vyt_..."
            />
          </label>
          <p className="text-xs text-gray-400 pb-2">
            Sent as <code className="bg-gray-100 px-1 rounded">X-API-Key</code> header on every request
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {ENDPOINTS.map((ep) => (
          <EndpointCard key={ep.id} endpoint={ep} apiKey={apiKey} />
        ))}
      </div>
    </div>
  )
}
