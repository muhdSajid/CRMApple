import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";
import MedicineStock from "./components/medicineStock/MedicineStoke";
import { Costing } from "./components/costing/Costing";
import Distribution from "./components/distribution/Distribution";
import { HelpCenter } from "./components/helpCenter/HelpCenter";
import FaqPage from "./components/faq/Faq";
import UserGuide from "./components/common/userGuide/UserGuide";
import LoginPage from "./components/auth/Login";
import SignupPage from "./components/auth/Signup";
import ChangePassword from "./components/auth/ChangePassword";
import UserManagement from "./components/usermanagment/UserManagment";
import Settings from "./components/settings/Settings";
import MedicineTypes from "./components/settings/MedicineTypes";
import Location from "./components/settings/Location";
import RoleManagement from "./components/settings/RoleManagement";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ProtectedRouteWithPrivileges from "./components/common/ProtectedRouteWithPrivileges";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { checkAuthStatus } from "./store/authSlice";
import { PRIVILEGES } from "./constants/constants";
// Import manual token setup utility (available in console as window.setupManualToken)
import "./utils/manualTokenSetup";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Router>
        <ToastContainer position="top-right" autoClose={"5000"} theme="colored" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            {/* Dashboard - requires dashboard view privilege */}
            <Route index element={
              <ProtectedRouteWithPrivileges privileges={[PRIVILEGES.DASHBOARD_VIEW]}>
                <Dashboard />
              </ProtectedRouteWithPrivileges>
            } />
            
            {/* Medicine Stock - requires medicine stock view privileges */}
            <Route path="/stock" element={
              <ProtectedRouteWithPrivileges privileges={[PRIVILEGES.MEDICINE_STOCK_VIEW]}>
                <MedicineStock />
              </ProtectedRouteWithPrivileges>
            } />
            
            {/* Costing - requires report costing privileges */}
            <Route path="/cost" element={
              <ProtectedRouteWithPrivileges privileges={[PRIVILEGES.REPORT_COSTING]}>
                <Costing />
              </ProtectedRouteWithPrivileges>
            } />
            
            {/* Distribution - requires distribution view privileges */}
            <Route path="/distribution" element={
              <ProtectedRouteWithPrivileges privileges={[PRIVILEGES.DISTRIBUTION_VIEW]}>
                <Distribution />
              </ProtectedRouteWithPrivileges>
            } />
            
            {/* User Management - requires user read privileges */}
            <Route path="/usermanagment" element={
              <ProtectedRouteWithPrivileges privileges={[PRIVILEGES.USER_READ]}>
                <UserManagement />
              </ProtectedRouteWithPrivileges>
            } />
            
            {/* Settings - requires settings view privileges */}
            <Route path="/settings" element={
              <ProtectedRouteWithPrivileges privileges={[PRIVILEGES.SETTINGS_VIEW]}>
                <Settings />
              </ProtectedRouteWithPrivileges>
            } />
            
            {/* Medicine Types - requires medicine settings management */}
            <Route path="/settings/medicine-types" element={
              <ProtectedRouteWithPrivileges privileges={[PRIVILEGES.MEDICINE_TYPE_MANAGE]}>
                <MedicineTypes />
              </ProtectedRouteWithPrivileges>
            } />
            
            {/* Location Management - requires location management */}
            <Route path="/settings/locations" element={
              <ProtectedRouteWithPrivileges privileges={[PRIVILEGES.LOCATION_MANAGE]}>
                <Location />
              </ProtectedRouteWithPrivileges>
            } />
            
            {/* Role Management - requires role management privileges */}
            <Route path="/settings/role-management" element={
              <ProtectedRouteWithPrivileges privileges={[PRIVILEGES.ROLE_MANAGE]}>
                <RoleManagement />
              </ProtectedRouteWithPrivileges>
            } />
            
            {/* General authenticated routes without specific privilege requirements */}
            <Route path="/helpcenter" element={<HelpCenter />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/userguide" element={<UserGuide />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
