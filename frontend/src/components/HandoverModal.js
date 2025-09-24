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
    }
  }, [show, employee]);

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

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
          <div className="p-6 space-y-6">
            {/* Handover Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Handover To *
              </label>
              <select
                name="handoverTo"
                value={formData.handoverTo}
                onChange={handleInputChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/50 ${
                  errors.handoverTo ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select employee to handover to</option>
                {employees
                  .filter(emp => emp.id !== employee?.id && emp.status === 'Active')
                  .map(emp => (
                    <option key={emp.id} value={emp.name || `${emp.firstName} ${emp.lastName}`}>
                      {emp.name || `${emp.firstName} ${emp.lastName}`} ({emp.employeeId})
                    </option>
                  ))}
              </select>
              {errors.handoverTo && (
                <div className="text-red-500 text-sm mt-1">{errors.handoverTo}</div>
              )}
            </div>

            {/* Handover Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Handover Reason *
              </label>
              <select
                name="handoverReason"
                value={formData.handoverReason}
                onChange={handleInputChange}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/50 ${
                  errors.handoverReason ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select reason</option>
                <option value="Resignation">Resignation</option>
                <option value="Termination">Termination</option>
                <option value="Retirement">Retirement</option>
                <option value="Transfer">Transfer</option>
                <option value="Other">Other</option>
              </select>
              {errors.handoverReason && (
                <div className="text-red-500 text-sm mt-1">{errors.handoverReason}</div>
              )}
            </div>

            {/* Assets to Return */}
            {employeeAssets.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Handover Status
              </label>
              <select
                name="handoverStatus"
                value={formData.handoverStatus}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/50"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Partial">Partial</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
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
