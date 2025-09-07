import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button, Datepicker, Label, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import GenerateReportRadio from "./GenerateReportRadio";
import SelectLocationMultiple from "./SelectLocationMultiple";
import SelectMedicineCategoryDropdown from "./SelectMedicineCategoryDropdown";
import { getMedicineDailyCostSummary } from "../../service/apiService";

export const Costing = () => {
  const [costingData, setCostingData] = useState({
    reportFor: "thisMonth",
    location: [],
    category: [],
    type: "pdf",
    toDate: new Date(),
    fromDate: new Date(),
  });

  // Initialize dates for "thisMonth" on component mount
  useEffect(() => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setCostingData(prev => ({
      ...prev,
      fromDate: startDate,
      toDate: endDate,
    }));
  }, []);

  const [reportResults, setReportResults] = useState([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleExport = async (e) => {
    e.preventDefault();
    
    // Validation
    if (costingData.reportFor === "customDate" && costingData.fromDate > costingData.toDate) {
      toast.error("From date should not be greater than To date");
      return;
    }

    if (!costingData.location || costingData.location.length === 0) {
      toast.error("Please select at least one location");
      return;
    }

    try {
      setIsGeneratingReport(true);
      setShowResults(false);

      // Format dates to YYYY-MM-DD
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };

      // Prepare API payload using the dates from costingData
      const searchData = {
        locationIds: costingData.location,
        startDate: formatDate(costingData.fromDate),
        endDate: formatDate(costingData.toDate),
      };

      console.log('Search data:', searchData);

      // Call API
      const results = await getMedicineDailyCostSummary(searchData);
      setReportResults(results);
      setShowResults(true);

    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
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
            <SelectLocationMultiple
              costingData={costingData}
              setCostingData={setCostingData}
            />

            <SelectMedicineCategoryDropdown
              costingData={costingData}
              setCostingData={setCostingData}
            />
    
            {/* <div>
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
            </div> */}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B]  font-medium rounded-lg text-sm px-5 py-2.5"
              onClick={() => {
                setShowResults(false);
                setReportResults([]);
              }}
            >
              Clear Results
            </Button>
            <Button
              type="submit"
              className="text-white bg-[#2D506B] border  hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleExport}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <>
                  <div className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </div>
        </form>

        {/* Results Table */}
        {showResults && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Medicine Cost Summary ({reportResults.length} records)
              </h3>
              <div className="text-sm text-gray-600">
                Total Cost: ₹{reportResults.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toLocaleString()}
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table className="border border-gray-300">
                <TableHead className="[&>tr>th]:bg-[#E8EFF2] [&>tr>th]:text-black">
                  <TableRow>
                    <TableHeadCell>Medicine Name</TableHeadCell>
                    <TableHeadCell>Location</TableHeadCell>
                    <TableHeadCell>Delivery Center</TableHeadCell>
                    <TableHeadCell>Date</TableHeadCell>
                    <TableHeadCell>Units</TableHeadCell>
                    <TableHeadCell>Total Price</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y">
                  {reportResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No records found for the selected criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportResults.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">
                          {item.medicineName}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {item.locationName}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {item.deliveryCenterName || 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {new Date(item.distDate).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {item.numberOfUnit}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          ₹{item.totalPrice.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
