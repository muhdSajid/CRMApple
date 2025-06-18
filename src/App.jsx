import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";
import MedicineStock from "./components/medicineStock/MedicineStoke";
import { Costing } from "./components/costing/Costing";
import Distribution from "./components/distribution/Distribution";
import { HelpCenter } from "./components/helpCenter/HelpCenter";
import FaqPage from "./components/faq/Faq";
import UserGuide from "./components/common/userGuide/UserGuide";
import LoginPage from "./components/auth/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/stock" element={<MedicineStock />} />
          <Route path="/cost" element={<Costing />} />
          <Route path="/distribution" element={<Distribution />} />
          <Route path="/helpcenter" element={<HelpCenter />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/userguide" element={<UserGuide />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
