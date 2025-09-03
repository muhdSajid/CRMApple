import {
  Button,
  Label,
  Datepicker,
  HR,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Modal,
  ModalBody,
  ModalHeader,
} from "flowbite-react";
import DistributionListModal from "./DistributionListModal";
import { useState, useEffect } from "react";
import { FaCirclePlus } from "react-icons/fa6";
import { getDeliveryCenterTypes, getLocations, getDeliveryCentersByLocationAndType, createDeliveryCenter, searchPatients, createPatient, searchMedicinesByLocation } from "../../service/apiService";
import { getDeliveryCenterTypeConfig, defaultDeliveryCenterTypes } from "../../utils/deliveryCenterConfig";

const Distribution = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState("");
  const [pendingMode, setPendingMode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deliveryCenterTypes, setDeliveryCenterTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [deliveryCenters, setDeliveryCenters] = useState([]);
  const [selectedDeliveryCenter, setSelectedDeliveryCenter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingCenters, setLoadingCenters] = useState(false);
  
  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Add new center state
  const [showAddCenterModal, setShowAddCenterModal] = useState(false);
  const [newCenterName, setNewCenterName] = useState("");
  const [newCenterContact, setNewCenterContact] = useState("");
  const [addingCenter, setAddingCenter] = useState(false);
  
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
    isActive: true
  });
  const [addingPatient, setAddingPatient] = useState(false);
  
  // Patient validation errors
  const [patientErrors, setPatientErrors] = useState({
    name: "",
    phone: "",
    patientId: "",
    emergencyContact: "",
    general: ""
  });
  
  // Medicine distribution list state
  const [distributionList, setDistributionList] = useState([]);
  const [currentPatientId, setCurrentPatientId] = useState("");
  const [currentPatientName, setCurrentPatientName] = useState("");
  const [currentMedicineName, setCurrentMedicineName] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("");
  
  // Medicine search state
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [searchingMedicines, setSearchingMedicines] = useState(false);
  
  // Add row state
  const [showAddRow, setShowAddRow] = useState(false);
  
  // Accordion state
  const [locationAccordionOpen, setLocationAccordionOpen] = useState(true);
  const [typeAccordionOpen, setTypeAccordionOpen] = useState(false);
  const [deliveryCenterAccordionOpen, setDeliveryCenterAccordionOpen] = useState(false);

  // Fetch delivery center types and locations from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both delivery center types and locations concurrently
        const [deliveryTypesResponse, locationsResponse] = await Promise.allSettled([
          getDeliveryCenterTypes(),
          getLocations()
        ]);

        // Handle delivery center types
        if (deliveryTypesResponse.status === 'fulfilled') {
          setDeliveryCenterTypes(deliveryTypesResponse.value || []);
        } else {
          console.error('Error fetching delivery center types:', deliveryTypesResponse.reason);
          setDeliveryCenterTypes(defaultDeliveryCenterTypes);
        }

        // Handle locations
        if (locationsResponse.status === 'fulfilled') {
          const activeLocations = (locationsResponse.value || []).filter(location => location.isActive);
          setLocations(activeLocations);
        } else {
          console.error('Error fetching locations:', locationsResponse.reason);
          setLocations([]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set fallback data
        setDeliveryCenterTypes(defaultDeliveryCenterTypes);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRadioClick = (mode) => {
    if (!selectedMode) {
      setSelectedMode(mode);
      fetchDeliveryCenters(selectedLocation, mode);
      // Auto-open delivery center accordion and close type accordion
      setTypeAccordionOpen(false);
      setDeliveryCenterAccordionOpen(true);
      return;
    }
    if (mode !== selectedMode) {
      setPendingMode(mode);
      setShowModal(true);
    }
  };

  const handleLocationChange = (locationId) => {
    // Reset distribution mode when location changes
    if (selectedMode && locationId !== selectedLocation) {
      setSelectedMode("");
      setDeliveryCenters([]);
      setSelectedDeliveryCenter("");
      setSearchTerm(""); // Reset search term
      setShowDropdown(false); // Close dropdown
      setTypeAccordionOpen(false);
      setDeliveryCenterAccordionOpen(false);
    }
    setSelectedLocation(locationId);
    
    // Auto-open distribution type accordion when location is selected
    if (locationId) {
      setLocationAccordionOpen(false); // Collapse location accordion
      setTypeAccordionOpen(true); // Open distribution type accordion
      setDeliveryCenterAccordionOpen(false); // Close delivery center accordion
    }
  };

  // Fetch delivery centers based on location and type
  const fetchDeliveryCenters = async (locationId, distributionType) => {
    if (!locationId || !distributionType) return;
    
    try {
      setLoadingCenters(true);
      setDeliveryCenters([]);
      setSelectedDeliveryCenter("");
      
      // Get the type ID from the distribution type
      const selectedType = deliveryCenterTypes.find(type => 
        getDeliveryCenterTypeConfig(type.typeName).value === distributionType
      );
      
      if (selectedType) {
        const centers = await getDeliveryCentersByLocationAndType(locationId, selectedType.id);
        setDeliveryCenters(centers || []);
      }
    } catch (error) {
      console.error('Error fetching delivery centers:', error);
      setDeliveryCenters([]);
    } finally {
      setLoadingCenters(false);
    }
  };

  const confirmSwitch = () => {
    setSelectedMode(pendingMode);
    fetchDeliveryCenters(selectedLocation, pendingMode);
    setPendingMode("");
    setShowModal(false);
    // Auto-open delivery center accordion and close type accordion
    setTypeAccordionOpen(false);
    setDeliveryCenterAccordionOpen(true);
  };

  const toggleLocationAccordion = () => {
    setLocationAccordionOpen(!locationAccordionOpen);
  };

  const toggleTypeAccordion = () => {
    setTypeAccordionOpen(!typeAccordionOpen);
  };

  const cancelSwitch = () => {
    setPendingMode("");
    setShowModal(false);
  };

  const handleAddCenter = async () => {
    if (!newCenterName.trim() || !newCenterContact.trim()) {
      alert("Please fill in both name and phone number");
      return;
    }

    if (!selectedLocation || !selectedMode) {
      alert("Please select location and distribution type first");
      return;
    }

    try {
      setAddingCenter(true);
      
      // Map distribution modes to type IDs
      const typeMap = {
        'hospitals': 1,
        'medical-camps': 2,
        'home-care': 3
      };

      const centerData = {
        name: newCenterName.trim(),
        contactPhone: newCenterContact.trim(),
        locationId: selectedLocation,
        typeId: typeMap[selectedMode] || selectedMode
      };

      const newCenter = await createDeliveryCenter(centerData);
      
      // Add the new center to the list and select it
      setDeliveryCenters(prev => [...prev, newCenter]);
      setSelectedDeliveryCenter(String(newCenter.id)); // Convert to string for dropdown compatibility
      setSearchTerm(newCenter.name); // Set search term to new center name
      
      // Reset form and close modal
      setNewCenterName("");
      setNewCenterContact("");
      setShowAddCenterModal(false);
      setDeliveryCenterAccordionOpen(false); // Close accordion after adding
      
    } catch (error) {
      console.error('Error adding delivery center:', error);
      alert("Failed to add delivery center. Please try again.");
    } finally {
      setAddingCenter(false);
    }
  };

  const resetAddCenterForm = () => {
    setNewCenterName("");
    setNewCenterContact("");
    setShowAddCenterModal(false);
  };

  // Patient search functionality
  const handlePatientSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setPatients([]);
      return;
    }

    try {
      setSearchingPatients(true);
      const results = await searchPatients(searchTerm);
      setPatients(results || []);
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatients([]);
    } finally {
      setSearchingPatients(false);
    }
  };

  // Medicine search functionality
  const handleMedicineSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setMedicines([]);
      setShowMedicineDropdown(false);
      return;
    }

    if (!selectedLocation) {
      setMedicines([]);
      setShowMedicineDropdown(false);
      return;
    }

    try {
      setSearchingMedicines(true);
      console.log('Searching medicines with term:', searchTerm, 'location:', selectedLocation);
      
      // Correct parameter order: location first, then searchTerm
      const response = await searchMedicinesByLocation(selectedLocation, searchTerm);
      console.log('Full API response:', response);
      
      // Extract data array from API response structure
      const medicineData = response?.data || response || [];
      console.log('Extracted medicine data:', medicineData);
      
      setMedicines(medicineData);
      setShowMedicineDropdown(true); // Explicitly show dropdown after successful search
    } catch (error) {
      console.error('Error searching medicines:', error);
      setMedicines([]);
      setShowMedicineDropdown(false);
    } finally {
      setSearchingMedicines(false);
    }
  };

  const handlePatientSearchChange = (e) => {
    const value = e.target.value;
    setPatientSearchTerm(value);
    setShowPatientDropdown(true);
    
    if (!value) {
      setSelectedPatient("");
      setPatients([]);
      setCurrentMedicineName("");
      setCurrentQuantity("");
    } else {
      // Clear selected patient when typing new name
      if (selectedPatient) {
        setSelectedPatient("");
      }
      handlePatientSearch(value);
    }
  };

  const handleMedicineSearchChange = (e) => {
    const value = e.target.value;
    console.log('Medicine search term changed:', value);
    setMedicineSearchTerm(value);
    setCurrentMedicineName(value);
    setShowMedicineDropdown(true);
    
    if (!value) {
      setSelectedMedicine(null);
      setMedicines([]);
    } else {
      // Clear selected medicine when typing new name
      if (selectedMedicine) {
        setSelectedMedicine(null);
      }
      handleMedicineSearch(value);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient.id);
    setPatientSearchTerm(patient.name);
    setShowPatientDropdown(false);
    // Clear medicine fields when switching patients
    setCurrentMedicineName("");
    setCurrentQuantity("");
    setMedicineSearchTerm("");
    setSelectedMedicine(null);
  };

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
    setMedicineSearchTerm(medicine.medicineName);
    setCurrentMedicineName(medicine.medicineName);
    setShowMedicineDropdown(false);
  };

  const handleAddPatient = async () => {
    // Clear previous errors
    setPatientErrors({
      name: "",
      phone: "",
      patientId: "",
      emergencyContact: "",
      general: ""
    });

    // Validate form data
    const validationErrors = validatePatientData(newPatientData);
    const hasErrors = Object.values(validationErrors).some(error => error);

    if (hasErrors) {
      setPatientErrors(validationErrors);
      return;
    }

    try {
      setAddingPatient(true);
      
      const patientData = {
        patientId: newPatientData.patientId.trim() || `P${Date.now()}`, // Generate ID if not provided
        name: newPatientData.name.trim(),
        address: newPatientData.address.trim(),
        phone: newPatientData.phone.trim(),
        emergencyContact: newPatientData.emergencyContact.trim(),
        isActive: true
      };

      const newPatient = await createPatient(patientData);
      
      // Select the newly created patient
      setSelectedPatient(newPatient.id);
      setPatientSearchTerm(newPatient.name);
      
      // Reset form and close modal
      resetAddPatientForm();
      
    } catch (error) {
      console.error('Error adding patient:', error);
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        // Bad request - likely validation error from server
        const errorMessage = error.response.data?.message || "Invalid patient data. Please check your inputs.";
        setPatientErrors(prev => ({ ...prev, general: errorMessage }));
      } else if (error.response?.status === 409) {
        // Conflict - handle specific duplicate error codes
        const errorCode = error.response.data?.errorCode;
        const errorMessage = error.response.data?.message || "A conflict occurred.";
        
        if (errorCode === "DUPLICATE_PHONE_NUMBER") {
          setPatientErrors(prev => ({ 
            ...prev, 
            phone: `Phone number '${newPatientData.phone}' already exists. Please use a different phone number.`
          }));
        } else if (errorCode === "DUPLICATE_PATIENT_ID") {
          setPatientErrors(prev => ({ 
            ...prev, 
            patientId: `Patient ID '${newPatientData.patientId}' already exists. Please use a different ID.`
          }));
        } else {
          // Generic duplicate error
          setPatientErrors(prev => ({ 
            ...prev, 
            general: errorMessage
          }));
        }
      } else if (error.response?.status === 422) {
        // Unprocessable entity - validation errors
        const serverErrors = error.response.data?.errors || {};
        setPatientErrors(prev => ({
          ...prev,
          name: serverErrors.name || prev.name,
          phone: serverErrors.phone || prev.phone,
          patientId: serverErrors.patientId || prev.patientId,
          general: serverErrors.general || "Please fix the highlighted errors."
        }));
      } else {
        // Network or other errors
        setPatientErrors(prev => ({ 
          ...prev, 
          general: "Failed to add patient. Please check your connection and try again." 
        }));
      }
    } finally {
      setAddingPatient(false);
    }
  };

  const resetAddPatientForm = () => {
    setNewPatientData({
      patientId: "",
      name: "",
      address: "",
      phone: "",
      emergencyContact: "",
      isActive: true
    });
    setPatientErrors({
      name: "",
      phone: "",
      patientId: "",
      emergencyContact: "",
      general: ""
    });
    setShowAddPatientModal(false);
  };

  // Validate patient data
  const validatePatientData = (data) => {
    const errors = {
      name: "",
      phone: "",
      patientId: "",
      emergencyContact: "",
      general: ""
    };

    // Name validation
    if (!data.name.trim()) {
      errors.name = "Patient name is required";
    } else if (data.name.trim().length < 2) {
      errors.name = "Patient name must be at least 2 characters";
    } else if (data.name.trim().length > 100) {
      errors.name = "Patient name must be less than 100 characters";
    }

    // Phone validation
    if (!data.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(data.phone.replace(/\D/g, ''))) {
      errors.phone = "Please enter a valid phone number (10-15 digits)";
    }

    // Patient ID validation (if provided)
    if (data.patientId.trim() && data.patientId.trim().length > 50) {
      errors.patientId = "Patient ID must be less than 50 characters";
    }

    // Emergency contact validation (if provided)
    if (data.emergencyContact.trim() && !/^\d{10,15}$/.test(data.emergencyContact.replace(/\D/g, ''))) {
      errors.emergencyContact = "Please enter a valid emergency contact number";
    }

    return errors;
  };

  // Clear individual field errors
  const clearPatientFieldError = (fieldName) => {
    if (patientErrors[fieldName]) {
      setPatientErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
  };

  // Add medicine for selected patient
  const handleAddMedicine = () => {
    // Validation
    if (!selectedPatient) {
      alert("Please select a patient first");
      return;
    }
    if (!currentMedicineName.trim()) {
      alert("Please enter medicine name");
      return;
    }
    if (!currentQuantity || currentQuantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    
    // Check stock availability
    if (selectedMedicine && parseInt(currentQuantity) > selectedMedicine.totalNumberOfMedicines) {
      alert(`Quantity exceeds available stock. Available: ${selectedMedicine.totalNumberOfMedicines}`);
      return;
    }

    const patientName = patients.find(p => p.id === selectedPatient)?.name || patientSearchTerm;
    
    const newDistribution = {
      id: Date.now(),
      patientId: selectedPatient,
      patientName: patientName,
      medicineName: currentMedicineName.trim(),
      medicineId: selectedMedicine?.medicineId || null,
      quantity: parseInt(currentQuantity),
      availableStock: selectedMedicine?.totalNumberOfMedicines || null
    };

    setDistributionList(prev => [...prev, newDistribution]);
    
    // Clear medicine fields but keep patient selected
    setCurrentMedicineName("");
    setCurrentQuantity("");
    setMedicineSearchTerm("");
    setSelectedMedicine(null);
    
    // Hide add row after adding
    setShowAddRow(false);
  };

  // Add new patient with medicines
  const handleAddPatientWithMedicine = () => {
    if (!patientSearchTerm.trim()) {
      alert("Please enter patient name");
      return;
    }
    if (!currentMedicineName.trim()) {
      alert("Please enter medicine name");
      return;
    }
    if (!currentQuantity || currentQuantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    
    // Check stock availability
    if (selectedMedicine && parseInt(currentQuantity) > selectedMedicine.totalNumberOfMedicines) {
      alert(`Quantity exceeds available stock. Available: ${selectedMedicine.totalNumberOfMedicines}`);
      return;
    }

    const newPatientId = `TEMP_${Date.now()}`;
    const newDistribution = {
      id: Date.now(),
      patientId: newPatientId,
      patientName: patientSearchTerm.trim(),
      medicineName: currentMedicineName.trim(),
      medicineId: selectedMedicine?.medicineId || null,
      quantity: parseInt(currentQuantity),
      availableStock: selectedMedicine?.totalNumberOfMedicines || null,
      isNewPatient: true
    };

    setDistributionList(prev => [...prev, newDistribution]);
    
    // Clear all fields
    setPatientSearchTerm("");
    setSelectedPatient("");
    setCurrentMedicineName("");
    setCurrentQuantity("");
    setMedicineSearchTerm("");
    setSelectedMedicine(null);
    setShowPatientDropdown(false);
    
    // Hide add row after adding
    setShowAddRow(false);
  };

  // Remove item from distribution list
  const handleRemoveDistribution = (id) => {
    setDistributionList(prev => prev.filter(item => item.id !== id));
  };

  // Filter centers based on search term
  const filteredCenters = deliveryCenters.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (center.contactPhone && center.contactPhone.includes(searchTerm))
  );

  const handleCenterSelect = (centerId) => {
    setSelectedDeliveryCenter(centerId);
    const selectedCenter = deliveryCenters.find(center => String(center.id) === centerId);
    setSearchTerm(selectedCenter ? selectedCenter.name : "");
    setShowDropdown(false);
    // Auto-close accordion after selection
    setDeliveryCenterAccordionOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    if (!e.target.value) {
      setSelectedDeliveryCenter("");
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.search-dropdown-container')) {
      setShowDropdown(false);
    }
    if (!e.target.closest('.patient-search-dropdown-container')) {
      setShowPatientDropdown(false);
    }
    if (!e.target.closest('.medicine-search-dropdown-container')) {
      setShowMedicineDropdown(false);
    }
  };

  // Add event listener for clicking outside
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="m-6 p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Medicine Distribution</h1>
        <Button size="sm" color="light" onClick={() => setIsModalOpen(true)}>
          Distribution List
        </Button>
      </div>
      <HR />

      {/* Accordion for Location and Distribution Type Selection */}
      <div className="space-y-3">
        
        {/* Location Selection Accordion */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <button
            onClick={toggleLocationAccordion}
            className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                selectedLocation ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {selectedLocation ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">1</span>
                )}
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-800">Select Location</h3>
                {selectedLocation && (
                  <p className="text-sm text-gray-600">
                    {locations.find(loc => loc.id.toString() === selectedLocation)?.name} - {locations.find(loc => loc.id.toString() === selectedLocation)?.locationAddress}
                  </p>
                )}
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-500 transform transition-transform ${
                locationAccordionOpen ? 'rotate-180' : 'rotate-0'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {locationAccordionOpen && (
            <div className="p-4 bg-white">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-5 h-5 rounded-full border-2 border-blue-200"></div>
                      <div className="absolute top-0 left-0 w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                    </div>
                    <span className="text-gray-500">Loading locations...</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      onClick={() => handleLocationChange(location.id.toString())}
                      className={`
                        cursor-pointer rounded-md border-2 p-3 text-center transition-all duration-200 hover:shadow-sm
                        ${selectedLocation === location.id.toString()
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                        }
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center mb-2 mx-auto
                        ${selectedLocation === location.id.toString()
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h4 className={`font-semibold text-sm ${
                        selectedLocation === location.id.toString() ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {location.name}
                      </h4>
                      <p className={`text-xs ${
                        selectedLocation === location.id.toString() ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {location.locationAddress}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {!loading && locations.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No locations available at the moment
                </div>
              )}
            </div>
          )}
        </div>

        {/* Distribution Type Selection Accordion */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <button
            onClick={toggleTypeAccordion}
            className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${
              selectedLocation 
                ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer' 
                : 'bg-gray-100 cursor-not-allowed opacity-60'
            }`}
            disabled={!selectedLocation}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                selectedMode ? 'bg-green-500 text-white' : 
                selectedLocation ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-400'
              }`}>
                {selectedMode ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">2</span>
                )}
              </div>
              <div className="text-left">
                <h3 className={`text-lg font-semibold ${selectedLocation ? 'text-gray-800' : 'text-gray-500'}`}>
                  Select Distribution Type
                </h3>
                {selectedMode && (
                  <p className="text-sm text-gray-600">
                    {deliveryCenterTypes.find(type => getDeliveryCenterTypeConfig(type.typeName).value === selectedMode)?.typeName}
                  </p>
                )}
                {!selectedLocation && (
                  <p className="text-xs text-gray-500">Select location first</p>
                )}
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-500 transform transition-transform ${
                typeAccordionOpen ? 'rotate-180' : 'rotate-0'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {typeAccordionOpen && selectedLocation && (
            <div className="p-4 bg-white">
              <div className="flex gap-4 flex-wrap">
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-5 h-5 rounded-full border-2 border-blue-200"></div>
                      <div className="absolute top-0 left-0 w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                    </div>
                    <span className="text-gray-500">Loading distribution types...</span>
                  </div>
                ) : (
                  deliveryCenterTypes.map((type) => {
                    const config = getDeliveryCenterTypeConfig(type.typeName);
                    const IconComponent = config.icon;
                    
                    return (
                      <div key={type.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={config.value}
                          name="distributionMode"
                          checked={selectedMode === config.value}
                          onChange={() => handleRadioClick(config.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className={`flex gap-2 ${config.bgColor} rounded-md px-3 py-2 cursor-pointer`} 
                             onClick={() => handleRadioClick(config.value)}>
                          <div className={`${config.iconBg} p-1 rounded-md`}>
                            <IconComponent className="text-lg text-white" />
                          </div>
                          <div className={`${config.textColor} font-semibold text-sm flex items-center pr-1`}>
                            {type.typeName}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Centers Selection Accordion */}
      {selectedLocation && selectedMode && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg mb-4">
          <button 
            onClick={() => setDeliveryCenterAccordionOpen(!deliveryCenterAccordionOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Distribution Center & Date
                </h3>
                <div className="text-xs text-gray-600 mt-1 space-y-1">
                  {selectedDeliveryCenter ? (
                    <p className="text-green-600">Center: {deliveryCenters.find(center => String(center.id) === selectedDeliveryCenter)?.name}</p>
                  ) : (
                    <p className="text-gray-500">Choose distribution center and date</p>
                  )}
                </div>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-500 transform transition-transform ${
                deliveryCenterAccordionOpen ? 'rotate-180' : 'rotate-0'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {deliveryCenterAccordionOpen && (
            <div className="p-4 bg-white border-t border-gray-200">
              {loadingCenters ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full border-2 border-blue-200"></div>
                    <div className="absolute top-0 left-0 w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                  </div>
                  <span className="text-gray-500">Loading distribution centers...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Distribution Center Search & Select */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Distribution Center <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative search-dropdown-container">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Search distribution centers..."
                            className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 bg-white"
                          />
                          {showDropdown && filteredCenters.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredCenters.map((center) => (
                                <div
                                  key={center.id}
                                  onClick={() => handleCenterSelect(String(center.id))}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="text-sm font-medium text-gray-900">{center.name}</div>
                                  <div className="text-xs text-gray-500">{center.contactPhone || 'No contact'}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setShowAddCenterModal(true)}
                          className="px-3 py-2.5 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors flex items-center gap-1 whitespace-nowrap"
                        >
                          <FaCirclePlus className="text-sm" />
                          Add
                        </button>
                      </div>
                    </div>
                    
                    {deliveryCenters.length === 0 && (
                      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                        <p className="text-sm">No distribution centers available.</p>
                        <p className="text-xs mt-1">Click "Add" to create one.</p>
                      </div>
                    )}
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Distribution Date <span className="text-red-500">*</span>
                    </Label>
                    <Datepicker
                      className="w-full"
                      defaultDate={new Date()}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Show form fields only when location, distribution type, and center are selected */}
      {selectedLocation && selectedMode && selectedDeliveryCenter && (
        <div className="mt-6">
          {/* Medicine Distribution Table */}

          <div className="overflow-x-auto mb-6 pb-32">
            <Table className="border border-gray-300">
              <TableHead className="[&>tr>th]:bg-[#E8EFF2] [&>tr>th]:text-black">
                <TableRow>
                  <TableHeadCell>Patient Name</TableHeadCell>
                  <TableHeadCell>Medicine Name</TableHeadCell>
                  <TableHeadCell>Quantity</TableHeadCell>
                  <TableHeadCell>Action</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {/* Display existing distribution list */}
                {distributionList.map((item) => (
                  <TableRow key={item.id} className="bg-white hover:bg-gray-50">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{item.patientName}</span>
                        {item.isNewPatient && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            New Patient
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">{item.medicineName}</span>
                        {item.availableStock !== null && (
                          <span className={`text-xs ${
                            item.availableStock > item.quantity ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            Available: {item.availableStock}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-gray-900">{item.quantity}</span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <button
                        onClick={() => handleRemoveDistribution(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Remove"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Input row for adding new entries - only show when no items or user clicks "Add More" */}
                {(distributionList.length === 0 || showAddRow) && (
                  <TableRow className="bg-gray-50 hover:bg-gray-100">
                    <TableCell className="py-3">
                      <div className="relative patient-search-dropdown-container">
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={patientSearchTerm}
                              onChange={handlePatientSearchChange}
                              onFocus={() => setShowPatientDropdown(true)}
                              placeholder="Search or enter new patient name..."
                              className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 bg-white"
                            />
                            {searchingPatients && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 animate-spin rounded-full"></div>
                              </div>
                            )}
                            {showPatientDropdown && patients.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {patients.map((patient) => (
                                  <div
                                    key={patient.id}
                                    onClick={() => handlePatientSelect(patient)}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {patient.patientId} • {patient.phone || 'No phone'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {showPatientDropdown && patientSearchTerm && patients.length === 0 && !searchingPatients && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-center text-gray-500 text-sm">
                                No patients found
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setShowAddPatientModal(true)}
                            className="px-3 py-2.5 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors flex items-center gap-1 whitespace-nowrap"
                            title="Add New Patient"
                          >
                            <FaCirclePlus className="text-sm" />
                            Patient
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="relative medicine-search-dropdown-container">
                        <input
                          type="text"
                          value={medicineSearchTerm}
                          onChange={handleMedicineSearchChange}
                          onFocus={() => setShowMedicineDropdown(true)}
                          placeholder="Search medicine name..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        {searchingMedicines && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 animate-spin rounded-full"></div>
                          </div>
                        )}
                        {showMedicineDropdown && medicines.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {console.log('Rendering medicines dropdown with:', medicines)}
                            {medicines.map((medicine) => (
                              <div
                                key={medicine.medicineId}
                                onClick={() => handleMedicineSelect(medicine)}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="text-sm font-medium text-gray-900">{medicine.medicineName}</div>
                                <div className="text-xs text-gray-500 flex justify-between">
                                  <span>Batches: {medicine.numberOfBatches}</span>
                                  <span className={`font-medium ${
                                    medicine.totalNumberOfMedicines > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    Stock: {medicine.totalNumberOfMedicines}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {showMedicineDropdown && medicineSearchTerm && medicines.length === 0 && !searchingMedicines && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-center text-gray-500 text-sm">
                            No medicines found
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="relative">
                        <input
                          type="number"
                          value={currentQuantity}
                          onChange={(e) => setCurrentQuantity(e.target.value)}
                          placeholder="0"
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                            selectedMedicine && currentQuantity && parseInt(currentQuantity) > selectedMedicine.totalNumberOfMedicines
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          min={1}
                          max={selectedMedicine?.totalNumberOfMedicines}
                        />
                        {selectedMedicine && currentQuantity && parseInt(currentQuantity) > selectedMedicine.totalNumberOfMedicines && (
                          <div className="absolute -bottom-5 left-0 text-xs text-red-600">
                            Exceeds available stock ({selectedMedicine.totalNumberOfMedicines})
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        {/* Add medicine for selected patient */}
                        <button
                          onClick={handleAddMedicine}
                          disabled={!selectedPatient}
                          className={`p-2 rounded transition-colors ${
                            selectedPatient 
                              ? 'text-green-600 hover:text-green-800 hover:bg-green-50' 
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          title={selectedPatient ? "Add medicine for selected patient" : "Select a patient first"}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                        
                        {/* Add new patient with medicine */}
                        <button
                          onClick={handleAddPatientWithMedicine}
                          disabled={!patientSearchTerm.trim() || selectedPatient}
                          className={`p-2 rounded transition-colors ${
                            patientSearchTerm.trim() && !selectedPatient
                              ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50' 
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          title={
                            selectedPatient 
                              ? "Clear patient selection to add new patient" 
                              : patientSearchTerm.trim() 
                              ? "Add as new patient with medicine" 
                              : "Enter patient name first"
                          }
                        >
                          <FaCirclePlus className="text-lg" />
                        </button>

                        {/* Cancel/Close add row button - only show when there are existing items */}
                        {distributionList.length > 0 && (
                          <button
                            onClick={() => {
                              setShowAddRow(false);
                              // Clear all input fields
                              setPatientSearchTerm("");
                              setSelectedPatient("");
                              setCurrentMedicineName("");
                              setCurrentQuantity("");
                              setMedicineSearchTerm("");
                              setSelectedMedicine(null);
                              setShowPatientDropdown(false);
                              setShowMedicineDropdown(false);
                            }}
                            className="p-2 rounded transition-colors text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Cancel adding new item"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                
                {/* Add More button row - show when there are items and add row is not shown */}
                {distributionList.length > 0 && !showAddRow && (
                  <TableRow className="bg-blue-50 hover:bg-blue-100">
                    <TableCell colSpan={4} className="py-4 text-center">
                      <button
                        onClick={() => setShowAddRow(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        <FaCirclePlus className="text-lg" />
                        <span>Add More Items</span>
                      </button>
                    </TableCell>
                  </TableRow>
                )}
                
                {/* Empty state when no items */}
                {distributionList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p>No medicines added yet</p>
                        <p className="text-sm">Start by searching for a patient or entering a new patient name above</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B] font-medium rounded-lg text-sm px-5 py-2.5"
              onClick={() => {
                setDistributionList([]);
                setPatientSearchTerm("");
                setSelectedPatient("");
                setCurrentMedicineName("");
                setCurrentQuantity("");
                setMedicineSearchTerm("");
                setSelectedMedicine(null);
                setShowAddRow(false);
              }}
            >
              Clear All
            </Button>
            <Button
              type="submit"
              disabled={distributionList.length === 0}
              className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 ${
                distributionList.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#2D506B] hover:bg-sky-900 border'
              }`}
            >
              Distribute ({distributionList.length} {distributionList.length === 1 ? 'item' : 'items'})
            </Button>
          </div>
        </div>
      )}
      {isModalOpen && (
        <DistributionListModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {/* Confirmation Modal */}
      {showModal && (
        <Modal show={showModal} onClose={cancelSwitch}>
          <ModalHeader>Are you sure?</ModalHeader>
          <ModalBody>
            <div className="space-y-2">
              <p>
                Switching will discard the current data. Do you want to
                continue?
              </p>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button
                onClick={cancelSwitch}
                className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B] font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitch}
                className="text-white bg-[#2D506B] border hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Switch
              </button>
            </div>
          </ModalBody>
        </Modal>
      )}
      
      {/* Add New Center Modal */}
      {showAddCenterModal && (
        <Modal show={showAddCenterModal} onClose={resetAddCenterForm}>
          <ModalHeader>Add New Distribution Center</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p><strong>Location:</strong> {locations.find(loc => loc.id === selectedLocation)?.name}</p>
                <p><strong>Type:</strong> {deliveryCenterTypes.find(type => getDeliveryCenterTypeConfig(type.typeName).value === selectedMode)?.typeName}</p>
              </div>
              
              <div>
                <Label htmlFor="centerName" className="text-sm font-medium text-gray-700 mb-1 block">
                  Distribution Center Name <span className="text-red-500">*</span>
                </Label>
                <input
                  type="text"
                  id="centerName"
                  value={newCenterName}
                  onChange={(e) => setNewCenterName(e.target.value)}
                  placeholder="Enter center name"
                  className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  disabled={addingCenter}
                />
              </div>
              
              <div>
                <Label htmlFor="centerContact" className="text-sm font-medium text-gray-700 mb-1 block">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <input
                  type="tel"
                  id="centerContact"
                  value={newCenterContact}
                  onChange={(e) => setNewCenterContact(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  disabled={addingCenter}
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={resetAddCenterForm}
                disabled={addingCenter}
                className="bg-white text-gray-600 hover:bg-gray-50 border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCenter}
                disabled={addingCenter || !newCenterName.trim() || !newCenterContact.trim()}
                className="text-white bg-[#2D506B] hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 flex items-center gap-2"
              >
                {addingCenter ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <FaCirclePlus className="text-sm" />
                    Add Center
                  </>
                )}
              </button>
            </div>
          </ModalBody>
        </Modal>
      )}
      {/* Add New Patient Modal */}
      {showAddPatientModal && (
        <Modal show={showAddPatientModal} onClose={resetAddPatientForm}>
          <ModalHeader>Add New Patient</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* General Error Message */}
              {patientErrors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 text-sm font-medium">{patientErrors.general}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientId" className="text-sm font-medium text-gray-700 mb-1 block">
                    Patient ID
                  </Label>
                  <input
                    type="text"
                    id="patientId"
                    value={newPatientData.patientId}
                    onChange={(e) => {
                      setNewPatientData(prev => ({ ...prev, patientId: e.target.value }));
                      clearPatientFieldError('patientId');
                    }}
                    placeholder="Leave empty to auto-generate"
                    className={`w-full border text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 p-2.5 ${
                      patientErrors.patientId 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-300 focus:border-blue-500 bg-white'
                    }`}
                    disabled={addingPatient}
                  />
                  {patientErrors.patientId && (
                    <p className="mt-1 text-sm text-red-600">{patientErrors.patientId}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="patientName" className="text-sm font-medium text-gray-700 mb-1 block">
                    Patient Name <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="text"
                    id="patientName"
                    value={newPatientData.name}
                    onChange={(e) => {
                      setNewPatientData(prev => ({ ...prev, name: e.target.value }));
                      clearPatientFieldError('name');
                    }}
                    placeholder="Enter patient name"
                    className={`w-full border text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 p-2.5 ${
                      patientErrors.name 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-300 focus:border-blue-500 bg-white'
                    }`}
                    disabled={addingPatient}
                  />
                  {patientErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{patientErrors.name}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="patientAddress" className="text-sm font-medium text-gray-700 mb-1 block">
                  Address
                </Label>
                <textarea
                  id="patientAddress"
                  value={newPatientData.address}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter patient address"
                  rows={2}
                  className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  disabled={addingPatient}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientPhone" className="text-sm font-medium text-gray-700 mb-1 block">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="tel"
                    id="patientPhone"
                    value={newPatientData.phone}
                    onChange={(e) => {
                      setNewPatientData(prev => ({ ...prev, phone: e.target.value }));
                      clearPatientFieldError('phone');
                    }}
                    placeholder="Enter phone number"
                    className={`w-full border text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 p-2.5 ${
                      patientErrors.phone 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-300 focus:border-blue-500 bg-white'
                    }`}
                    disabled={addingPatient}
                  />
                  {patientErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{patientErrors.phone}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="emergencyContact" className="text-sm font-medium text-gray-700 mb-1 block">
                    Emergency Contact
                  </Label>
                  <input
                    type="tel"
                    id="emergencyContact"
                    value={newPatientData.emergencyContact}
                    onChange={(e) => {
                      setNewPatientData(prev => ({ ...prev, emergencyContact: e.target.value }));
                      clearPatientFieldError('emergencyContact');
                    }}
                    placeholder="Enter emergency contact"
                    className={`w-full border text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 p-2.5 ${
                      patientErrors.emergencyContact 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-300 focus:border-blue-500 bg-white'
                    }`}
                    disabled={addingPatient}
                  />
                  {patientErrors.emergencyContact && (
                    <p className="mt-1 text-sm text-red-600">{patientErrors.emergencyContact}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={resetAddPatientForm}
                disabled={addingPatient}
                className="bg-white text-gray-600 hover:bg-gray-50 border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPatient}
                disabled={addingPatient}
                className="text-white bg-[#2D506B] hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 flex items-center gap-2"
              >
                {addingPatient ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <FaCirclePlus className="text-sm" />
                    Add Patient
                  </>
                )}
              </button>
            </div>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};
export default Distribution;
