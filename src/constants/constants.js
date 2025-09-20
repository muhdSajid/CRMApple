const isProduction = import.meta.env.MODE === "production";

// Use proxy path for development, full URL for production
export const apiDomain = isProduction ? "" : "";
export const authApiDomain = "http://localhost:8081";

/**
 * System Privileges - Complete list of all privileges in the system
 * These correspond to the exact privilege names returned by the API
 */
export const PRIVILEGES = {
  // User Management Privileges
  USER_CREATE: 'user.create',
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_ALL: 'user.*',

  // Medicine Stock Privileges
  MEDICINE_STOCK_VIEW: 'medicine.stock.view',
  MEDICINE_STOCK_DETAILS: 'medicine.stock.details',
  MEDICINE_STOCK_CREATE: 'medicine.stock.create',
  MEDICINE_STOCK_UPDATE: 'medicine.stock.update',
  MEDICINE_STOCK_BATCH_ADD: 'medicine.stock.batch.add',
  MEDICINE_STOCK_BATCH_EDIT: 'medicine.stock.batch.edit',
  MEDICINE_STOCK_BATCH_DELETE: 'medicine.stock.batch.delete',
  MEDICINE_STOCK_ALL: 'medicine.stock.*',

  // Dashboard Privileges
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_ALL: 'dashboard.*',

  // Medicine Distribution Privileges
  MEDICINE_DISTRIBUTION_VIEW: 'medicine.distribution.view',
  MEDICINE_DISTRIBUTION_DETAILS: 'medicine.distribution.details',
  MEDICINE_DISTRIBUTION_CREATE: 'medicine.distribution.create',
  MEDICINE_DISTRIBUTION_CENTER_ADD: 'medicine.distribution.center.add',
  MEDICINE_DISTRIBUTION_PATIENT_ADD: 'medicine.distribution.patient.add',
  MEDICINE_DISTRIBUTION_ALL: 'medicine.distribution.*',

  // Report Privileges
  REPORT_COSTING: 'Report.costing',
  REPORT_ALL: 'Report.*',

  // Settings Privileges
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MEDICINE_ALL: 'settings.medicince.*',
  SETTINGS_LOCATION_ALL: 'settings.location.*',
  SETTINGS_ALL: 'settings.*',
  
  // Individual settings management
  MEDICINE_TYPE_MANAGE: 'settings.medicine.types.manage',
  LOCATION_MANAGE: 'settings.location.manage', 
  ROLE_MANAGE: 'settings.role.manage',
  
  // Distribution shorthand (alias for MEDICINE_DISTRIBUTION_VIEW)
  DISTRIBUTION_VIEW: 'medicine.distribution.view',

  // Super Admin Privilege
  ALL: '*',
};

/**
 * Privilege groups for easier management
 */
export const PRIVILEGE_GROUPS = {
  // Main Navigation Items
  MEDICINE_STOCK_ACCESS: [
    PRIVILEGES.MEDICINE_STOCK_VIEW,
    PRIVILEGES.MEDICINE_STOCK_DETAILS,
    PRIVILEGES.MEDICINE_STOCK_CREATE,
    PRIVILEGES.MEDICINE_STOCK_UPDATE,
    PRIVILEGES.MEDICINE_STOCK_ALL,
    PRIVILEGES.ALL
  ],
  
  DASHBOARD_ACCESS: [
    PRIVILEGES.DASHBOARD_VIEW,
    PRIVILEGES.DASHBOARD_ALL,
    PRIVILEGES.ALL
  ],
  
  DISTRIBUTION_ACCESS: [
    PRIVILEGES.MEDICINE_DISTRIBUTION_VIEW,
    PRIVILEGES.MEDICINE_DISTRIBUTION_DETAILS,
    PRIVILEGES.MEDICINE_DISTRIBUTION_CREATE,
    PRIVILEGES.MEDICINE_DISTRIBUTION_ALL,
    PRIVILEGES.ALL
  ],
  
  COSTING_ACCESS: [
    PRIVILEGES.REPORT_COSTING,
    PRIVILEGES.REPORT_ALL,
    PRIVILEGES.ALL
  ],
  
  // Settings Sub-items
  USER_MANAGEMENT_ACCESS: [
    PRIVILEGES.USER_CREATE,
    PRIVILEGES.USER_READ,
    PRIVILEGES.USER_UPDATE,
    PRIVILEGES.USER_DELETE,
    PRIVILEGES.USER_ALL,
    PRIVILEGES.SETTINGS_ALL,
    PRIVILEGES.ALL
  ],
  
  MEDICINE_TYPES_ACCESS: [
    PRIVILEGES.SETTINGS_MEDICINE_ALL,
    PRIVILEGES.SETTINGS_ALL,
    PRIVILEGES.ALL
  ],
  
  LOCATIONS_ACCESS: [
    PRIVILEGES.SETTINGS_LOCATION_ALL,
    PRIVILEGES.SETTINGS_ALL,
    PRIVILEGES.ALL
  ],
  
  ROLE_MANAGEMENT_ACCESS: [
    PRIVILEGES.USER_ALL,
    PRIVILEGES.SETTINGS_ALL,
    PRIVILEGES.ALL
  ],
  
  // General Settings Access (to show settings dropdown)
  SETTINGS_ACCESS: [
    PRIVILEGES.USER_CREATE,
    PRIVILEGES.USER_READ,
    PRIVILEGES.USER_UPDATE,
    PRIVILEGES.USER_DELETE,
    PRIVILEGES.USER_ALL,
    PRIVILEGES.SETTINGS_MEDICINE_ALL,
    PRIVILEGES.SETTINGS_LOCATION_ALL,
    PRIVILEGES.SETTINGS_ALL,
    PRIVILEGES.ALL
  ]
};