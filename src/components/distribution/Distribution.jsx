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
import { getDeliveryCenterTypes, getLocations } from "../../service/apiService";
import { getDeliveryCenterTypeConfig, defaultDeliveryCenterTypes } from "../../utils/deliveryCenterConfig";

const Distribution = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState("");
  const [pendingMode, setPendingMode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deliveryCenterTypes, setDeliveryCenterTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Accordion state
  const [locationAccordionOpen, setLocationAccordionOpen] = useState(true);
  const [typeAccordionOpen, setTypeAccordionOpen] = useState(false);

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
      setTypeAccordionOpen(false);
    }
    setSelectedLocation(locationId);
    
    // Auto-open distribution type accordion when location is selected
    if (locationId) {
      setLocationAccordionOpen(false); // Collapse location accordion
      setTypeAccordionOpen(true); // Open distribution type accordion
    }
  };

  const toggleLocationAccordion = () => {
    setLocationAccordionOpen(!locationAccordionOpen);
  };

  const toggleTypeAccordion = () => {
    setTypeAccordionOpen(!typeAccordionOpen);
  };

  const confirmSwitch = () => {
    setSelectedMode(pendingMode);
    setPendingMode("");
    setShowModal(false);
  };

  const cancelSwitch = () => {
    setPendingMode("");
    setShowModal(false);
  };

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

      {/* Show form fields only when both location and distribution type are selected */}
      {selectedLocation && selectedMode && (
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="centerName" className="text-sm font-medium text-gray-700">
                {selectedMode === 'hospitals' ? 'Hospital Name' : 
                 selectedMode === 'medical-camps' ? 'Medical Camp Name' : 
                 selectedMode === 'home-care' ? 'Home Care Center' : 'Center Name'}
              </Label>
              <select
                id="centerName"
                className="mt-1 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-white"
              >
                <option>Select {selectedMode === 'hospitals' ? 'hospital' : selectedMode === 'medical-camps' ? 'medical camp' : selectedMode === 'home-care' ? 'home care center' : 'center'}</option>
                {selectedMode === 'hospitals' && (
                  <>
                    <option>Motherhood Hospital</option>
                    <option>Apollo Hospital</option>
                    <option>Manipal Hospital</option>
                  </>
                )}
                {selectedMode === 'medical-camps' && (
                  <>
                    <option>Rural Health Camp - Village A</option>
                    <option>Eye Care Camp - School B</option>
                    <option>General Health Camp - Community Center</option>
                  </>
                )}
                {selectedMode === 'home-care' && (
                  <>
                    <option>Home Care Service - Area 1</option>
                    <option>Elderly Care - Residential Complex</option>
                    <option>Chronic Care - Home Service</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <Label htmlFor="distributionDate" className="text-sm font-medium text-gray-700">
                Date of Distribution
              </Label>
              <Datepicker
                id="distributionDate"
                className="mt-1"
                defaultDate={new Date()}
              />
            </div>
          </div>

          <div className="overflow-x-auto mb-6">
            <Table className="border border-gray-300">
              <TableHead className="[&>tr>th]:bg-[#E8EFF2] [&>tr>th]:text-black">
                <TableRow>
                  <TableHeadCell>Patient Name</TableHeadCell>
                  <TableHeadCell>Medicine Name</TableHeadCell>
                  <TableHeadCell>Quantity</TableHeadCell>
                  <TableHeadCell>Unit Type</TableHeadCell>
                  <TableHeadCell>Action</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                <TableRow className="bg-white hover:bg-gray-50">
                  <TableCell className="py-3">
                    <select className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none p-2.5">
                      <option>Select patient</option>
                      <option>Ranjan Dash</option>
                      <option>Priya Sharma</option>
                      <option>Rajesh Kumar</option>
                    </select>
                  </TableCell>
                  <TableCell className="py-3">
                    <input
                      type="text"
                      name="medicineName"
                      placeholder="Enter medicine name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      defaultValue="Paracetamol"
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <input
                      type="number"
                      name="quantity"
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      min={1}
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <select className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none p-2.5">
                      <option>Select unit</option>
                      <option>Tablets</option>
                      <option>Capsules</option>
                      <option>ml</option>
                      <option>mg</option>
                    </select>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <button className="text-[#2D506B] hover:text-blue-800 transition-colors">
                      <FaCirclePlus className="text-xl" />
                    </button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B] font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-white bg-[#2D506B] border hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Distribute
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
    </div>
  );
};
export default Distribution;
