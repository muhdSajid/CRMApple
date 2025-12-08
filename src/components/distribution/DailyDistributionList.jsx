import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableHeadCell, TableRow, TableBody, TableCell } from 'flowbite-react';
import { getMedicineDistributionsByPatient } from '../../service/apiService';

const DailyDistributionList = ({ selectedDeliveryCenter, selectedDate }) => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format date for API call
  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Fetch distributions when center or date changes
  useEffect(() => {
    const fetchDistributions = async () => {
      if (!selectedDeliveryCenter || !selectedDate) {
        setDistributions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const formattedDate = formatDateForAPI(selectedDate);
        const data = await getMedicineDistributionsByPatient(selectedDeliveryCenter, formattedDate);
        setDistributions(data || []);
      } catch (err) {
        console.error('Error fetching distributions:', err);
        setError(err.message || 'Failed to fetch distributions');
        setDistributions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDistributions();
  }, [selectedDeliveryCenter, selectedDate]);

  if (!selectedDeliveryCenter || !selectedDate) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm mt-6">
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-6 h-6 rounded-full border-2 border-blue-200"></div>
                <div className="absolute top-0 left-0 w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
              </div>
              <span className="text-gray-500 dark:text-gray-400">Loading distributions...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 dark:text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-red-800 dark:text-red-300 font-medium">Error Loading Distributions</h4>
                <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : distributions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No Distributions Found</p>
                <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">No medicine distributions were recorded for this date and center.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Distribution Table */}
            <div className="overflow-x-auto">
              <Table className="border border-gray-300 dark:border-gray-600">
                <TableHead className="[&>tr>th]:bg-[#E8EFF2] [&>tr>th]:text-black">
                  <TableRow>
                    <TableHeadCell>Patient Info</TableHeadCell>
                    <TableHeadCell>Medicine Details</TableHeadCell>
                    <TableHeadCell>Batch Info</TableHeadCell>
                    <TableHeadCell>Quantity</TableHeadCell>
                    <TableHeadCell>Unit Price</TableHeadCell>
                    <TableHeadCell>Total Price</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y">
                  {distributions.map((patient) => (
                    <React.Fragment key={patient.patientId}>
                      {patient.medicines.map((medicine, index) => (
                        <TableRow key={`${patient.patientId}-${medicine.distributionId}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          {index === 0 && (
                            <TableCell 
                              className="py-2 px-3 font-medium bg-blue-50 dark:bg-blue-900/20 border-r border-blue-200 dark:border-blue-700" 
                              rowSpan={patient.medicines.length}
                            >
                              <div className="space-y-0.5">
                                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                  {patient.patientName} <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(ID: {patient.patientExternalId})</span>
                                </div>
                                <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                                  Total: ₹{patient.medicines.reduce((sum, med) => sum + med.totalPrice, 0).toFixed(2)}
                                </div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="py-2 px-3">
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{medicine.medicineName}</div>
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{medicine.batchName}</div>
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            <div className="text-center">
                              <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{medicine.quantity}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">units</div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            <div className="text-center">
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">₹{medicine.unitPrice.toFixed(2)}</div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            <div className="text-center">
                              <div className="text-base font-semibold text-green-600 dark:text-green-400">₹{medicine.totalPrice.toFixed(2)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">total</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyDistributionList;
