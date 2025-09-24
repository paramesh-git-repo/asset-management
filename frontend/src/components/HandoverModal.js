import React, { useState, useEffect } from 'react';

const HandoverModal = ({ show, onHide, onSave, employee, employees = [], assets = [] }) => {
  const [formData, setFormData] = useState({
    handoverDate: '',
    handoverTo: '',
    handoverReason: '',
    assetsToReturn: [],
    notes: '',
    handoverStatus: 'Pending'
  });
  const [errors, setErrors] = useState({});
  const [selectedAssets, setSelectedAssets] = useState([]);
  
  // Dropdown states
  const [showHandoverToDropdown, setShowHandoverToDropdown] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Reset form when modal opens/closes or employee changes
  useEffect(() => {
    if (show && employee) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        handoverDate: today,
        handoverTo: '',
        handoverReason: '',
        assetsToReturn: [],
        notes: '',
        handoverStatus: 'Pending'
      });
      setSelectedAssets([]);
      setErrors({});
      setShowHandoverToDropdown(false);
      setShowReasonDropdown(false);
      setShowStatusDropdown(false);
    }
  }, [show, employee]);

  // Helper functions for dropdowns
  const getReasonIcon = (reason) => {
    switch (reason) {
      case 'Resignation': return 'fas fa-sign-out-alt text-blue-600';
      case 'Termination': return 'fas fa-user-times text-red-600';
      case 'Retirement': return 'fas fa-gift text-purple-600';
      case 'Transfer': return 'fas fa-exchange-alt text-green-600';
      case 'Other': return 'fas fa-question-circle text-gray-600';
      default: return 'fas fa-question-circle text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'fas fa-clock text-yellow-600';
      case 'In Progress': return 'fas fa-spinner text-blue-600';
      case 'Completed': return 'fas fa-check-circle text-green-600';
      case 'Partial': return 'fas fa-exclamation-triangle text-orange-600';
      default: return 'fas fa-clock text-yellow-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'Partial': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  // Filter employees for handover to dropdown
  const filteredEmployees = employees.filter(emp => 
    emp.id !== employee?.id && 
    emp.status === 'Active'
  );

  // Get assets assigned to the employee
  const getEmployeeAssets = () => {
    if (!employee) return [];
    return assets.filter(asset => 
      asset.assignedTo === employee.name || 
      asset.assignedTo === `${employee.firstName} ${employee.lastName}` ||
      asset.assignedTo === employee.employeeId
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAssetSelection = (assetId, isSelected) => {
    if (isSelected) {
      setSelectedAssets(prev => [...prev, assetId]);
    } else {
      setSelectedAssets(prev => prev.filter(id => id !== assetId));
    }
  };

  // Dropdown selection handlers
  const handleHandoverToSelect = (employeeName) => {
    setFormData(prev => ({ ...prev, handoverTo: employeeName }));
    setShowHandoverToDropdown(false);
    if (errors.handoverTo) {
      setErrors(prev => ({ ...prev, handoverTo: '' }));
    }
  };

  const handleReasonSelect = (reason) => {
    setFormData(prev => ({ ...prev, handoverReason: reason }));
    setShowReasonDropdown(false);
    if (errors.handoverReason) {
      setErrors(prev => ({ ...prev, handoverReason: '' }));
    }
  };

  const handleStatusSelect = (status) => {
    setFormData(prev => ({ ...prev, handoverStatus: status }));
    setShowStatusDropdown(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.handoverDate.trim()) {
      newErrors.handoverDate = 'Handover date is required';
    }

    if (!formData.handoverTo.trim()) {
      newErrors.handoverTo = 'Handover to is required';
    }

    if (!formData.handoverReason.trim()) {
      newErrors.handoverReason = 'Handover reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const handoverData = {
        ...formData,
        assetsToReturn: selectedAssets,
        employeeId: employee.id,
        employeeName: employee.name || `${employee.firstName} ${employee.lastName}`,
        handoverDate: new Date(formData.handoverDate).toISOString()
      };
      
      onSave(handoverData);
    }
  };

  const employeeAssets = getEmployeeAssets();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any dropdown
      const isHandoverToDropdown = event.target.closest('[data-dropdown="handover-to"]');
      const isReasonDropdown = event.target.closest('[data-dropdown="reason"]');
      const isStatusDropdown = event.target.closest('[data-dropdown="status"]');
      
      if (!isHandoverToDropdown && !isReasonDropdown && !isStatusDropdown) {
        setShowHandoverToDropdown(false);
        setShowReasonDropdown(false);
        setShowStatusDropdown(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Employee Handover Details</h2>
            <p className="text-gray-600 mt-1">
              {employee ? `${employee.firstName} ${employee.lastName} (${employee.employeeId})` : ''}
            </p>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
            onClick={onHide}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-5">
            {/* Handover Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Handover Date *
              </label>
              <input
                type="date"
                name="handoverDate"
                value={formData.handoverDate}
                onChange={handleInputChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/50 ${
                  errors.handoverDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.handoverDate && (
                <div className="text-red-500 text-sm mt-1">{errors.handoverDate}</div>
              )}
            </div>

            {/* Handover To */}
            <div className="relative" data-dropdown="handover-to">
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                Handover To *
              </label>
              <div className="relative">
                <button
                  type="button"
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between ${
                    errors.handoverTo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onClick={() => setShowHandoverToDropdown(!showHandoverToDropdown)}
                >
                  <span className={formData.handoverTo ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.handoverTo || 'Select Employee'}
                  </span>
                  <i className={`fas fa-chevron-down transition-transform duration-200 ${showHandoverToDropdown ? 'rotate-180' : ''}`}></i>
                </button>
              </div>
              
              {showHandoverToDropdown && (
                <div 
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  style={{ zIndex: 9999 }}
                >
                  <ul className="py-1">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map(emp => (
                        <li key={emp.id}>
                          <button
                            type="button"
                            onClick={() => handleHandoverToSelect(emp.name || `${emp.firstName} ${emp.lastName}`)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                          >
                            <i className="fas fa-user text-blue-600 w-4"></i>
                            <div>
                              <div className="font-medium text-gray-900">
                                {emp.name || `${emp.firstName} ${emp.lastName}`}
                              </div>
                              <div className="text-sm text-gray-500">{emp.employeeId}</div>
                            </div>
                          </button>
                        </li>
                      ))
                    ) : (
                      <li>
                        <div className="px-4 py-3 text-gray-500 text-center">
                          <i className="fas fa-search text-gray-400 mb-2"></i>
                          <p>No employees found</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {errors.handoverTo && (
                <div className="text-red-500 text-sm mt-1">{errors.handoverTo}</div>
              )}
            </div>

            {/* Handover Reason */}
            <div className="relative" data-dropdown="reason">
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                Handover Reason *
              </label>
              <div className="relative">
                <button
                  type="button"
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between ${
                    errors.handoverReason ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                >
                  <span className={formData.handoverReason ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.handoverReason || 'Select Reason'}
                  </span>
                  <i className={`fas fa-chevron-down transition-transform duration-200 ${showReasonDropdown ? 'rotate-180' : ''}`}></i>
                </button>
              </div>
              
              {showReasonDropdown && (
                <div 
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
                  style={{ zIndex: 9999 }}
                >
                  <ul className="py-1">
                    {['Resignation', 'Termination', 'Retirement', 'Transfer', 'Other'].map(reason => (
                      <li key={reason}>
                        <button
                          type="button"
                          onClick={() => handleReasonSelect(reason)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                        >
                          <i className={`${getReasonIcon(reason)} w-4`}></i>
                          <span className="text-gray-900">{reason}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {errors.handoverReason && (
                <div className="text-red-500 text-sm mt-1">{errors.handoverReason}</div>
              )}
            </div>

            {/* Assets to Return */}
            {employeeAssets.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
                  Assets to Return
                </label>
                <div className="border border-gray-300 rounded-xl p-4 max-h-48 overflow-y-auto">
                  {employeeAssets.map(asset => (
                    <div key={asset.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`asset-${asset.id}`}
                          checked={selectedAssets.includes(asset.id)}
                          onChange={(e) => handleAssetSelection(asset.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <label htmlFor={`asset-${asset.id}`} className="font-medium text-gray-900 cursor-pointer">
                            {asset.name}
                          </label>
                          <p className="text-sm text-gray-500">ID: {asset.assetId} | {asset.category}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        asset.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Select assets that need to be returned during handover
                </p>
              </div>
            )}

            {/* Handover Status */}
            <div className="relative" data-dropdown="status">
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
                Handover Status
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <span className="text-gray-900">{formData.handoverStatus}</span>
                  <i className={`fas fa-chevron-down transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`}></i>
                </button>
              </div>
              
              {showStatusDropdown && (
                <div 
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
                  style={{ zIndex: 9999 }}
                >
                  <ul className="py-1">
                    {['Pending', 'In Progress', 'Completed', 'Partial'].map(status => (
                      <li key={status}>
                        <button
                          type="button"
                          onClick={() => handleStatusSelect(status)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                        >
                          <i className={`${getStatusIcon(status)} w-4`}></i>
                          <span className="text-gray-900">{status}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/50"
                placeholder="Enter any additional handover details, special instructions, or notes..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 p-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onHide}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium flex items-center gap-2"
            >
              <i className="fas fa-handshake"></i>
              Save Handover Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HandoverModal;
