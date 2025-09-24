import React, { useState, useEffect } from 'react';
import { config } from '../config/config';
import { assetAPI } from '../services/api';

const ViewEmployeeModal = ({ show, onHide, employee }) => {
  const [assignedAssets, setAssignedAssets] = useState([]);

  // Load assigned assets for this employee from API
  useEffect(() => {
    const loadAssignedAssets = async () => {
      if (show && employee) {
        try {
          console.log('🔍 ViewEmployeeModal: Loading assigned assets for employee:', employee.firstName, employee.lastName);
          const result = await assetAPI.getAll();
          
          if (result && result.status === 'success') {
            const assets = result.data;
            const employeeAssets = assets.filter(asset => 
              asset.assignedTo === (employee.fullName || `${employee.firstName} ${employee.lastName}`)
            );
            console.log('🔍 ViewEmployeeModal: Found assigned assets:', employeeAssets.length);
            setAssignedAssets(employeeAssets);
          } else {
            console.error('Error loading assigned assets:', result?.message || 'Unknown error');
            setAssignedAssets([]);
          }
        } catch (error) {
          console.error('Error loading assigned assets:', error);
          setAssignedAssets([]);
        }
      }
    };

    loadAssignedAssets();
  }, [show, employee, employee?.handoverDetails, employee?.updatedAt]);

  const handleBackdropClick = (e) => {
    // Only close if clicking on the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Relieved': return 'bg-gray-100 text-gray-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      case 'Terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-500';
      case 'Relieved': return 'bg-gray-500';
      case 'On Leave': return 'bg-yellow-500';
      case 'Terminated': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!show || !employee) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-50 text-gray-900 rounded-t-2xl border-none p-6 border-b border-gray-200 flex justify-between items-center">
          <h5 className="text-xl font-semibold mb-0">Employee Details</h5>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            onClick={onHide}
          >
            ×
          </button>
        </div>
        
        <div className="text-gray-900 bg-white p-6">
          {/* Employee Information Table */}
          <div className="mb-6">
            <h6 className="text-gray-500 font-semibold mb-4">Employee Information</h6>
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-semibold text-gray-700 w-1/3">Employee ID:</td>
                    <td className="px-6 py-4 text-gray-900">{employee.id}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">Name:</td>
                    <td className="px-6 py-4 text-gray-900">{employee.fullName || `${employee.firstName} ${employee.lastName}`}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-semibold text-gray-700">Email:</td>
                    <td className="px-6 py-4 text-gray-900">{employee.email}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">Phone:</td>
                    <td className="px-6 py-4 text-gray-900">{employee.phone || 'N/A'}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-semibold text-gray-700">Department:</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                        {employee.department}
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">Role:</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-600 text-white">
                        {employee.position}
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-semibold text-gray-700">Hire Date:</td>
                    <td className="px-6 py-4 text-gray-900">{formatDate(employee.hireDate)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">Status:</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(employee.status)} text-white`}>
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                  {/* Handover Details Row - Only show for Relieved or Terminated employees */}
                  {(employee.status === 'Relieved' || employee.status === 'Terminated') && (
                    <tr className="bg-white">
                      <td className="px-6 py-4 font-semibold text-gray-700 align-top">Handover Details:</td>
                      <td className="px-6 py-4">
                        {employee.handoverDetails && (
                          employee.handoverDetails.handoverDate || 
                          employee.handoverDetails.handoverTo || 
                          employee.handoverDetails.handoverReason ||
                          (employee.handoverDetails.assetsToReturn && employee.handoverDetails.assetsToReturn.length > 0) ||
                          employee.handoverDetails.notes
                        ) ? (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h6 className="text-sm font-semibold text-blue-800 mb-2">Handover Information</h6>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-blue-700 font-medium">Date:</span>
                                    <span className="text-sm text-blue-900">{formatDate(employee.handoverDetails.handoverDate)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-blue-700 font-medium">To:</span>
                                    <span className="text-sm text-blue-900">{employee.handoverDetails.handoverTo}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-blue-700 font-medium">Reason:</span>
                                    <span className="text-sm text-blue-900">{employee.handoverDetails.handoverReason}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-blue-700 font-medium">Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      employee.handoverDetails.handoverStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                                      employee.handoverDetails.handoverStatus === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                      employee.handoverDetails.handoverStatus === 'Partial' ? 'bg-orange-100 text-orange-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {employee.handoverDetails.handoverStatus}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h6 className="text-sm font-semibold text-blue-800 mb-2">Assets to Return</h6>
                                {employee.handoverDetails.assetsToReturn && employee.handoverDetails.assetsToReturn.length > 0 ? (
                                  <div className="space-y-1">
                                    {employee.handoverDetails.assetsToReturn.map((assetId, index) => {
                                      const asset = assignedAssets.find(a => a.id === assetId);
                                      return (
                                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 border border-blue-200">
                                          <div>
                                            <span className="text-sm font-medium text-blue-900">
                                              {asset ? asset.name : `Asset ID: ${assetId}`}
                                            </span>
                                            {asset && (
                                              <span className="text-xs text-blue-600 ml-2">({asset.assetId})</span>
                                            )}
                                          </div>
                                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            asset && asset.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {asset ? asset.status : 'Unknown'}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-sm text-blue-600 italic">No assets marked for return</p>
                                )}
                              </div>
                            </div>
                            
                            {employee.handoverDetails.notes && (
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <h6 className="text-sm font-semibold text-blue-800 mb-1">Notes</h6>
                                <p className="text-sm text-blue-900 bg-white rounded-lg p-2 border border-blue-200">
                                  {employee.handoverDetails.notes}
                                </p>
                              </div>
                            )}
                            
                            {employee.handoverDetails.completedAt && (
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-blue-800">Completed:</span>
                                  <span className="text-sm text-blue-900">{formatDate(employee.handoverDetails.completedAt)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
                            <i className="fas fa-handshake text-2xl text-blue-300 mb-2"></i>
                            <p className="text-blue-600 font-medium text-sm">No Handover Details Available</p>
                            <p className="text-blue-500 text-xs">
                              Handover details will appear here once completed.
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                  {employee.notes && (
                    <tr className="bg-white">
                      <td className="px-6 py-4 font-semibold text-gray-700">Notes:</td>
                      <td className="px-6 py-4 text-gray-900">{employee.notes}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assigned Assets Section */}
          <div>
            <h6 className="text-gray-500 font-semibold mb-4">Assigned Assets ({assignedAssets.length})</h6>
            {assignedAssets.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <i className="fas fa-boxes text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No assets assigned to this employee.</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Asset ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assignedAssets.map((asset) => (
                      <tr key={asset.id} className="bg-white hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {asset.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asset.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-600 text-white">
                            {asset.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            asset.status === 'Active' ? 'bg-green-100 text-green-800' :
                            asset.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            asset.status === 'Retired' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {asset.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${asset.value || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(asset.purchaseDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white text-gray-900 border-t border-gray-200 p-6 flex justify-end">
          <button
            type="button"
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onHide}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;
