import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Datepicker, Label } from "flowbite-react";
import GenerateReportRadio from "./GenerateReportRadio";
import SelectWarehouseMultiSelect from "./SelectWarehouseMultiSelect";

export const Costing = () => {
  const [costingData, setCostingData] = useState({
    reportFor: "thisMonth",
    dateOfPurchase: new Date(),
    warehouse: [],
    category: "",
    type: "pdf",
    toDate: new Date(),
    fromDate: new Date(),
  });
  const handleExport = (e) => {
    e.preventDefault();
    if (
      costingData.reportFor == "customDate" &&
      costingData.fromDate > costingData.toDate
    ) {
      toast.error("From date should not be greater than To date");
    } else {
      console.log('costingData', costingData)
    }
  };

  return (
    <div className="mt-10">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Cost Report Generator
        </h2>

        <form className="space-y-6">
          <GenerateReportRadio
            costingData={costingData}
            setCostingData={setCostingData}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchase-date">Date of Purchase/ Donation</Label>
              <div className="relative">
                <Datepicker
                  id="purchase-date"
                  className="custom-datepicker"
                  onChange={(e) =>
                    setCostingData({ ...costingData, dateOfPurchase: e })
                  }
                  value={costingData.dateOfPurchase}
                />
              </div>
            </div>

            <SelectWarehouseMultiSelect
              costingData={costingData}
              setCostingData={setCostingData}
            />

            <div>
              <Label htmlFor="medicine-category">Medicine Category</Label>
              <select
                id="medicine-category"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                onChange={(e) =>
                  setCostingData({ ...costingData, category: e.target.value })
                }
                value={costingData.category}
              >
                <option value="">Select</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Analgesics">Analgesics</option>
                <option value="Antifungals">Antifungals</option>
              </select>
            </div>

            <div>
              <Label htmlFor="export-as">Export as</Label>
              <select
                id="export-as"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                onChange={(e) =>
                  setCostingData({ ...costingData, type: e.target.value })
                }
                value={costingData.type}
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B]  font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-white bg-[#2D506B] border  hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5"
              onClick={handleExport}
            >
              Generate Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
