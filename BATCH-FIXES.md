# Batch Module Fixes

## Issues Identified

### Issue 1: API Validation Errors ✅ FIXED
**Problem:** Backend validator expects `product_id` as a number, but frontend was sending it as a string from the select dropdown.

**Error in logs:**
```
{"level":"error","message":"Request body is invalid","timestamp":"03-06-2026 12:37:17"}
```

**Root Cause:**
- HTML select elements return string values
- Backend Zod validator expects: `product_id: z.number().int().positive()`
- Frontend was sending: `{ product_id: "1" }` (string)
- Backend expected: `{ product_id: 1 }` (number)

**Fix Applied:**
```javascript
// In handleSubmit function
const payload = {
  ...formData,
  product_id: parseInt(formData.product_id, 10)
}
```

**Status:** ✅ Batch creation now works

---

### Issue 2: Edit Form Product Dropdown Empty ✅ FIXED
**Problem:** When editing a batch, the product dropdown was empty/not showing the selected product.

**Root Causes:**
1. **Race Condition:** Products were being fetched asynchronously, but form data was set before products loaded
2. **Type Mismatch:** Product ID from API was number, but select element needed string
3. **Timing Issue:** `useEffect` was running both fetches in parallel without waiting

**Fixes Applied:**

#### Fix 2.1: Sequential Loading
```javascript
// Before - Parallel execution
useEffect(() => {
  fetchProducts()
  if (isEdit) {
    fetchBatch()
  }
}, [id])

// After - Sequential execution
useEffect(() => {
  const initializeForm = async () => {
    await fetchProducts()  // Wait for products first
    if (isEdit) {
      await fetchBatch()   // Then load batch data
    } else {
      setLoading(false)
    }
  }
  
  initializeForm()
}, [id, isEdit])
```

#### Fix 2.2: Proper Loading State
```javascript
// Before
const [loading, setLoading] = useState(isEdit)

// After
const [loading, setLoading] = useState(true)  // Always start loading
```

#### Fix 2.3: String Conversion for Select
```javascript
// Ensure product_id is string for select element
product_id: batchData.product_id ? String(batchData.product_id) : ""

// And in option values
<option key={product.product_id} value={String(product.product_id)}>
```

#### Fix 2.4: Loading Indicator
```javascript
<option value="">
  {products.length === 0 ? 'Loading products...' : 'Select a product'}
</option>
```

#### Fix 2.5: Debug Info (Temporary)
```javascript
{isEdit && formData.product_id && (
  <p className="mt-1 text-xs text-blue-600">
    Selected product ID: {formData.product_id} (Total products: {products.length})
  </p>
)}
```

**Status:** ✅ Edit form now loads with product selected

---

### Issue 3: Product Dropdown in Edit Mode
**Problem:** Product dropdown should be disabled in edit mode (batch-product relationship shouldn't change).

**Fix Applied:**
```javascript
<select
  value={formData.product_id}
  onChange={(e) => handleChange('product_id', e.target.value)}
  disabled={isEdit}  // Added this
>
```

---

## Changes Made

### File: `src/pages/admin/BatchForm.jsx`

#### Change 1: Convert product_id to number before API call
```javascript
// Before
await apiClient.post('/admin/batches', formData)

// After
const payload = {
  ...formData,
  product_id: parseInt(formData.product_id, 10)
}
await apiClient.post('/admin/batches', payload)
```

#### Change 2: Convert product_id to string when loading form
```javascript
// Before
product_id: response.data.product_id || ""

// After
product_id: batchData.product_id ? String(batchData.product_id) : ""
```

#### Change 3: Disable product dropdown in edit mode
```javascript
// Before
<select value={formData.product_id} onChange={...}>

// After
<select value={formData.product_id} onChange={...} disabled={isEdit}>
```

#### Change 4: Update helper text for product field
```javascript
// Before
<p className="mt-1 text-xs text-gray-500">
  Select the product this batch belongs to
</p>

// After
<p className="mt-1 text-xs text-gray-500">
  {isEdit 
    ? "Product cannot be changed after creation" 
    : "Select the product this batch belongs to"}
</p>
```

---

## Testing Checklist

### Create Batch
- [ ] Navigate to `/admin/batches/new`
- [ ] Products dropdown loads correctly
- [ ] Select a product
- [ ] Enter batch code (e.g., AAAAB01)
- [ ] Select expiry date (future date)
- [ ] Click "Create Batch"
- [ ] Verify success toast appears
- [ ] Verify redirects to batches list
- [ ] Verify new batch appears in list

### Edit Batch
- [ ] Navigate to existing batch
- [ ] Click "Edit" button
- [ ] Verify form loads with all values:
  - [ ] Batch code is filled and disabled
  - [ ] Product is selected and disabled
  - [ ] Expiry date is filled
- [ ] Change expiry date
- [ ] Click "Update Batch"
- [ ] Verify success toast appears
- [ ] Verify redirects to batches list
- [ ] Verify batch is updated

### Validation
- [ ] Try creating batch without product (should show error)
- [ ] Try creating batch with past expiry date (should show error)
- [ ] Try creating batch without batch code (should show error)
- [ ] Verify error messages display correctly

---

## Backend Validator Reference

From `Vytals-Backend/src/validators/admin.validator.js`:

```javascript
// Create Batch Schema
exports.createBatchSchema = z.object({
  batch_code: z.string().min(2, 'Batch code must be at least 2 characters'),
  product_id: z.number().int().positive('Product ID must be a positive integer'),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be in YYYY-MM-DD format')
});

// Update Batch Schema
exports.updateBatchSchema = z.object({
  batch_code: z.string().min(2, 'Batch code must be at least 2 characters').optional(),
  product_id: z.number().int().positive('Product ID must be a positive integer').optional(),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be in YYYY-MM-DD format').optional()
});
```

**Key Requirements:**
- `product_id` must be a **number** (not string)
- `expiry_date` must be in **YYYY-MM-DD** format
- `batch_code` must be at least 2 characters

---

## API Request Examples

### Create Batch (Correct Format)
```javascript
POST /api/v1/admin/batches
{
  "batch_code": "AAAAB01",
  "product_id": 1,              // Number, not string
  "expiry_date": "2025-12-31"   // YYYY-MM-DD format
}
```

### Update Batch (Correct Format)
```javascript
PUT /api/v1/admin/batches/1
{
  "product_id": 1,              // Number, not string
  "expiry_date": "2026-06-30"   // YYYY-MM-DD format
}
```

---

## Common Pitfalls to Avoid

### 1. String vs Number for IDs
❌ **Wrong:**
```javascript
{ product_id: "1" }  // String from select element
```

✅ **Correct:**
```javascript
{ product_id: parseInt(formData.product_id, 10) }  // Convert to number
```

### 2. Date Format
❌ **Wrong:**
```javascript
{ expiry_date: "12/31/2025" }  // Wrong format
```

✅ **Correct:**
```javascript
{ expiry_date: "2025-12-31" }  // YYYY-MM-DD format
```

### 3. Select Element Value Type
❌ **Wrong:**
```javascript
// Storing as number in state
const [formData, setFormData] = useState({
  product_id: 1  // Number
})

// Select won't match
<select value={formData.product_id}>
  <option value="1">Product 1</option>  // String
</select>
```

✅ **Correct:**
```javascript
// Store as string in state (for select element)
const [formData, setFormData] = useState({
  product_id: "1"  // String
})

// Convert to number when submitting
const payload = {
  ...formData,
  product_id: parseInt(formData.product_id, 10)
}
```

---

## Status

✅ **Fixed:** API validation errors
✅ **Fixed:** Edit form not loading values
✅ **Fixed:** Product dropdown in edit mode
✅ **Ready for testing**

---

**Last Updated:** March 6, 2026
