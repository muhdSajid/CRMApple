import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableHeadCell, TableRow, TableBody, TableCell } from 'flowbite-react';
import { getMedicineDistributionsByPatient } from '../../service/apiService';

const DailyDistributionList = ({ selectedDeliveryCenter, selectedDate, deliveryCenters }) => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get the selected center details
  const selectedCenter = deliveryCenters.find(center => 
    String(center.id) === selectedDeliveryCenter
  );

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
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-6">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Daily Medicine Distributions
        </h3>
        
        {/* Distribution Center and Date */}
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Distribution Center:</strong> {selectedCenter?.name || 'Unknown Center'}</p>
          <p><strong>Date:</strong> {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'No date selected'}</p>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-6 h-6 rounded-full border-2 border-blue-200"></div>
                <div className="absolute top-0 left-0 w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
              </div>
              <span className="text-gray-500">Loading distributions...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-red-800 font-medium">Error Loading Distributions</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : distributions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <p className="text-lg font-medium">No Distributions Found</p>
                <p className="text-sm mt-1">No medicine distributions were recorded for this date and center.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Distribution Table */}
            <div className="overflow-x-auto">
              <Table className="border border-gray-300">
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
                        <TableRow key={`${patient.patientId}-${medicine.distributionId}`} className="hover:bg-gray-50">
                          {index === 0 && (
                            <TableCell 
                              className="py-3 font-medium bg-blue-50 border-r border-blue-200" 
                              rowSpan={patient.medicines.length}
                            >
                              <div className="space-y-1">
                                <div className="font-semibold text-gray-900">{patient.patientName}</div>
                                <div className="text-xs text-gray-500">ID: {patient.patientExternalId}</div>
                                <div className="text-xs text-blue-600">
                                  {patient.medicines.length} medicine{patient.medicines.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="py-3">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">{medicine.medicineName}</div>
                              <div className="text-xs text-gray-500">Medicine ID: {medicine.medicineId}</div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900">{medicine.batchName}</div>
                              <div className="text-xs text-gray-500">Batch ID: {medicine.batchId}</div>
                              <div className="text-xs text-gray-500">Location: {medicine.locationId}</div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">{medicine.quantity}</div>
                              <div className="text-xs text-gray-500">units</div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="text-center">
                              <div className="font-medium text-gray-900">₹{medicine.unitPrice.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">per unit</div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">₹{medicine.totalPrice.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">total</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Patient total row */}
                      <TableRow className="bg-gray-50 border-t-2 border-gray-300">
                        <TableCell className="py-2 font-semibold text-right" colSpan={5}>
                          Total for {patient.patientName}:
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              ₹{patient.medicines.reduce((sum, med) => sum + med.totalPrice, 0).toFixed(2)}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
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
