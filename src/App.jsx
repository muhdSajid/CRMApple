import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";
import MedicineStock from "./components/medicineStock/MedicineStoke";
import { Costing } from "./components/costing/Costing";
import Distribution from "./components/distribution/Distribution";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/stock" element={<MedicineStock />} />
          <Route path="/cost" element={<Costing />} />
          <Route path="/distribution" element={<Distribution />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
