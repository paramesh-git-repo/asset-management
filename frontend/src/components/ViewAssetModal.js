import React, { useState, useEffect } from 'react';

const ViewAssetModal = ({ show, onHide, asset, employees, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAsset, setEditedAsset] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize edited asset data when asset changes
  useEffect(() => {
    if (asset) {
      setEditedAsset({ ...asset });
    }
  }, [asset]);

  const handleInputChange = (field, value) => {
    setEditedAsset(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = () => {
    // Validate Asset ID
    const newErrors = {};
    if (!editedAsset.assetId || !editedAsset.assetId.trim()) {
      newErrors.assetId = 'Asset ID is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call the update function
    if (onUpdate) {
      onUpdate(editedAsset);
    }
    
    setIsEditing(false);
    setErrors({});
  };

  const handleCancel = () => {
    setEditedAsset({ ...asset });
    setIsEditing(false);
    setErrors({});
  };

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
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Repaired': return 'bg-blue-100 text-blue-800';
      case 'Available': return 'bg-purple-100 text-purple-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Active': return 'fas fa-check-circle text-green-600';
      case 'Maintenance': return 'fas fa-tools text-yellow-600';
      case 'Repaired': return 'fas fa-wrench text-blue-600';
      case 'Available': return 'fas fa-hand-holding text-purple-600';
      case 'Lost': return 'fas fa-exclamation-triangle text-red-600';
      default: return 'fas fa-question-circle text-gray-600';
    }
  };

  if (!show || !asset) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-50 text-gray-900 rounded-t-2xl border-none p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-white mr-4">
              <i className="fas fa-boxes"></i>
            </div>
            <div>
              <h5 className="text-xl font-semibold mb-0">Asset Details</h5>
              <p className="text-sm text-gray-600 mt-1">View complete asset information</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                onClick={() => setIsEditing(true)}
              >
                <i className="fas fa-edit"></i>
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                  onClick={handleSave}
                >
                  <i className="fas fa-save"></i>
                  Save
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                  onClick={handleCancel}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            )}
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              onClick={onHide}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="text-gray-900 bg-white p-6">
          {/* Asset Header */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{asset.name}</h3>
                <p className="text-gray-600">Asset ID: {isEditing ? (
                  <input
                    type="text"
                    value={editedAsset.assetId || editedAsset.id || ''}
                    onChange={(e) => handleInputChange('assetId', e.target.value)}
                    className={`inline-block ml-2 px-2 py-1 border rounded text-sm font-mono ${
                      errors.assetId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter Asset ID"
                  />
                ) : (asset.assetId || asset.id)}</p>
                {errors.assetId && (
                  <p className="text-red-500 text-sm mt-1">{errors.assetId}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusClass(asset.status)}`}>
                  <i className={`${getStatusIcon(asset.status)} mr-2`}></i>
                  {asset.status}
                </span>
              </div>
            </div>
          </div>

          {/* Asset Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                <i className="fas fa-info-circle mr-2 text-gray-600"></i>
                Basic Information
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                <p className="text-gray-900 font-medium">{asset.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset ID</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedAsset.assetId || editedAsset.id || ''}
                    onChange={(e) => handleInputChange('assetId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg font-mono ${
                      errors.assetId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter Asset ID"
                  />
                ) : (
                  <p className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{asset.assetId || asset.id}</p>
                )}
                {errors.assetId && (
                  <p className="text-red-500 text-sm mt-1">{errors.assetId}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-600 text-white">
                  {asset.category}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(asset.status)}`}>
                  <i className={`${getStatusIcon(asset.status)} mr-1`}></i>
                  {asset.status}
                </span>
              </div>
            </div>

            {/* Assignment & Financial Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                <i className="fas fa-user-tie mr-2 text-gray-600"></i>
                Assignment & Financial
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                {asset.assignedTo ? (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold mr-3">
                      {asset.assignedTo.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{asset.assignedTo}</p>
                      {employees.find(emp => emp.name === asset.assignedTo) && (
                        <p className="text-sm text-gray-600">
                          {employees.find(emp => emp.name === asset.assignedTo).department} • {employees.find(emp => emp.name === asset.assignedTo).role}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Unassigned</p>
                )}
              </div>
              
              {asset.assignedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Date</label>
                  <p className="text-gray-900">{formatDate(asset.assignedDate)}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <p className="text-gray-900">{formatDate(asset.purchaseDate)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Value</label>
                <p className="text-gray-900 font-semibold text-lg">
                  ${asset.value ? parseFloat(asset.value).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {asset.description && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                <i className="fas fa-align-left mr-2 text-gray-600"></i>
                Description
              </h4>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-700 leading-relaxed">{asset.description}</p>
              </div>
            </div>
          )}

          {/* Asset History */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              <i className="fas fa-history mr-2 text-gray-600"></i>
              Asset History
            </h4>
            {asset.history && asset.history.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-xl max-h-80 overflow-y-auto">
                <div className="space-y-3">
                  {asset.history.slice().reverse().map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-history text-blue-600 text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h6 className="text-sm font-medium text-gray-900">{entry.action}</h6>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{entry.details}</p>
                        {entry.oldValue && entry.newValue && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="line-through">{entry.oldValue}</span>
                            <i className="fas fa-arrow-right mx-2 text-gray-400"></i>
                            <span className="text-green-600 font-medium">{entry.newValue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center text-gray-500">
                  <i className="fas fa-info-circle mr-2"></i>
                  <p className="text-sm">No history available for this asset.</p>
                </div>
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

export default ViewAssetModal;
