# Delivery Centers Integration Guide

## Overview

The Distribution component now includes dynamic delivery center selection that integrates with the backend API to provide location and type-specific distribution centers.

## Key Features Implemented

### 1. Three-Step Progressive Selection

- **Step 1**: Location Selection (using tiles)
- **Step 2**: Distribution Type Selection (using radio buttons with icons)
- **Step 3**: Delivery Center Selection (using cards)

### 2. Accordion-Based UI

- Space-efficient design with collapsible sections
- Auto-progression between steps
- Visual indicators for completed selections

### 3. API Integration

- `GET /api/v1/locations` - Fetch available locations
- `GET /api/delivery-center-types` - Fetch distribution types
- `GET /api/v1/delivery-centers/by-location-and-type?locationId={id}&typeId={id}` - Fetch delivery centers
- `POST /api/v1/delivery-centers` - Create new delivery center

### 4. Dynamic State Management

- Automatic data fetching based on location and type selections
- Reset functionality when changing previous selections
- Loading states with spinners

### 5. Add New Distribution Centers

- **Create New Centers**: Users can add new distribution centers on the fly
- **Required Fields**: Name and Contact Number
- **Context Aware**: Automatically associates with selected location and type
- **Immediate Selection**: Newly created centers are automatically selected
- **Validation**: Form validation ensures required fields are filled

## Component Structure

### State Variables

```javascript
// Location and type data
const [locations, setLocations] = useState([]);
const [deliveryCenterTypes, setDeliveryCenterTypes] = useState([]);
const [selectedLocation, setSelectedLocation] = useState("");
const [selectedMode, setSelectedMode] = useState("");

// Delivery centers
const [deliveryCenters, setDeliveryCenters] = useState([]);
const [selectedDeliveryCenter, setSelectedDeliveryCenter] = useState("");
const [loadingCenters, setLoadingCenters] = useState(false);

// UI state
const [locationAccordionOpen, setLocationAccordionOpen] = useState(true);
const [typeAccordionOpen, setTypeAccordionOpen] = useState(false);
const [deliveryCenterAccordionOpen, setDeliveryCenterAccordionOpen] =
  useState(false);

// Add new center state
const [showAddCenterModal, setShowAddCenterModal] = useState(false);
const [newCenterName, setNewCenterName] = useState("");
const [newCenterContact, setNewCenterContact] = useState("");
const [addingCenter, setAddingCenter] = useState(false);
```

### Key Functions

#### `fetchDeliveryCenters(locationId, mode)`

- Fetches delivery centers based on location and distribution type
- Handles loading states and error scenarios
- Automatically called when both location and type are selected

#### `handleAddCenter()`

- Creates new delivery center with name and contact number
- Validates required fields before submission
- Automatically selects newly created center
- Handles loading states and error scenarios
- Refreshes the centers list with new addition

#### `resetAddCenterForm()`

- Clears form fields and closes add center modal
- Used for both cancel action and successful submission

#### Auto-progression Logic

- Location selection → Opens type accordion
- Type selection → Opens delivery center accordion
- Maintains user flow through the selection process

## API Service Functions

### New Functions Added to `apiService.js`

```javascript
// Get delivery centers by location and type
export const getDeliveryCentersByLocationAndType = async (
  locationId,
  typeId
) => {
  try {
    const response = await get(`${apiDomain}/api/v1/delivery-centers/by-location-and-type?locationId=${locationId}&typeId=${typeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery centers:', error);
    throw error;
  }
};

// Create a new delivery center
export const createDeliveryCenter = async (centerData) => {
  try {
    const response = await _fetch(`${apiDomain}/api/v1/delivery-centers`, "POST", centerData);
    return response.data;
  } catch (error) {
    console.error('Error creating delivery center:', error);
    throw error;
  }
};
};
```

## User Experience Flow

1. **Initial State**: Location accordion is open
2. **Location Selection**: User selects location → Type accordion opens
3. **Type Selection**: User selects distribution type → Delivery center accordion opens
4. **Center Selection**: User selects delivery center → Form becomes available
5. **Form Completion**: All distribution details can be filled

## Terminology Standardization

- Unified terminology: "Distribution Center" (instead of Hospital/Medical Camp/Home Care Center)
- Consistent labeling throughout the interface
- Dynamic center information display in form section

## Error Handling

- Empty API responses are handled gracefully
- Loading states provide user feedback
- Fallback messages when no centers are available
- Network error handling through existing error boundary

## Testing Scenarios

1. **Normal Flow**: Select location → type → center → complete form
2. **Add New Center**: Select location → type → click "Add New Center" → fill form → submit
3. **Change Location**: Verify all subsequent selections reset
4. **Change Type**: Verify delivery centers refresh for new type
5. **Empty Results**: Verify appropriate messaging when no centers available
6. **Loading States**: Verify spinners appear during API calls
7. **Form Validation**: Verify add center form requires both name and contact
8. **Auto Selection**: Verify newly created center is automatically selected

## Future Enhancements

1. **Search/Filter**: Add search functionality for delivery centers
2. **Favorites**: Allow users to mark frequently used centers
3. **Detailed View**: Add modal with complete center information
4. **Bulk Operations**: Support selecting multiple centers for batch distributions
5. **Map Integration**: Show center locations on interactive map

## Backend API Requirements

The component expects the following API response format:

### Delivery Centers Response

```json
[
  {
    "id": 1,
    "name": "Central Hospital",
    "address": "123 Main Street, City",
    "contactNumber": "123-456-7890",
    "locationId": 1,
    "typeId": 1
  }
]
```

### Create Delivery Center Request

```json
{
  "name": "New Distribution Center",
  "contactNumber": "123-456-7890",
  "locationId": 1,
  "typeId": 1
}
```

### Create Delivery Center Response

```json
{
  "id": 5,
  "name": "New Distribution Center",
  "contactNumber": "123-456-7890",
  "locationId": 1,
  "typeId": 1,
  "createdAt": "2025-09-01T18:30:00Z"
}
```

## Configuration

The component uses `deliveryCenterConfig.js` for:

- Icon mappings for distribution types
- Color schemes for UI elements
- Fallback data for development

This integration provides a seamless, user-friendly experience for selecting distribution centers while maintaining flexibility for future enhancements.
