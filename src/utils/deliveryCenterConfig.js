import { FaBed } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import { FaCampground } from "react-icons/fa";

/**
 * Configuration for delivery center types including icons and styling
 * This provides a centralized place to manage the visual representation of each delivery center type
 */
export const getDeliveryCenterTypeConfig = (typeName) => {
  const configs = {
    "Hospitals": {
      icon: FaBed,
      bgColor: "bg-pink-300",
      iconBg: "bg-pink-500",
      textColor: "text-pink-600",
      value: "hospitals"
    },
    "Medical Camps": {
      icon: FaCampground,
      bgColor: "bg-green-300",
      iconBg: "bg-green-500",
      textColor: "text-green-600",
      value: "medical-camps"
    },
    "Home Care": {
      icon: FaHome,
      bgColor: "bg-blue-300",
      iconBg: "bg-blue-500",
      textColor: "text-blue-600",
      value: "home-care"
    }
  };
  
  return configs[typeName] || {
    icon: FaBed,
    bgColor: "bg-gray-300",
    iconBg: "bg-gray-500",
    textColor: "text-gray-600",
    value: typeName.toLowerCase().replace(/\s+/g, '-')
  };
};

/**
 * Default fallback delivery center types in case API fails
 */
export const defaultDeliveryCenterTypes = [
  { 
    id: 1, 
    typeName: "Hospitals", 
    description: "Medical facilities providing comprehensive healthcare services and emergency care" 
  },
  { 
    id: 2, 
    typeName: "Medical Camps", 
    description: "Temporary healthcare facilities set up for community outreach and specialized medical services" 
  },
  { 
    id: 3, 
    typeName: "Home Care", 
    description: "Healthcare services delivered directly to patients in their residential locations" 
  }
];
