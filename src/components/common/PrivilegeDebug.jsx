import React, { useEffect, useState } from 'react';
import { getUserPrivileges, hasPrivilege, hasAnyPrivilege } from '../../utils/privilegeUtils';
import { PRIVILEGE_GROUPS, PRIVILEGES } from '../../constants/constants';

/**
 * Debug component to help troubleshoot privilege issues
 * Add this component temporarily to any page to see privilege information
 */
const PrivilegeDebug = () => {
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const privileges = getUserPrivileges();
    const privilegeNames = privileges.map(p => p.privilegeName);
    
    const info = {
      // Raw privilege data
      rawPrivileges: privileges,
      privilegeNames: privilegeNames,
      
      // Wildcard tests
      hasWildcard: hasPrivilege('*'),
      hasAnyWildcard: hasAnyPrivilege(['*']),
      
      // Specific privilege tests
      hasMedicineStockView: hasPrivilege('medicine.stock.view'),
      hasDashboardView: hasPrivilege('dashboard.view'),
      
      // Group tests (these are what the sidebar uses)
      medicineStockAccess: hasAnyPrivilege(PRIVILEGE_GROUPS.MEDICINE_STOCK_ACCESS),
      dashboardAccess: hasAnyPrivilege(PRIVILEGE_GROUPS.DASHBOARD_ACCESS),
      distributionAccess: hasAnyPrivilege(PRIVILEGE_GROUPS.DISTRIBUTION_ACCESS),
      costingAccess: hasAnyPrivilege(PRIVILEGE_GROUPS.COSTING_ACCESS),
      settingsAccess: hasAnyPrivilege(PRIVILEGE_GROUPS.SETTINGS_ACCESS),
      
      // Constants check
      privilegeGroupsMedicineStock: PRIVILEGE_GROUPS.MEDICINE_STOCK_ACCESS,
      privilegeAll: PRIVILEGES.ALL,
      
      // LocalStorage check
      userRole: JSON.parse(localStorage.getItem('userRole') || 'null'),
      userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
      userToken: localStorage.getItem('userToken') ? 'exists' : 'missing'
    };
    
    setDebugInfo(info);
    console.log('=== PRIVILEGE DEBUG INFO ===', info);
  }, []);

  if (!debugInfo) {
    return <div>Loading debug info...</div>;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid red',
      padding: '10px',
      maxWidth: '400px',
      maxHeight: '500px',
      overflow: 'auto',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ color: 'red', margin: '0 0 10px 0' }}>PRIVILEGE DEBUG</h3>
      
      <div><strong>User Privileges:</strong></div>
      <pre>{JSON.stringify(debugInfo.privilegeNames, null, 2)}</pre>
      
      <div><strong>Wildcard Tests:</strong></div>
      <div>hasPrivilege('*'): {debugInfo.hasWildcard ? '✅' : '❌'}</div>
      <div>hasAnyPrivilege(['*']): {debugInfo.hasAnyWildcard ? '✅' : '❌'}</div>
      
      <div><strong>Navigation Access:</strong></div>
      <div>Medicine Stock: {debugInfo.medicineStockAccess ? '✅' : '❌'}</div>
      <div>Dashboard: {debugInfo.dashboardAccess ? '✅' : '❌'}</div>
      <div>Distribution: {debugInfo.distributionAccess ? '✅' : '❌'}</div>
      <div>Costing: {debugInfo.costingAccess ? '✅' : '❌'}</div>
      <div>Settings: {debugInfo.settingsAccess ? '✅' : '❌'}</div>
      
      <div><strong>Constants:</strong></div>
      <div>PRIVILEGES.ALL = "{debugInfo.privilegeAll}"</div>
      
      <div><strong>Storage:</strong></div>
      <div>userToken: {debugInfo.userToken}</div>
      <div>userRole: {debugInfo.userRole ? 'exists' : 'missing'}</div>
    </div>
  );
};

export default PrivilegeDebug;