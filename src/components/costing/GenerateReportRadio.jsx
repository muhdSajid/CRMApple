import React, { useEffect, useCallback } from "react";
import { Datepicker, Label } from "flowbite-react";

const GenerateReportRadio = ({ costingData, setCostingData }) => {
  const radioValues = [
    { id: "thisMonth", label: "This Month" },
    { id: "lastMonth", label: "Last Month" },
    { id: "last3Months", label: "Last 3 Months" },
    { id: "thisYear", label: "This Year" },
    { id: "customDate", label: "Select from date range" },
  ];

  // Helper function to calculate date ranges
  const getDateRange = useCallback((reportFor) => {
    const today = new Date();
    let startDate, endDate;

    switch (reportFor) {
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "lastMonth":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "last3Months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "thisYear":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      case "customDate":
        startDate = costingData.fromDate;
        endDate = costingData.toDate;
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    return { startDate, endDate };
  }, [costingData.fromDate, costingData.toDate]);

  // Update dates when reportFor changes (except for customDate)
  useEffect(() => {
    if (costingData.reportFor !== 'customDate') {
      const { startDate, endDate } = getDateRange(costingData.reportFor);
      setCostingData(prev => ({
        ...prev,
        fromDate: startDate,
        toDate: endDate,
      }));
    }
  }, [costingData.reportFor, getDateRange, setCostingData]);

  const handleChange = (e) => {
    setCostingData({
      ...costingData,
      reportFor: e.target.id,
    });
  };

  const handleFromDateChange = (date) => {
    setCostingData({
      ...costingData,
      fromDate: date,
    });
  };

  const handleToDateChange = (date) => {
    setCostingData({
      ...costingData,
      toDate: date,
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

      {/* From Date and To Date Fields - Always shown */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="from-date" value="From Date" />
          <Datepicker
            key={`from-${costingData.fromDate?.getTime()}`}
            id="from-date"
            value={costingData.fromDate}
            defaultDate={costingData.fromDate}
            onSelectedDateChanged={handleFromDateChange}
            maxDate={costingData.toDate || new Date()}
            showTodayButton={false}
            showClearButton={false}
            className="mt-1"
            disabled={costingData.reportFor !== 'customDate'}
          />
        </div>
        <div>
          <Label htmlFor="to-date" value="To Date" />
          <Datepicker
            key={`to-${costingData.toDate?.getTime()}`}
            id="to-date"
            value={costingData.toDate}
            defaultDate={costingData.toDate}
            onSelectedDateChanged={handleToDateChange}
            minDate={costingData.fromDate}
            maxDate={new Date()}
            showTodayButton={false}
            showClearButton={false}
            className="mt-1"
            disabled={costingData.reportFor !== 'customDate'}
          />
        </div>
      </div>
    </>
  );
};

export default GenerateReportRadio;
