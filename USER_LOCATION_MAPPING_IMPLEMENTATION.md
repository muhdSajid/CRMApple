# User Location Mapping Implementation

## Overview

Added location mapping functionality to the User Management page, allowing administrators to assign locations to users. Users can be mapped to multiple locations, and the mapping can be updated at any time.

## Implementation Details

### 1. Redux Store Enhancement (`src/store/usersSlice.js`)

Added three new async thunks for location management:

#### Fetch All Locations

```javascript
export const fetchAllLocations = createAsyncThunk(
  "users/fetchAllLocations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/v1/locations");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch locations";
      return rejectWithValue(message);
    }
  }
);
```

#### Fetch User Locations

```javascript
export const fetchUserLocations = createAsyncThunk(
  "users/fetchUserLocations",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/user-locations/user/${userId}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch user locations";
      return rejectWithValue(message);
    }
  }
);
```

#### Update User Locations

```javascript
export const updateUserLocations = createAsyncThunk(
  "users/updateUserLocations",
  async ({ userId, locationIds }, { rejectWithValue }) => {
    try {
      const response = await api.put("/v1/user-locations", {
        userId: userId,
        locationIds: locationIds,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update user locations";
      return rejectWithValue(message);
    }
  }
);
```

**State Management:**

- Added `locations` array to store all available locations
- Added `userLocations` array to store user-specific location mappings
- Proper loading, success, and error state handling

### 2. API Endpoints

#### Get All Locations

**Endpoint:** `GET /api/v1/locations`

**Response:**

```json
[
  {
    "id": 2,
    "name": "Mangaluru",
    "locationAddress": "Mangaluru",
    "imagePath": "Mangaluru",
    "isActive": true,
    "isDelete": false
  }
]
```

#### Get User Locations

**Endpoint:** `GET /api/v1/user-locations/user/{userId}`

**Authentication:** Uses Bearer token (automatically added via axios interceptors)

**Response:**

```json
[
  {
    "id": 1,
    "userId": 1,
    "locationId": 2,
    "isActive": true,
    "createdAt": "2025-12-01T10:00:00",
    "updatedAt": "2025-12-05T14:30:00",
    "locationName": "Main Warehouse",
    "locationAddress": "123 Main Street, City, State 12345"
  }
]
```

#### Update User Locations

**Endpoint:** `PUT /api/v1/user-locations`

**Request Body:**

```json
{
  "userId": 1,
  "locationIds": [2, 5, 7]
}
```

**Note:** The user's curl examples show port 8080, but the application is configured for port 8081. Update `vite.config.js` if your backend runs on 8080:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    secure: false,
  },
}
```

### 3. User Management Component (`src/components/usermanagment/UserManagment.jsx`)

#### Manage Locations Button

- Added purple location icon button in the Actions column
- Protected by privilege guard (requires `user.update`, `user.*`, or `*` privilege)
- Fetches locations and user locations on click

```jsx
<button
  onClick={() => handleManageLocations(user)}
  disabled={isLoading}
  className="group relative flex items-center justify-center w-8 h-8 text-purple-600 hover:text-white bg-purple-50 hover:bg-purple-600 border border-purple-200 hover:border-purple-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  title="Manage Locations"
>
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
</button>
```

#### Handler Functions

**Manage Locations Handler:**

```javascript
const handleManageLocations = async (user) => {
  setSelectedUser(user);

  // Fetch all locations if not already loaded
  if (locations.length === 0) {
    await dispatch(fetchAllLocations());
  }

  // Fetch user's current locations
  await dispatch(fetchUserLocations(user.id));

  setShowLocationModal(true);
};
```

**Checkbox Change Handler:**

```javascript
const handleLocationCheckboxChange = (locationId) => {
  setSelectedLocationIds((prev) => {
    if (prev.includes(locationId)) {
      return prev.filter((id) => id !== locationId);
    } else {
      return [...prev, locationId];
    }
  });
};
```

**Save Locations Handler:**

```javascript
const handleSaveLocations = () => {
  dispatch(
    updateUserLocations({
      userId: selectedUser.id,
      locationIds: selectedLocationIds,
    })
  );

  setShowLocationModal(false);
  setSelectedUser(null);
  setSelectedLocationIds([]);
};
```

#### Location Mapping Modal

The modal features:

1. **User Context** - Shows user's full name in header
2. **Location List** - Displays all available locations with checkboxes
3. **Interactive Selection** - Click anywhere on location card to toggle
4. **Visual Feedback**:
   - Selected locations highlighted with blue border and background
   - Active/Inactive status badges
   - Location address displayed
5. **Selection Counter** - Shows how many locations are selected
6. **Action Buttons** - Cancel and Save with loading states

**Modal Design:**

```
┌─────────────────────────────────────────────┐
│ MANAGE LOCATIONS FOR John Doe        [×]    │
├─────────────────────────────────────────────┤
│ Select the locations this user should       │
│ have access to:                             │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ ☑ Main Warehouse           [Active] │    │
│ │   123 Main Street, City             │    │
│ │                                     │    │
│ │ ☐ Distribution Center      [Active] │    │
│ │   789 Commerce Blvd, City           │    │
│ │                                     │    │
│ │ ☑ Satellite Office        [Inactive]│    │
│ │   456 Office Park, City             │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ ℹ 2 locations selected                     │
│                                             │
│                    [Cancel] [Save Locations]│
└─────────────────────────────────────────────┘
```

### 4. State Synchronization

**Location Selection Sync Effect:**

```javascript
useEffect(() => {
  if (showLocationModal && userLocations.length >= 0) {
    // Extract location IDs from userLocations
    const locationIds = userLocations.map((ul) => ul.locationId);
    setSelectedLocationIds(locationIds);
  }
}, [userLocations, showLocationModal]);
```

This effect automatically:

- Runs when modal opens
- Extracts location IDs from the user's current locations
- Pre-selects checkboxes for existing locations

### 5. Security Features

**Privilege-Based Access:**

- Manage Locations button only visible to users with proper privileges:
  - `user.update`
  - `user.*`
  - `*` (superadmin)

**Secure Token Handling:**

- Uses existing authentication mechanism
- Bearer token automatically added via axios interceptors
- Token validation and error handling

### 6. User Experience Flow

1. **Admin clicks Manage Locations button (purple pin icon)**

   - System fetches all available locations
   - System fetches user's current location mappings
   - Modal opens with locations pre-selected

2. **Admin selects/deselects locations**

   - Click anywhere on location card to toggle
   - Visual feedback with blue highlighting
   - Counter updates to show selection count

3. **Admin saves changes**

   - API call updates user-location mappings
   - Success toast notification
   - Modal closes automatically

4. **Error handling**
   - Network errors → Error toast
   - Backend errors → Error toast with message
   - Loading states prevent duplicate submissions

## UI Components

### Actions Column Layout

```
View (Blue) | Edit (Green) | Reset Password (Orange) | Manage Locations (Purple)
```

### Location Modal Features

- ✅ Scrollable location list (max height: 384px)
- 📍 Location pin icon for empty state
- ✓ Checkbox for each location
- 🎨 Blue highlight for selected items
- 🏷️ Active/Inactive status badges
- 📍 Address display
- 📊 Selection counter
- 🔘 Cancel and Save buttons with loading states

## Testing

### Test Scenarios

1. **Open Location Modal**

   - Click manage locations button
   - Verify all locations are fetched
   - Verify user's current locations are pre-selected
   - Verify modal displays correctly

2. **Select Locations**

   - Click checkboxes to select/deselect
   - Verify visual feedback (blue highlight)
   - Verify counter updates correctly
   - Verify clicking card area toggles checkbox

3. **Save Locations**

   - Make changes to selections
   - Click "Save Locations"
   - Verify API call with correct locationIds array
   - Verify success toast
   - Verify modal closes

4. **Cancel Changes**

   - Make changes to selections
   - Click "Cancel"
   - Verify no API call is made
   - Verify modal closes
   - Verify selections are reset

5. **Error Handling**

   - Backend unavailable → Error toast displayed
   - Invalid user ID → Error toast displayed
   - Network error → Error toast displayed

6. **Privilege Checks**

   - Users without `user.update` privilege → Button hidden
   - Users with privilege → Button visible and functional

7. **Empty States**
   - No locations available → "No locations available" message shown
   - User has no locations → All checkboxes unchecked
   - Can still add locations

## Files Modified

1. **src/store/usersSlice.js**

   - Added `fetchAllLocations` async thunk
   - Added `fetchUserLocations` async thunk
   - Added `updateUserLocations` async thunk
   - Added `locations` and `userLocations` state fields
   - Added reducer cases for all location operations

2. **src/components/usermanagment/UserManagment.jsx**
   - Added manage locations button in actions column
   - Added `showLocationModal` state
   - Added `selectedLocationIds` state
   - Added `handleManageLocations` function
   - Added `handleLocationCheckboxChange` function
   - Added `handleSaveLocations` function
   - Added `handleCloseLocationModal` function
   - Added location sync effect
   - Added location mapping modal component
   - Updated imports and Redux selectors

## API Integration

### Authentication Headers

All requests automatically include:

- `Authorization: Bearer {token}` - JWT token from login
- `user_id: {userId}` - Current user's ID (from axios interceptor)

### Error Responses

The implementation handles:

- **401 Unauthorized** - Token expired or invalid
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - User or location not found
- **500 Server Error** - Backend error

## Component Architecture

```
UserManagement Component
├── State Management
│   ├── Local State (showLocationModal, selectedLocationIds)
│   └── Redux State (locations, userLocations, isLoading)
│
├── Effects
│   ├── Location sync effect (userLocations → selectedLocationIds)
│   └── Success/Error handling effect
│
├── Handlers
│   ├── handleManageLocations() - Opens modal and fetches data
│   ├── handleLocationCheckboxChange() - Toggles location selection
│   ├── handleSaveLocations() - Updates user locations via API
│   └── handleCloseLocationModal() - Closes modal and resets state
│
└── UI Components
    ├── Manage Locations Button (Actions column)
    └── Location Mapping Modal
        ├── Modal Header (User name)
        ├── Location List (Scrollable with checkboxes)
        ├── Selection Counter
        └── Action Buttons (Cancel, Save)
```

## Best Practices Implemented

1. **Automatic Data Fetching** - Locations fetched only once, cached in Redux
2. **Pre-selection** - User's current locations automatically selected
3. **Visual Feedback** - Clear indication of selected items
4. **Loading States** - Prevents duplicate submissions
5. **Error Handling** - User-friendly error messages
6. **Privilege Guards** - Feature hidden for unauthorized users
7. **Consistent UI** - Matches existing design patterns
8. **Responsive Design** - Modal scrolls for many locations
9. **Keyboard Accessible** - Checkboxes work with keyboard navigation
10. **State Cleanup** - Modal state reset on close

## Performance Considerations

- **Location Caching** - Locations fetched once and cached in Redux
- **Lazy Loading** - User locations fetched only when modal opens
- **Optimized Re-renders** - useEffect dependencies properly configured
- **Async Operations** - Non-blocking API calls with loading states

## Future Enhancements

Consider implementing:

1. **Search/Filter** - Filter locations by name or address
2. **Bulk Assignment** - Assign locations to multiple users at once
3. **Location Groups** - Create groups of locations for easier assignment
4. **History Tracking** - Track who changed location assignments
5. **Active Only Filter** - Option to show only active locations
6. **Recent Locations** - Quick select from recently used locations
7. **Validation** - Warn if removing user's only location
8. **Confirmation** - Confirm before saving if removing all locations

## Configuration Notes

- Backend should be running on port configured in `vite.config.js` (default: 8081)
- If backend uses port 8080, update proxy configuration
- CORS should allow requests from `http://localhost:5174`
- JWT token expiration handled automatically
- All API calls use the same authentication mechanism

## Support

For issues or questions:

- Check browser console for detailed API logs
- Verify backend is running and accessible
- Ensure user has proper privileges
- Check network tab for API request/response details
- Verify location IDs are correct in database
