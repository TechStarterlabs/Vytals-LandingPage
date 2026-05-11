# Vytals Frontend — Progress

**Last Updated:** May 7, 2026

---

## Customer-Facing Pages

| Page | Route | Status | Notes |
|---|---|---|---|
| Home | `/` | ✅ | Batch number input, navigates to /verify |
| Verification | `/verify` | ✅ | Handles both batch and serial flows |

### Verification Page Details
- Decodes `?ref=` param — supports JSON `{b, s}` and BC plain string `{lotNo}-{serialNo}` formats
- Batch flow: shows product image, name, batch code, batch verified badge
- Serial flow: shows product image, name, batch code, serial number, serial verified badge
- Scan type badge: 📦 Batch Verification (blue) / 🔍 Serial Verification (purple)
- Product image from Shopify shown in product info card (w-40 h-40)
- OTP flow → COA unlock → email COA
- `/:productSlug` and `/:productSlug/verify` routes **removed**

---

## Admin Portal Pages

### Authentication
| Page | Route | Status |
|---|---|---|
| Login | `/admin/login` | ✅ |

### Dashboard
| Page | Route | Status |
|---|---|---|
| Dashboard | `/admin/dashboard` | ✅ |

### Master
| Page | Route | Status |
|---|---|---|
| Products list | `/admin/products` | ✅ Live Shopify sync on load |
| Product detail | `/admin/products/:id` | ✅ Image, variants, batches, tags, description |
| Product form | `/admin/products/new` + `/:id/edit` | ✅ |
| Roles list | `/admin/roles` | ✅ |
| Role detail | `/admin/roles/:id` | ✅ |
| Role form | `/admin/roles/new` + `/:id/edit` | ✅ |
| API Clients | `/admin/clients` | ✅ |
| Client detail | `/admin/clients/:id` | ✅ |
| Client form | `/admin/clients/new` + `/:id/edit` | ✅ |

### Inventory
| Page | Route | Status |
|---|---|---|
| Batches list | `/admin/batches` | ✅ |
| Batch detail | `/admin/batches/:id` | ✅ |
| Batch form | `/admin/batches/new` + `/:id/edit` | ✅ |
| Serials list | `/admin/serials` | ✅ |
| Serial detail | `/admin/serials/:id` | ✅ |
| Serial form | `/admin/serials/new` + `/:id/edit` | ✅ |
| Serial bulk upload | `/admin/serials/bulk` | ✅ |
| COA list | `/admin/coa` | ✅ |
| COA detail | `/admin/coa/:id` | ✅ |
| COA form | `/admin/coa/new` + `/:id/edit` | ✅ |
| COA bulk upload | `/admin/coa/bulk` | ✅ |

### Logs
| Page | Route | Status | Notes |
|---|---|---|---|
| Scan Logs | `/admin/scan-logs` | ✅ | |
| Scan Log detail | `/admin/scan-logs/:id` | ✅ | |
| Integration Logs | `/admin/integration-logs` | ✅ | Inbound only (source=inbound) |
| Integration Log detail | `/admin/integration-logs/:logId` | ✅ | |
| ERP Logs | `/admin/erp-logs` | ✅ | BC outbound only (source=erp_bc) |
| ERP Log detail | `/admin/erp-logs/:logId` | ✅ | |

### ERP Sync
| Page | Route | Status | Notes |
|---|---|---|---|
| Sync Dashboard | `/admin/erp-sync` | ✅ | Manual trigger, live polling, state cards, recent runs |
| Sync History | `/admin/erp-sync-history` | ✅ | Paginated run history with all counts |
| Buffer Inspector | `/admin/erp-sync-buffer` | ✅ | Filter by status/source, shows validation errors |

### APIs
| Page | Route | Status |
|---|---|---|
| Vytals Integration API tester | `/admin/integration-api` | ✅ |
| ERP API tester (BC proxy) | `/admin/erp-api` | ✅ |

### Users
| Page | Route | Status |
|---|---|---|
| Customers list | `/admin/customers` | ✅ |
| Customer detail | `/admin/customers/:id` | ✅ |
| Customer form | `/admin/customers/new` + `/:id/edit` | ✅ |
| Admin Users list | `/admin/users` | ✅ |
| Admin User detail | `/admin/users/:id` | ✅ |
| Admin User form | `/admin/users/new` + `/:id/edit` | ✅ |

---

## Sidebar Navigation Groups

```
Dashboard
Master        → Products, Roles, API Clients
Inventory     → Batches, Serial Management, COA
Logs          → Scan Logs, Integration Logs, ERP Logs
APIs          → Vytals Integration API, ERP API
ERP Sync      → Sync Dashboard, Sync History, Buffer Inspector
Users         → Customers, Admin Users
```

---

## Key Components

| Component | Purpose |
|---|---|
| `DataTable` | Reusable table — pagination, search, CSV export, server/client-side |
| `AdminSidebar` | Collapsible, permission-filtered, group navigation |
| `ConfirmDialog` | Reusable confirmation modal |
| `PermissionRoute` | Wraps pages with permission check |
| `Loader` | Full-page loading state |
| Skeleton components | Per-page loading skeletons |

---

## API Integration Status

| Area | Status |
|---|---|
| Verification (batch + serial) | ✅ |
| OTP auth | ✅ |
| COA unlock + email | ✅ |
| Products (with live Shopify sync) | ✅ |
| Batches | ✅ |
| Serials | ✅ |
| COA | ✅ |
| Scan Logs | ✅ |
| Integration Logs (inbound) | ✅ |
| ERP Logs (BC outbound) | ✅ |
| ERP Sync (trigger, status, history, buffer) | ✅ |
| Customers + Shopify orders | ✅ |
| Admin Users | ✅ |
| Roles + Permissions | ✅ |
| API Clients | ✅ |
| Dashboard stats | ✅ |

---

## Design Tokens

- Primary: `#338291`
- Primary hover: `#2a6d7a`
- Green (verification): `var(--green)` / `#11b5b2`
- Background: `var(--bg)`
- Icons: Lucide React
- Components: shadcn/ui
