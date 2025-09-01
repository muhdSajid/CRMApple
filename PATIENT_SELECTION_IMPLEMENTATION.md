# Patient Selection Implementation Guide

## Overview

The patient selection functionality has been successfully implemented in the Distribution component, following the same pattern as the distribution center selection. This includes search functionality and the ability to add new patients.

## Features Implemented

### 1. **Patient Search Functionality**

- Real-time search as you type (minimum 2 characters)
- Searches by patient name
- Loading indicator during search
- Dropdown display with patient details
- No results message when no patients found

### 2. **Add New Patient**

- Modal form to add new patients
- Required fields: Name and Phone Number
- Optional fields: Patient ID (auto-generated if empty), Address, Emergency Contact
- Form validation and error handling
- Success feedback and automatic selection of newly created patient

### 3. **Patient Selection**

- Click to select patient from search results
- Selected patient name populates the search field
- Clear selection by clearing the search field

## API Integration

### API Functions Added

Three new API functions have been added to `src/service/apiService.js`:

```javascript
// Search patients by name
export const searchPatients = async (searchTerm) => {
  const response = await get(
    `${apiDomain}/api/v1/patients/search?searchTerm=${encodeURIComponent(
      searchTerm
    )}`
  );
  return response.data;
};

// Create new patient
export const createPatient = async (patientData) => {
  const response = await _fetch(
    `${apiDomain}/api/v1/patients`,
    "POST",
    patientData
  );
  return response.data;
};

// Update existing patient (for future use)
export const updatePatient = async (patientId, patientData) => {
  const response = await _fetch(
    `${apiDomain}/api/v1/patients/${patientId}`,
    "PUT",
    patientData
  );
  return response.data;
};
```

### Expected API Responses

#### Search Patients Response

```json
[
  {
    "id": 1,
    "patientId": "P001",
    "name": "John Doe",
    "address": "123 Main Street, City, State",
    "phone": "1234567890",
    "emergencyContact": "9876543210",
    "isActive": true
  }
]
```

#### Create Patient Request

```json
{
  "patientId": "P001",
  "name": "John Doe",
  "address": "123 Main Street, City, State 12345",
  "phone": "1234567890",
  "emergencyContact": "9876543210",
  "isActive": true
}
```

## Component Changes

### State Variables Added

```javascript
// Patient selection state
const [patients, setPatients] = useState([]);
const [selectedPatient, setSelectedPatient] = useState("");
const [patientSearchTerm, setPatientSearchTerm] = useState("");
const [showPatientDropdown, setShowPatientDropdown] = useState(false);
const [searchingPatients, setSearchingPatients] = useState(false);
const [showAddPatientModal, setShowAddPatientModal] = useState(false);
const [newPatientData, setNewPatientData] = useState({
  patientId: "",
  name: "",
  address: "",
  phone: "",
  emergencyContact: "",
  isActive: true,
});
const [addingPatient, setAddingPatient] = useState(false);
```

### Functions Added

- `handlePatientSearch()` - Handles patient search API calls
- `handlePatientSearchChange()` - Manages search input changes
- `handlePatientSelect()` - Handles patient selection from dropdown
- `handleAddPatient()` - Handles new patient creation
- `resetAddPatientForm()` - Resets add patient form

### UI Components Added

1. **Patient Search Input**: Replaces the hardcoded dropdown with searchable input
2. **Search Dropdown**: Shows search results with patient details
3. **Add Patient Button**: Opens modal to add new patient
4. **Add Patient Modal**: Complete form for patient registration
5. **Loading States**: Visual feedback during search and creation

## User Experience Features

### Search Experience

- **Auto-search**: Starts searching after 2 characters
- **Loading indicator**: Shows spinner during search
- **Result display**: Shows patient name, ID, and phone
- **No results**: Clear message when no patients found
- **Click outside**: Closes dropdown when clicking elsewhere

### Add Patient Experience

- **Required fields**: Name and Phone marked with red asterisk
- **Auto-generation**: Patient ID auto-generated if not provided
- **Validation**: Form validation before submission
- **Loading state**: Button shows loading during creation
- **Success flow**: Automatically selects newly created patient

## Integration Points

### 1. **Distribution Table**

The patient selection has been integrated into the medicine distribution table:

```jsx
<TableCell className="py-3">
  <div className="relative patient-search-dropdown-container">
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={patientSearchTerm}
          onChange={handlePatientSearchChange}
          onFocus={() => setShowPatientDropdown(true)}
          placeholder="Search patients..."
          className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 bg-white"
        />
        {/* Search results dropdown */}
      </div>
      <button onClick={() => setShowAddPatientModal(true)}>
        <FaCirclePlus className="text-sm" />
        Add
      </button>
    </div>
  </div>
</TableCell>
```

### 2. **Modal Integration**

The add patient modal follows the same design pattern as other modals in the application:

```jsx
{
  showAddPatientModal && (
    <Modal show={showAddPatientModal} onClose={resetAddPatientForm}>
      <ModalHeader>Add New Patient</ModalHeader>
      <ModalBody>{/* Patient form fields */}</ModalBody>
    </Modal>
  );
}
```

## Testing Checklist

### ✅ **Backend Requirements**

- API endpoint: `GET /api/v1/patients/search?searchTerm={term}`
- API endpoint: `POST /api/v1/patients`
- Authentication: Bearer token required
- CORS: Configured for frontend domain

### ✅ **Frontend Testing**

1. **Search Functionality**:

   - Type 2+ characters to trigger search
   - Verify loading indicator appears
   - Check search results display correctly
   - Test "no results" message

2. **Add Patient**:

   - Click "Add" button to open modal
   - Test form validation (required fields)
   - Submit form with valid data
   - Verify patient is created and selected

3. **Integration**:
   - Test within distribution flow
   - Verify patient selection works with medicine distribution
   - Check form state management

## Error Handling

The implementation includes comprehensive error handling:

### Search Errors

- Network connectivity issues
- API endpoint failures
- Empty search results
- Invalid search terms

### Creation Errors

- Validation errors for required fields
- API creation failures
- Network connectivity issues
- Duplicate patient handling

### User Feedback

- Toast notifications for success/error messages
- Loading states for better UX
- Form validation messages
- Clear error messaging

## Performance Considerations

### Search Optimization

- Minimum 2 characters before search
- Debouncing to avoid excessive API calls
- Loading states for user feedback
- Efficient search result rendering

### State Management

- Clean state management for modals
- Proper cleanup on component unmount
- Efficient re-rendering with React hooks

## Future Enhancements

Consider implementing:

1. **Advanced Search**: Search by patient ID, phone number
2. **Patient Profile**: View/edit patient details
3. **Patient History**: View past distributions
4. **Bulk Import**: Import patients from CSV
5. **Patient Categories**: Categorize patients by condition/location
6. **Quick Actions**: Recent patients list for faster selection

## Development Server

The application is currently running on:

- **Frontend**: http://localhost:5175/
- **API**: http://localhost:8081/

## Ready for Testing! 🚀

The patient selection functionality is fully implemented and follows the same robust patterns as the distribution center selection. The component handles search, creation, selection, and error states comprehensively.
