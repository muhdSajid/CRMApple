import "./App.css";
// import { Button } from "flowbite-react";
import { SideNavBar } from "./Layout/SideNavBar";
import { NavBar } from "./Layout/NavBar";

function App() {
  return (
    <>
      {/* <h1 className="text-[30px] text-center text-blue-500">CRM ACtiviy</h1> */}
      <SideNavBar />
      <NavBar />
    </>
  );
}

export default App;
