import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";
import MedicineStock from "./components/medicineStock/MedicineStoke";
import { Costing } from "./components/costing/Costing";
import Distribution from "./components/distribution/Distribution";
import { HelpCenter } from "./components/helpCenter/HelpCenter";
import FaqPage from "./components/faq/Faq";
import UserGuide from "./components/common/userGuide/UserGuide";
import LoginPage from "./components/auth/Login";
import SignupPage from "./components/auth/Signup";
import UserManagement from "./components/usermanagment/UserManagment";
import ProtectedRoute from "./components/common/ProtectedRoute";
import NetworkRequestTracker from "./components/common/NetworkRequestTracker";
import { checkAuthStatus } from "./store/authSlice";
// Import manual token setup utility (available in console as window.setupManualToken)
import "./utils/manualTokenSetup";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <Router>
      <NetworkRequestTracker />
      <ToastContainer position="top-right" autoClose={"5000"} theme="colored" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="/stock" element={<MedicineStock />} />
          <Route path="/cost" element={<Costing />} />
          <Route path="/distribution" element={<Distribution />} />
          <Route path="/helpcenter" element={<HelpCenter />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/userguide" element={<UserGuide />} />
          <Route path="/usermanagment" element={<UserManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
