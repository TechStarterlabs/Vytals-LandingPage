# Button Styling Update - Admin Portal

## Date: March 6, 2026

## Overview
Updated all button styling across the admin portal to ensure consistency and match the new design system with brand color `#338291`.

---

## Changes Made

### 1. DataTable Component (`src/components/DataTable.jsx`)

#### Add Button
- **Before:** Used Button component with custom classes
- **After:** Regular button element with consistent styling
```jsx
<button
  onClick={onAdd}
  className="px-4 py-2 bg-[#338291] hover:bg-[#2a6d7a] text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
>
  <Plus className="h-4 w-4" />
  {addButtonText}
</button>
```

#### Export Button
- **Before:** Button component with variant="outline"
- **After:** Regular button element
```jsx
<button
  onClick={exportToCSV}
  className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm flex items-center gap-2 text-sm"
>
  <Download className="h-4 w-4" />
  <span className="hidden sm:inline">Export Excel</span>
</button>
```

#### Pagination Buttons
- **Before:** Button component with variant="outline"
- **After:** Regular button elements
```jsx
<button
  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
  disabled={currentPage === 1}
  className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
>
  Previous
</button>
```

#### Removed Dependency
- Removed `Button` component import from `@/components/ui/button`
- All buttons now use native HTML button elements with Tailwind classes

### 2. Serial Management Page (`src/pages/admin/Serials.jsx`)

#### Layout Update
- **Before:** Buttons above DataTable in separate div
- **After:** Buttons integrated into DataTable header via `customActions` prop

#### Bulk Upload Button Style
- **Before:** Gradient background with brand colors
- **After:** White background with brand color border
```jsx
<button
  onClick={() => navigate('/admin/serials/bulk')}
  className="px-4 py-2 bg-white hover:bg-gray-50 text-[#338291] border-2 border-[#338291] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
>
  <Upload className="h-4 w-4" />
  Bulk Upload
</button>
```

### 3. COA Page (`src/pages/admin/COA.jsx`)

#### Layout Update
- **Before:** Buttons above DataTable in separate div
- **After:** Buttons integrated into DataTable header via `customActions` prop

#### Bulk Upload Button Style
- **Before:** Gradient background with brand colors
- **After:** White background with brand color border
```jsx
<button
  onClick={() => navigate('/admin/coa/bulk')}
  className="px-4 py-2 bg-white hover:bg-gray-50 text-[#338291] border-2 border-[#338291] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
>
  <Upload className="h-4 w-4" />
  Bulk Upload
</button>
```

---

## Button Style Guide

### Primary Action Button (Add, Create, Save)
```jsx
className="px-4 py-2 bg-[#338291] hover:bg-[#2a6d7a] text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
```
- Background: Brand color `#338291`
- Hover: Darker shade `#2a6d7a`
- Text: White
- Icon: White (same as text)

### Secondary Action Button (Bulk Upload, Import)
```jsx
className="px-4 py-2 bg-white hover:bg-gray-50 text-[#338291] border-2 border-[#338291] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
```
- Background: White
- Hover: Light gray `gray-50`
- Text: Brand color `#338291`
- Border: 2px solid brand color
- Icon: Brand color (same as text)

### Outline Button (Export, Cancel)
```jsx
className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm flex items-center gap-2 text-sm"
```
- Background: Transparent
- Hover: Light gray `gray-50`
- Text: Gray
- Border: 1px solid gray-300

### Pagination Button
```jsx
// Active
className="px-3 py-1 text-sm rounded bg-[#338291] text-white"

// Inactive
className="px-3 py-1 text-sm rounded text-gray-700 hover:bg-gray-100 border border-gray-300"
```

### Disabled State
```jsx
disabled={condition}
className="... disabled:opacity-50 disabled:cursor-not-allowed"
```

---

## Affected Pages

### ✅ Updated
1. Products List - Add button matches new style
2. Batches List - Add button matches new style
3. Serials List - Add button + Bulk Upload button updated
4. COA List - Add button + Bulk Upload button updated
5. Customers List - Add button matches new style
6. Rewards List - Add button matches new style
7. Admin Users List - Add button matches new style
8. Scan Logs List - No add button (read-only)

### Layout Consistency
All pages now have buttons positioned on the right side of the page title, aligned with the subtitle.

---

## Benefits

1. **Consistency:** All buttons follow the same styling pattern
2. **Brand Identity:** Primary actions use brand color `#338291`
3. **Visual Hierarchy:** Clear distinction between primary and secondary actions
4. **Accessibility:** Proper disabled states and hover effects
5. **Maintainability:** No dependency on Button component, easier to customize
6. **Performance:** Lighter bundle size without Button component dependency

---

## Testing Checklist

- [x] Products page - Add button styling
- [x] Batches page - Add button styling
- [x] Serials page - Add button + Bulk Upload button
- [x] COA page - Add button + Bulk Upload button
- [x] Customers page - Add button styling
- [x] Rewards page - Add button styling
- [x] Admin Users page - Add button styling
- [x] Export buttons on all pages
- [x] Pagination buttons on all pages
- [x] Hover states
- [x] Disabled states
- [x] Mobile responsiveness

---

**Last Updated:** March 6, 2026
**Document Version:** 1.0
