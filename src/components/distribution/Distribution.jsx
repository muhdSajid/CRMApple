import React from 'react';
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
import { useState, useEffect } from "react";
import DailyDistributionList from "./DailyDistributionList";
import { FaCirclePlus } from "react-icons/fa6";
import { getDeliveryCenterTypes, getLocations, getDeliveryCentersByLocationAndType, createDeliveryCenter, searchPatients, createPatient, searchMedicinesByLocation, submitDistribution, fetchAvailableBatches } from "../../service/apiService";
import { getDeliveryCenterTypeConfig, defaultDeliveryCenterTypes } from "../../utils/deliveryCenterConfig";

const Distribution = () => {
  const [selectedMode, setSelectedMode] = useState("");
  const [pendingMode, setPendingMode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deliveryCenterTypes, setDeliveryCenterTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [deliveryCenters, setDeliveryCenters] = useState([]);
  const [selectedDeliveryCenter, setSelectedDeliveryCenter] = useState("");
  const [selectedDistributionDate, setSelectedDistributionDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("new-distribution"); // "new-distribution" or "daily-list"
  const [loading, setLoading] = useState(true);
  const [loadingCenters, setLoadingCenters] = useState(false);
  
  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  
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
  const [currentMedicineName, setCurrentMedicineName] = useState("");
  
  // Medicine search state
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [searchingMedicines, setSearchingMedicines] = useState(false);
  
  // Add row state
  const [showAddRow, setShowAddRow] = useState(false);
  
  // Distribution submission state
  const [submittingDistribution, setSubmittingDistribution] = useState(false);
  const [completedPatients, setCompletedPatients] = useState([]);
  const [savedDistributions, setSavedDistributions] = useState([]);
  const [distributionError, setDistributionError] = useState(null);
  
  // Edit quantity state
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [editQuantityValue, setEditQuantityValue] = useState("");
  
  // Batch selection state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [currentMedicineForBatch, setCurrentMedicineForBatch] = useState(null);
  
  // Auto-fade state for completed patients
  const [fadingCompletedPatients, setFadingCompletedPatients] = useState([]);
  
  // Help popover state
  const [showNewDistributionHelp, setShowNewDistributionHelp] = useState(false);
  const [showDailyDistributionHelp, setShowDailyDistributionHelp] = useState(false);
  
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

  // Auto-fade completed patients after 4 seconds
  useEffect(() => {
    if (completedPatients.length > 0) {
      const timer = setTimeout(() => {
        // Start fade animation
        setFadingCompletedPatients(completedPatients.map(p => p.id));
        
        // Remove after fade animation completes
        setTimeout(() => {
          setCompletedPatients([]);
          setFadingCompletedPatients([]);
        }, 500); // 500ms for fade animation
        
      }, 4000); // 4 seconds before starting fade

      return () => clearTimeout(timer);
    }
  }, [completedPatients]);

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
    
    // Only allow patient search if no distribution items exist
    if (distributionList.length === 0) {
      setPatientSearchTerm(value);
      setShowPatientDropdown(true);
      
      if (!value) {
        setSelectedPatient("");
        setPatients([]);
        setCurrentMedicineName("");
      } else {
        // Clear selected patient when typing new name
        if (selectedPatient) {
          setSelectedPatient("");
        }
        handlePatientSearch(value);
      }
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
    if (!patientSearchTerm.trim()) {
      alert("Please enter patient name");
      return;
    }
    if (!currentMedicineName.trim()) {
      alert("Please enter medicine name");
      return;
    }
    if (!selectedMedicine) {
      alert("Please select a valid medicine from the dropdown");
      return;
    }

    // Open batch selection modal instead of adding directly
    handleSelectBatches(selectedMedicine);
  };

  // Remove item from distribution list
  const handleRemoveDistribution = (id) => {
    setDistributionList(prev => prev.filter(item => item.id !== id));
  };

  // Edit quantity functions

  const handleSaveQuantity = (itemId) => {
    const newQuantity = parseInt(editQuantityValue);
    const item = distributionList.find(item => item.id === itemId);
    
    // Validation
    if (!newQuantity || newQuantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    
    // Check stock availability
    if (item.availableStock !== null && newQuantity > item.availableStock) {
      alert(`Quantity cannot exceed available stock (${item.availableStock})`);
      return;
    }
    
    // Update the distribution list
    setDistributionList(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
    
    // Clear editing state
    setEditingQuantity(null);
    setEditQuantityValue("");
  };

  const handleCancelEditQuantity = () => {
    setEditingQuantity(null);
    setEditQuantityValue("");
  };

  // Batch selection functions
  const handleSelectBatches = async (medicine) => {
    if (!selectedLocation || !medicine.medicineId) {
      alert('Location and medicine must be selected');
      return;
    }

    setCurrentMedicineForBatch(medicine);
    setLoadingBatches(true);
    setShowBatchModal(true);
    
    try {
      const batches = await fetchAvailableBatches(selectedLocation, medicine.medicineId);
      setAvailableBatches(batches);
      setSelectedBatches([]);
    } catch (error) {
      console.error('Error fetching batches:', error);
      alert('Error fetching available batches. Please try again.');
      setShowBatchModal(false);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleBatchQuantityChange = (batchId, quantity) => {
    // Handle empty string or invalid input
    if (quantity === '' || quantity === null || quantity === undefined) {
      setSelectedBatches(prev => prev.filter(b => b.id !== batchId));
      return;
    }
    
    // Convert to number and validate
    const numQuantity = parseInt(quantity, 10);
    
    // Check if it's a valid number
    if (isNaN(numQuantity) || numQuantity < 0) {
      return; // Don't update state for invalid numbers
    }
    
    // Find the batch to check max quantity
    const batch = availableBatches.find(b => b.id === batchId);
    if (batch && numQuantity > batch.currentQuantity) {
      return; // Don't allow quantity greater than available
    }
    
    setSelectedBatches(prev => {
      const existing = prev.find(b => b.id === batchId);
      if (existing) {
        if (numQuantity <= 0) {
          return prev.filter(b => b.id !== batchId);
        }
        return prev.map(b => b.id === batchId ? { ...b, selectedQuantity: numQuantity } : b);
      } else if (numQuantity > 0) {
        return [...prev, { ...batch, selectedQuantity: numQuantity }];
      }
      return prev;
    });
  };

  const handleConfirmBatchSelection = () => {
    if (selectedBatches.length === 0) {
      alert('Please select at least one batch with quantity');
      return;
    }

    const totalQuantity = selectedBatches.reduce((sum, batch) => sum + batch.selectedQuantity, 0);
    const totalPrice = selectedBatches.reduce((sum, batch) => sum + (batch.selectedQuantity * batch.unitPrice), 0);

    const patientName = patients.find(p => p.id === selectedPatient)?.name || patientSearchTerm.trim();
    const patientId = selectedPatient || `TEMP_${patientName.replace(/\s+/g, '_')}_${Date.now()}`;
    const isNewPatient = !selectedPatient;

    // Add the batch-based distribution entry
    const newDistribution = {
      id: Date.now(),
      patientId: patientId,
      patientName: patientName,
      medicineName: currentMedicineForBatch.medicineName,
      medicineId: currentMedicineForBatch.medicineId,
      quantity: totalQuantity,
      totalPrice: totalPrice,
      availableStock: currentMedicineForBatch.totalNumberOfMedicines,
      isNewPatient: isNewPatient,
      batches: selectedBatches.map(batch => ({
        batchId: batch.id,
        batchName: batch.batchName,
        quantity: batch.selectedQuantity,
        unitPrice: batch.unitPrice,
        expiryDate: batch.expiryDate,
        totalPrice: batch.selectedQuantity * batch.unitPrice
      }))
    };

    setDistributionList(prev => [...prev, newDistribution]);
    
    // For first medicine, set the patient search term to the selected patient name
    if (distributionList.length === 0) {
      setPatientSearchTerm(patientName);
      setSelectedPatient(patientId);
    }
    
    // Clear medicine fields
    setCurrentMedicineName("");
    setMedicineSearchTerm("");
    setSelectedMedicine(null);
    setShowMedicineDropdown(false);
    setShowAddRow(false);
    
    // Close modal and reset state
    setShowBatchModal(false);
    setSelectedBatches([]);
    setAvailableBatches([]);
    setCurrentMedicineForBatch(null);
  };

  const handleCancelBatchSelection = () => {
    setShowBatchModal(false);
    setSelectedBatches([]);
    setAvailableBatches([]);
    setCurrentMedicineForBatch(null);
  };

  // Submit distribution for current patient and clear for new patient
  const handleCompletePatientDistribution = async () => {
    if (distributionList.length === 0) {
      alert("No medicines to distribute");
      return;
    }

    // Clear any previous errors
    setDistributionError(null);

    // Count medicines for the patient
    const totalMedicines = distributionList.length;
    const patientName = distributionList[0]?.patientName || 'Unknown Patient';
    
    if (!window.confirm(`Are you sure you want to complete distribution for ${patientName} with ${totalMedicines} medicine(s)?`)) {
      return;
    }

    try {
      setSubmittingDistribution(true);
      
      // Get the current patient info
      const currentPatient = distributionList[0];
      
      // Transform distribution items to match the new API format
      const distributionItems = [];
      distributionList.forEach(item => {
        if (item.batches && item.batches.length > 0) {
          item.batches.forEach(batch => {
            distributionItems.push({
              medicineId: item.medicineId,
              medicineName: item.medicineName,
              batchId: batch.batchId, // Use batchId instead of id
              batchName: batch.batchName,
              quantity: batch.quantity,
              unitPrice: batch.unitPrice,
              totalPrice: batch.totalPrice,
              expiryDate: batch.expiryDate
            });
          });
        }
      });

      // Prepare API payload
      const distributionData = {
        patientId: currentPatient.patientId,
        patientName: currentPatient.patientName,
        deliveryCenterId: parseInt(selectedDeliveryCenter),
        distributionDate: new Date().toISOString(),
        distributionItems: distributionItems
      };

      console.log('Submitting distribution data:', distributionData);

      const result = await submitDistribution(distributionData);
      
      // Add to saved distributions list
      const savedDistribution = {
        id: result.id || Date.now(), // Use API response ID or timestamp as fallback
        patientName: currentPatient.patientName,
        patientId: currentPatient.patientId,
        deliveryCenter: deliveryCenters.find(center => String(center.id) === selectedDeliveryCenter)?.name || 'Unknown Center',
        distributionDate: new Date().toLocaleDateString(),
        medicineCount: totalMedicines,
        totalQuantity: distributionItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: distributionItems.reduce((sum, item) => sum + item.totalPrice, 0),
        distributionItems: distributionItems,
        createdAt: new Date().toISOString()
      };
      
      setSavedDistributions(prev => [...prev, savedDistribution]);
      
      // Add to completed patients list (for session tracking)
      setCompletedPatients(prev => [...prev, {
        id: currentPatient.patientId,
        name: currentPatient.patientName,
        medicineCount: totalMedicines,
        completedAt: new Date().toISOString()
      }]);

      // Clear current distribution and reset for new patient
      setDistributionList([]);
      setPatientSearchTerm("");
      setSelectedPatient("");
      setCurrentMedicineName("");
      setMedicineSearchTerm("");
      setSelectedMedicine(null);
      setShowPatientDropdown(false);
      setShowMedicineDropdown(false);
      setShowAddRow(true); // Keep the add row open for next patient

      alert(`✅ Distribution completed successfully!\n\nPatient: ${patientName}\n${totalMedicines} medicine(s) distributed\n\nYou can now add medicines for a new patient.`);

    } catch (error) {
      console.error('Error submitting distribution:', error);
      
      // Extract error message for user display
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message) {
        if (error.message.includes('API Error')) {
          errorMessage = `Server Error: ${error.message}`;
        } else {
          errorMessage = error.message;
        }
      }
      
      setDistributionError(errorMessage);
      alert(`❌ Error submitting distribution:\n\n${errorMessage}`);
    } finally {
      setSubmittingDistribution(false);
    }
  };

  // Start fresh distribution session
  const handleStartNewDistribution = () => {
    setDistributionList([]);
    setCompletedPatients([]);
    setFadingCompletedPatients([]);
    setSavedDistributions([]);
    setDistributionError(null);
    setPatientSearchTerm("");
    setSelectedPatient("");
    setCurrentMedicineName("");
    setMedicineSearchTerm("");
    setSelectedMedicine(null);
    setShowPatientDropdown(false);
    setShowMedicineDropdown(false);
    setShowAddRow(true);
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
    // Auto-close accordion after selection
    setDeliveryCenterAccordionOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value) {
      setSelectedDeliveryCenter("");
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
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
    <div className="m-6 p-4 bg-white rounded-lg shadow-md space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Medicine Distribution</h1>
      </div>
      <HR />

      {/* Compact Selection Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 p-4">
          {/* Location Selection - Compact */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  selectedLocation ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {selectedLocation ? '✓' : '1'}
                </div>
                Location
              </span>
            </label>
            <div className="relative">
              <button
                onClick={toggleLocationAccordion}
                className="w-full p-2 text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <span className="block truncate">
                  {selectedLocation 
                    ? `${locations.find(loc => loc.id.toString() === selectedLocation)?.name}` 
                    : 'Select location...'}
                </span>
                <svg 
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 transition-transform ${
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
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="p-3 text-center text-gray-500 text-sm">Loading...</div>
                  ) : (
                    locations.map((location) => (
                      <div
                        key={location.id}
                        onClick={() => handleLocationChange(location.id.toString())}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                          selectedLocation === location.id.toString() ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                      >
                        <div className="text-sm font-medium">{location.name}</div>
                        <div className="text-xs text-gray-500 truncate">{location.locationAddress}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Distribution Type Selection - Compact */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  selectedMode ? 'bg-green-500 text-white' : 
                  selectedLocation ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-400'
                }`}>
                  {selectedMode ? '✓' : '2'}
                </div>
                Distribution Type
              </span>
            </label>
            <div className="relative">
              <button
                onClick={toggleTypeAccordion}
                disabled={!selectedLocation}
                className={`w-full p-2 text-left border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                  selectedLocation 
                    ? 'border-gray-300 bg-white hover:bg-gray-50 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed text-gray-500'
                }`}
              >
                <span className="block truncate">
                  {selectedMode 
                    ? deliveryCenterTypes.find(type => getDeliveryCenterTypeConfig(type.typeName).value === selectedMode)?.typeName
                    : selectedLocation ? 'Select type...' : 'Select location first'}
                </span>
                <svg 
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 transition-transform ${
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
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {deliveryCenterTypes.map((type) => {
                    const config = getDeliveryCenterTypeConfig(type.typeName);
                    return (
                      <div
                        key={type.id}
                        onClick={() => handleRadioClick(config.value)}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                          selectedMode === config.value ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                      >
                        <div className="text-sm font-medium">{type.typeName}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Distribution Center - Compact */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  selectedDeliveryCenter ? 'bg-green-500 text-white' : 
                  (selectedLocation && selectedMode) ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-400'
                }`}>
                  {selectedDeliveryCenter ? '✓' : '3'}
                </div>
                Center
              </span>
            </label>
            <div className="relative">
              <button
                onClick={() => setDeliveryCenterAccordionOpen(!deliveryCenterAccordionOpen)}
                disabled={!selectedLocation || !selectedMode}
                className={`w-full p-2 text-left border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                  (selectedLocation && selectedMode)
                    ? 'border-gray-300 bg-white hover:bg-gray-50 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed text-gray-500'
                }`}
              >
                <span className="block truncate">
                  {selectedDeliveryCenter 
                    ? `${deliveryCenters.find(center => String(center.id) === selectedDeliveryCenter)?.name}`
                    : (selectedLocation && selectedMode) ? 'Select center...' : 'Complete steps 1-2'}
                </span>
                <svg 
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 transition-transform ${
                    deliveryCenterAccordionOpen ? 'rotate-180' : 'rotate-0'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {deliveryCenterAccordionOpen && selectedLocation && selectedMode && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loadingCenters ? (
                    <div className="p-3 text-center text-gray-500 text-sm">Loading...</div>
                  ) : (
                    <>
                      <div className="p-2 border-b border-gray-100">
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search centers..."
                            className="flex-1 border border-gray-300 text-gray-900 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={() => setShowAddCenterModal(true)}
                            className="px-2 py-1 text-xs text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                          >
                            <FaCirclePlus className="text-xs" />
                          </button>
                        </div>
                      </div>
                      {filteredCenters.map((center) => (
                        <div
                          key={center.id}
                          onClick={() => handleCenterSelect(String(center.id))}
                          className={`px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                            selectedDeliveryCenter === String(center.id) ? 'bg-blue-50 text-blue-700' : ''
                          }`}
                        >
                          <div className="text-sm font-medium">{center.name}</div>
                          <div className="text-xs text-gray-500">{center.contactPhone || 'No contact'}</div>
                        </div>
                      ))}
                      {filteredCenters.length === 0 && (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          No centers found
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Date Selection - Compact */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  selectedDistributionDate ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  ✓
                </div>
                Date
              </span>
            </label>
            <Datepicker
              className="w-full"
              value={selectedDistributionDate}
              defaultDate={selectedDistributionDate}
              onSelectedDateChanged={(date) => setSelectedDistributionDate(date)}
            />
          </div>
        </div>
      </div>

      {/* Compact Welcome Message */}
      {(!selectedLocation || !selectedMode || !selectedDeliveryCenter) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Complete Setup to Start Distribution</h3>
            <div className="flex justify-center items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  selectedLocation ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {selectedLocation ? '✓' : '1'}
                </div>
                <span className={selectedLocation ? 'text-green-700' : 'text-gray-600'}>Location</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  selectedMode ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {selectedMode ? '✓' : '2'}
                </div>
                <span className={selectedMode ? 'text-green-700' : 'text-gray-600'}>Type</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  selectedDeliveryCenter ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {selectedDeliveryCenter ? '✓' : '3'}
                </div>
                <span className={selectedDeliveryCenter ? 'text-green-700' : 'text-gray-600'}>Center</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation - Show when center and date are selected */}
      {selectedLocation && selectedMode && selectedDeliveryCenter && (
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("new-distribution")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "new-distribution"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Distribution
                </div>
              </button>
              <button
                onClick={() => setActiveTab("daily-list")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "daily-list"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Daily Distributions
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* Daily Distribution List Tab */}
            {activeTab === "daily-list" && (
              <div>
                {/* Header with Help Icon */}
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Daily Distributions</h4>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowDailyDistributionHelp(true)}
                      onMouseLeave={() => setShowDailyDistributionHelp(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Help"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Popover */}
                    {showDailyDistributionHelp && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg z-50">
                        <div className="text-center">
                          <div className="font-medium mb-1">Daily Distribution Report</div>
                          <div className="text-gray-300">
                            View all medicine distributions for the selected center and date. This shows completed distributions and their details.
                          </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <DailyDistributionList 
                  selectedDeliveryCenter={selectedDeliveryCenter}
                  selectedDate={selectedDistributionDate}
                  deliveryCenters={deliveryCenters}
                />
              </div>
            )}

            {/* New Distribution Tab */}
            {activeTab === "new-distribution" && (
              <div className="space-y-4">
                {/* Header with Help Icon */}
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">New Distribution</h4>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowNewDistributionHelp(true)}
                      onMouseLeave={() => setShowNewDistributionHelp(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Help"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Popover */}
                    {showNewDistributionHelp && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg z-50">
                        <div className="text-center">
                          <div className="font-medium mb-1">Create New Distribution</div>
                          <div className="text-gray-300">
                            Add new medicine distributions for patients. Search for existing patients or add new ones, then select medicines and quantities.
                          </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
          {/* Completed Patients in Current Session */}
          {completedPatients.length > 0 && (
            <div className={`bg-green-50 border border-green-200 rounded-lg p-4 mb-4 transition-all duration-500 ${
              fadingCompletedPatients.length > 0 ? 'opacity-0 transform -translate-y-2' : 'opacity-100'
            }`}>
              <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Completed Distributions This Session ({completedPatients.length})
                </div>
                <button 
                  onClick={() => {
                    setFadingCompletedPatients(completedPatients.map(p => p.id));
                    setTimeout(() => {
                      setCompletedPatients([]);
                      setFadingCompletedPatients([]);
                    }, 300);
                  }}
                  className="text-green-600 hover:text-green-800 transition-colors"
                  title="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {completedPatients.map((patient) => (
                  <div 
                    key={patient.id} 
                    className={`bg-white border border-green-200 rounded-md p-3 transition-all duration-300 ${
                      fadingCompletedPatients.includes(patient.id) ? 'opacity-0 transform scale-95' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                        <p className="text-xs text-gray-500">{patient.medicineCount} medicine{patient.medicineCount !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-xs text-green-600">
                        ✓ Saved
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Auto-fade notice */}
              <div className="mt-3 text-xs text-green-700 opacity-75 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This message will disappear automatically in a few seconds
              </div>
            </div>
          )}

          {/* Saved Distributions Table */}
          {savedDistributions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                </svg>
                Saved Distributions ({savedDistributions.length})
              </h3>
              
              {/* Error Display */}
              {distributionError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-red-800 font-medium text-sm">Distribution Error</h4>
                      <p className="text-red-700 text-sm mt-1">{distributionError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Center</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicines</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {savedDistributions.map((distribution) => (
                      <tr key={distribution.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{distribution.patientName}</div>
                            <div className="text-xs text-gray-500">ID: {distribution.patientId}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {distribution.deliveryCenter}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {distribution.distributionDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {distribution.medicineCount}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {distribution.totalQuantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          ₹{distribution.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Saved
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Medicine Distribution Table */}

          <div className="overflow-x-auto mb-4 pb-8">
            <Table className="border border-gray-300">
              <TableHead className="[&>tr>th]:bg-[#E8EFF2] [&>tr>th]:text-black">
                <TableRow>
                  <TableHeadCell>Patient Name</TableHeadCell>
                  <TableHeadCell>Medicine Name</TableHeadCell>
                  <TableHeadCell>Quantity & Batches</TableHeadCell>
                  <TableHeadCell>Action</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {/* Display existing distribution list - grouped by patient */}
                {Object.entries(
                  distributionList.reduce((groups, item) => {
                    const key = item.patientId;
                    if (!groups[key]) {
                      groups[key] = {
                        patient: { id: item.patientId, name: item.patientName, isNewPatient: item.isNewPatient },
                        medicines: []
                      };
                    }
                    groups[key].medicines.push(item);
                    return groups;
                  }, {})
                ).map(([patientId, group]) => (
                  <React.Fragment key={patientId}>
                    {/* Patient header row */}
                    <TableRow className="bg-blue-50">
                      <TableCell className="py-2 font-semibold text-blue-900" colSpan={4}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>Patient: {group.patient.name}</span>
                            {group.patient.isNewPatient && (
                              <span className="px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-full">
                                New Patient
                              </span>
                            )}
                            <span className="text-sm text-blue-700">({group.medicines.length} medicine{group.medicines.length !== 1 ? 's' : ''})</span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Medicine rows for this patient */}
                    {group.medicines.map((item) => (
                      <TableRow key={item.id} className="bg-white hover:bg-gray-50">
                        <TableCell className="py-3 pl-8">
                          <span className="text-gray-600">↳ Medicine</span>
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
                          {editingQuantity === item.id ? (
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <input
                                  type="number"
                                  value={editQuantityValue}
                                  onChange={(e) => setEditQuantityValue(e.target.value)}
                                  className={`w-20 border rounded px-2 py-1 text-sm focus:ring-1 focus:outline-none ${
                                    item.availableStock !== null && parseInt(editQuantityValue) > item.availableStock
                                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                  }`}
                                  min={1}
                                  max={item.availableStock}
                                  autoFocus
                                />
                                {item.availableStock !== null && parseInt(editQuantityValue) > item.availableStock && (
                                  <div className="absolute -bottom-5 left-0 text-xs text-red-600 whitespace-nowrap">
                                    Exceeds stock ({item.availableStock})
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleSaveQuantity(item.id)}
                                disabled={item.availableStock !== null && parseInt(editQuantityValue) > item.availableStock}
                                className={`transition-colors ${
                                  item.availableStock !== null && parseInt(editQuantityValue) > item.availableStock
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-green-600 hover:text-green-800'
                                }`}
                                title="Save"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={handleCancelEditQuantity}
                                className="text-gray-600 hover:text-red-600 transition-colors"
                                title="Cancel"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">{item.quantity}</div>
                                <div className="text-xs text-gray-500">units</div>
                              </div>
                              {item.totalPrice && (
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-green-600">₹{item.totalPrice.toFixed(2)}</div>
                                  <div className="text-xs text-gray-500">total</div>
                                </div>
                              )}
                            </div>
                          )}
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
                  </React.Fragment>
                ))}
                
                {/* Input row for adding new entries - only show when no items or user clicks "Add More" */}
                {(distributionList.length === 0 || showAddRow) && (
                  <TableRow className="bg-gray-50 hover:bg-gray-100">
                    <TableCell className="py-3">
                      <div className="relative patient-search-dropdown-container">
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            {distributionList.length > 0 ? (
                              // Show readonly patient name when there are already items
                              <input
                                type="text"
                                value={distributionList[0]?.patientName || ''}
                                readOnly
                                className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 bg-gray-100 cursor-not-allowed"
                                title="Patient already selected. Complete distribution to add medicines for a different patient."
                              />
                            ) : (
                              // Show searchable input only when no items exist
                              <>
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
                              </>
                            )}
                          </div>
                          {distributionList.length === 0 && (
                            <button
                              onClick={() => setShowAddPatientModal(true)}
                              className="px-3 py-2.5 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors flex items-center gap-1 whitespace-nowrap"
                              title="Add New Patient"
                            >
                              <FaCirclePlus className="text-sm" />
                              Patient
                            </button>
                          )}
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
                          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
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
                          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-center text-gray-500 text-sm">
                            No medicines found
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="text-center">
                        <span className="text-gray-500 text-sm">
                          Quantity will be set from batch selection
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        {/* Add Medicine button */}
                        <button
                          onClick={handleAddMedicine}
                          disabled={!patientSearchTerm.trim() || !currentMedicineName.trim()}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            patientSearchTerm.trim() && currentMedicineName.trim()
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          title="Select batches for medicine"
                        >
                          Select Batches
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
                
                {/* Add More button row and Complete Patient - show when there are items and add row is not shown */}
                {distributionList.length > 0 && !showAddRow && (
                  <TableRow className="bg-blue-50 hover:bg-blue-100">
                    <TableCell colSpan={4} className="py-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setShowAddRow(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          <FaCirclePlus className="text-lg" />
                          <span>Add More Medicine for Current Patient</span>
                        </button>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={handleStartNewDistribution}
                            disabled={submittingDistribution}
                            className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B] font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
                          >
                            Clear All
                          </button>
                          
                          <button
                            onClick={handleCompletePatientDistribution}
                            disabled={distributionList.length === 0 || submittingDistribution}
                            className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 flex items-center gap-2 ${
                              distributionList.length === 0 || submittingDistribution
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {submittingDistribution ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Complete Patient ({distributionList.length} {distributionList.length === 1 ? 'medicine' : 'medicines'})
                              </>
                            )}
                          </button>
                        </div>
                      </div>
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
              </div>
            )}
          </div>
        </div>
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
      
      {/* Batch Selection Modal */}
      {showBatchModal && (
        <Modal show={showBatchModal} onClose={handleCancelBatchSelection} size="4xl">
          <ModalHeader>
            Select Batches for {currentMedicineForBatch?.medicineName}
          </ModalHeader>
          <ModalBody>
            {loadingBatches ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full border-2 border-blue-200"></div>
                    <div className="absolute top-0 left-0 w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                  </div>
                  <span className="text-gray-500">Loading available batches...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {availableBatches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No batches available for this medicine at the selected location.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Available Batches</h4>
                      <p className="text-sm text-blue-700">
                        Select quantities from one or more batches. You can distribute from multiple batches in a single transaction.
                      </p>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300 rounded-lg">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Batch Name</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Expiry Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Available Qty</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unit Price</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity to Dispense</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {availableBatches.map((batch) => {
                            const selectedBatch = selectedBatches.find(b => b.id === batch.id);
                            const selectedQty = selectedBatch?.selectedQuantity || 0;
                            const totalPrice = selectedQty * batch.unitPrice;
                            
                            return (
                              <tr key={batch.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{batch.batchName}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {new Date(batch.expiryDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{batch.currentQuantity}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">₹{batch.unitPrice.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={selectedQty}
                                      onChange={(e) => handleBatchQuantityChange(batch.id, e.target.value)}
                                      onKeyDown={(e) => {
                                        // Allow: backspace, delete, tab, escape, enter, home, end, left, right, down, up
                                        if ([46, 8, 9, 27, 13, 35, 36, 37, 39, 40, 38].indexOf(e.keyCode) !== -1 ||
                                          // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
                                          (e.keyCode === 65 && e.ctrlKey === true) ||
                                          (e.keyCode === 67 && e.ctrlKey === true) ||
                                          (e.keyCode === 86 && e.ctrlKey === true) ||
                                          (e.keyCode === 88 && e.ctrlKey === true) ||
                                          (e.keyCode === 90 && e.ctrlKey === true)) {
                                          return;
                                        }
                                        // Ensure that it is a number and stop the keypress
                                        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                          e.preventDefault();
                                        }
                                      }}
                                      className={`w-20 border rounded px-2 py-1 text-sm focus:ring-1 focus:outline-none text-center ${
                                        selectedQty > batch.currentQuantity 
                                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
                                      }`}
                                      placeholder="0"
                                    />
                                    {selectedQty > batch.currentQuantity && (
                                      <div className="absolute -bottom-5 left-0 text-xs text-red-600 whitespace-nowrap">
                                        Max: {batch.currentQuantity}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-green-600">
                                  ₹{totalPrice.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {selectedBatches.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Selection Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-green-700">Total Quantity:</span>
                            <span className="font-medium ml-2">
                              {selectedBatches.reduce((sum, batch) => sum + batch.selectedQuantity, 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-green-700">Total Price:</span>
                            <span className="font-medium ml-2">
                              ₹{selectedBatches.reduce((sum, batch) => sum + (batch.selectedQuantity * batch.unitPrice), 0).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-green-700">Batches:</span>
                            <span className="font-medium ml-2">{selectedBatches.length}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={handleCancelBatchSelection}
                className="bg-white text-gray-600 hover:bg-gray-50 border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBatchSelection}
                disabled={selectedBatches.length === 0}
                className={`font-medium rounded-lg text-sm px-5 py-2.5 ${
                  selectedBatches.length > 0
                    ? 'text-white bg-green-600 hover:bg-green-700'
                    : 'text-gray-500 bg-gray-300 cursor-not-allowed'
                }`}
              >
                Add Medicine ({selectedBatches.reduce((sum, batch) => sum + batch.selectedQuantity, 0)} units)
              </button>
            </div>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};
export default Distribution;
