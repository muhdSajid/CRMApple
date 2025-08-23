# Medicine Batch Creation Guide

## Overview

The ViewStock component has been enhanced to save medicine batches to the database using the API endpoint `POST /api/v1/batches`. This functionality aligns with the provided curl command structure.

## Features Added

### 1. Database Integration

- **API Functions Added**:
  - `createBatch(batchData)` - Creates a new batch in the database
  - `getMedicines()` - Fetches available medicines for selection
  - `getLocations()` - Fetches available storage locations

### 2. Enhanced Form Fields

The batch creation form now includes all required fields from the API:

- **Medicine Selection**: Dropdown to select from available medicines
- **Batch Name**: Unique identifier for the batch
- **Location**: Storage location selection
- **Expiry Date**: Batch expiration date
- **Initial Quantity**: Starting quantity of medicines
- **Current Quantity**: Current available quantity (auto-filled from initial quantity)
- **Total Price**: Total cost of the batch
- **Unit Price**: Price per medicine unit (auto-calculated)
- **Purchase Type**: Purchase or Donation (from database)
- **Active Status**: Always set to true

### 3. API Data Structure

The batch data sent to the API follows this structure:

```javascript
{
  batchName: "BATCH-001-2025",
  medicineId: 1,
  expiryDate: "2025-12-31T23:59:59.000Z",
  initialQuantity: 100,
  currentQuantity: 100,
  totalPrice: 1000.00,
  unitPrice: 10.00,
  purchaseTypeId: 1,
  locationId: 1,
  isActive: true
}
```

## Usage Instructions

### For Users:

1. **Navigate to Medicine Stock page**
2. **Click the "View List" button** for any medicine to open the ViewStock modal
3. **Click the green '+' button** to add a new batch
4. **Fill in the form fields**:
   - Select Medicine (pre-filled if opened from a specific medicine)
   - Enter Batch Name
   - Select Location
   - Set Expiry Date
   - Enter Initial Quantity
   - Optionally adjust Current Quantity
   - Enter Total Price (Unit Price will auto-calculate)
   - Select Purchase Type
5. **Click Save** to create the batch in the database

### For Developers:

#### API Endpoint Setup

Ensure the backend API supports these endpoints:

- `GET /api/v1/medicines` - Returns list of medicines
- `GET /api/v1/locations` - Returns list of storage locations
- `GET /api/v1/purchase-types` - Returns list of purchase types
- `POST /api/v1/batches` - Creates a new batch

#### Component Props

The ViewStock component accepts:

- `isOpen`: Boolean to control modal visibility
- `onClose`: Function to close the modal
- `selectedMedicineId`: Optional ID to pre-select a medicine

#### Example Component Usage

```jsx
<ViewStock
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  selectedMedicineId={selectedMedicineId} // Optional
/>
```

## Validation Rules

- **Required Fields**: Medicine, Batch Name, Location, Expiry Date, Initial Quantity, Total Price
- **Date Validation**: Expiry date must be in the future
- **Numeric Validation**: Quantities and prices must be positive numbers
- **Auto-calculations**: Unit price auto-calculates from total price and quantity

## Error Handling

The component handles various error scenarios:

- Network connectivity issues
- API endpoint failures
- Validation errors
- Authentication failures

Success and error messages are displayed using toast notifications.

## Testing the Functionality

To test the batch creation:

1. Ensure the backend API is running on `http://localhost:8081`
2. Make sure you have valid authentication tokens
3. Verify the required API endpoints are available
4. Test with the provided curl command structure

### Sample cURL for Testing:

```bash
curl -X POST http://localhost:8081/api/v1/batches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "batchName": "BATCH-001-2025",
    "medicineId": 1,
    "expiryDate": "2025-12-31T23:59:59",
    "initialQuantity": 100,
    "currentQuantity": 100,
    "totalPrice": 1000.00,
    "unitPrice": 10.00,
    "purchaseTypeId": 1,
    "locationId": 1,
    "isActive": true
  }'
```

## Notes

- The component maintains backward compatibility with existing functionality
- All new batches are created with `isActive: true` by default
- The UI updates immediately upon successful batch creation
- Form validation prevents submission of incomplete data
- Auto-calculation features help reduce user input errors
