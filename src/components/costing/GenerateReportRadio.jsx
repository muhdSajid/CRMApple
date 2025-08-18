import React from "react";
import { Datepicker, Label } from "flowbite-react";

const GenerateReportRadio = ({ costingData, setCostingData }) => {
  const radioValues = [
    { id: "thisMonth", label: "This Month" },
    { id: "lastMonth", label: "Last Month" },
    { id: "last3Months", label: "Last 3 Months" },
    { id: "thisYear", label: "This Year" },
    { id: "customDate", label: "Select from date range" },
  ];
  const handleChange = (e) => {
    setCostingData({
      ...costingData,
      reportFor: e.target.id,
      toDate: new Date(),
      fromDate: new Date(),
    });
  };
  return (
    <>
      <div className="flex flex-wrap gap-4">
        <p className="flex items-center font-medium text-gray-700">
          Generate Report for
        </p>

        {radioValues.map((item) => (
          <div className="flex items-center" key={item.id}>
            <input
              type="radio"
              id={item.id}
              name="report-period"
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              checked={costingData.reportFor == item.id}
              onChange={handleChange}
            />
            <Label className="ml-2 text-sm text-gray-700">{item.label}</Label>
          </div>
        ))}
      </div>
      {costingData.reportFor === "customDate" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from-date">From Date</Label>
            <Datepicker
              id="toDate"
              className="custom-datepicker"
              maxDate={new Date()}
              value={costingData.fromDate}
              onChange={(e) => setCostingData({ ...costingData, fromDate: e })}
            />
          </div>

          <div>
            <Label htmlFor="to-date">To Date</Label>
            <Datepicker
              id="toDate"
              className="custom-datepicker"
              maxDate={new Date()}
              value={costingData.toDate}
              onChange={(e) => setCostingData({ ...costingData, toDate: e })}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GenerateReportRadio;
