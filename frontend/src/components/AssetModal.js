import React, { useState, useEffect } from 'react';

const AssetModal = ({ show, onHide, onSave, asset, categories, statuses, employees = [] }) => {
  const [formData, setFormData] = useState({
    assetId: '',
    name: '',
    category: '',
    subCategory: '',
    status: 'Active',
    location: '',
    assignedTo: '',
    description: '',
    value: '',
    history: []
  });
  const [errors, setErrors] = useState({});
  
  // Custom dropdown state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAssignedToDropdown, setShowAssignedToDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  
  // Search state for assigned to dropdown
  const [assignedToSearch, setAssignedToSearch] = useState('');
  
  // Custom sub categories from settings
  const [customSubCategories, setCustomSubCategories] = useState([]);

  // Location options
  const locationOptions = [
    'Axess Technology, Tidel',
    'Axess Technology, Velachery',
    'V-Accel AI Dynamics Pvt Ltd'
  ];

  // IT Equipment sub-categories
  const itEquipmentSubCategories = [
    'Laptop',
    'Desktop Computer',
    'Monitor',
    'Keyboard',
    'Mouse',
    'Printer',
    'Scanner',
    'Router',
    'Switch',
    'Server',
    'Tablet',
    'Smartphone',
    'Projector',
    'Headphones',
    'Webcam',
    'Other'
  ];

  // Get location icon with color
  const getLocationIcon = (location) => {
    switch (location) {
      case 'Axess Technology, Tidel':
        return { icon: 'fas fa-building', color: 'text-blue-600' };
      case 'Axess Technology, Velachery':
        return { icon: 'fas fa-building', color: 'text-green-600' };
      case 'V-Accel AI Dynamics Pvt Ltd':
        return { icon: 'fas fa-building', color: 'text-purple-600' };
      default:
        return { icon: 'fas fa-map-marker-alt', color: 'text-gray-600' };
    }
  };

  // Get available sub categories based on selected category
  const getAvailableSubCategories = () => {
    if (!formData.category) return [];
    
    // Get custom sub categories for the selected category
    const customSubs = customSubCategories
      .filter(sub => sub.parentCategory === formData.category)
      .map(sub => ({ name: sub.name, icon: sub.icon, color: sub.color }));
    
    // For IT Equipment, combine custom sub categories with default ones
    if (formData.category === 'IT Equipment') {
      const defaultSubs = itEquipmentSubCategories.map(name => ({ 
        name, 
        icon: getSubCategoryIcon(name), 
        color: getSubCategoryColor(name) 
      }));
      return [...defaultSubs, ...customSubs];
    }
    
    // For other categories, only show custom sub categories
    return customSubs;
  };

  // Get icon based on sub category name
  const getSubCategoryIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('laptop')) return 'fas fa-laptop';
    if (lowerName.includes('desktop')) return 'fas fa-desktop';
    if (lowerName.includes('monitor') || lowerName.includes('screen')) return 'fas fa-tv';
    if (lowerName.includes('keyboard')) return 'fas fa-keyboard';
    if (lowerName.includes('mouse')) return 'fas fa-mouse';
    if (lowerName.includes('printer')) return 'fas fa-print';
    if (lowerName.includes('scanner')) return 'fas fa-scanner';
    if (lowerName.includes('router') || lowerName.includes('network')) return 'fas fa-network-wired';
    if (lowerName.includes('switch')) return 'fas fa-ethernet';
    if (lowerName.includes('server')) return 'fas fa-server';
    if (lowerName.includes('tablet')) return 'fas fa-tablet-alt';
    if (lowerName.includes('phone') || lowerName.includes('smartphone')) return 'fas fa-mobile-alt';
    if (lowerName.includes('projector')) return 'fas fa-video';
    if (lowerName.includes('headphone') || lowerName.includes('headset')) return 'fas fa-headphones';
    if (lowerName.includes('webcam') || lowerName.includes('camera')) return 'fas fa-video';
    if (lowerName.includes('chair')) return 'fas fa-chair';
    if (lowerName.includes('desk') || lowerName.includes('table')) return 'fas fa-table';
    if (lowerName.includes('vehicle') || lowerName.includes('car')) return 'fas fa-car';
    if (lowerName.includes('truck')) return 'fas fa-truck';
    if (lowerName.includes('machine') || lowerName.includes('machinery')) return 'fas fa-cogs';
    if (lowerName.includes('tool')) return 'fas fa-tools';
    if (lowerName.includes('equipment')) return 'fas fa-wrench';
    return 'fas fa-tag'; // Default icon
  };

  // Get color based on sub category name
  const getSubCategoryColor = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('laptop') || lowerName.includes('desktop') || lowerName.includes('monitor')) return 'text-blue-600';
    if (lowerName.includes('chair') || lowerName.includes('desk') || lowerName.includes('table')) return 'text-green-600';
    if (lowerName.includes('vehicle') || lowerName.includes('car') || lowerName.includes('truck')) return 'text-red-600';
    if (lowerName.includes('machine') || lowerName.includes('machinery') || lowerName.includes('tool')) return 'text-orange-600';
    if (lowerName.includes('printer') || lowerName.includes('scanner')) return 'text-purple-600';
    return 'text-gray-600'; // Default color
  };

  // Reset form when modal opens/closes or asset changes
  useEffect(() => {
    if (show) {
      if (asset) {
        // Editing existing asset
        setFormData({
          assetId: asset.assetId || '',
          name: asset.name || '',
          category: asset.category || '',
          subCategory: asset.subCategory || '',
          status: asset.status || 'Active',
          location: asset.location || '',
          assignedTo: asset.assignedTo || '',
          description: asset.description || '',
          value: asset.value || '',
          history: asset.history || []
        });
      } else {
        // Adding new asset - start with empty asset ID for manual input
        setFormData({
          assetId: '',
          name: '',
          category: '',
          subCategory: '',
          status: 'Active',
          location: '',
          assignedTo: '',
          description: '',
          value: '',
          history: []
        });
      }
      setErrors({});
    }
  }, [show, asset]);

  // Load custom sub categories from settings
  useEffect(() => {
    const assetSettings = localStorage.getItem('assetPageSettings');
    if (assetSettings) {
      try {
        const settings = JSON.parse(assetSettings);
        if (settings.customSubCategories) {
          setCustomSubCategories(settings.customSubCategories);
        }
      } catch (error) {
        console.error('Error loading custom sub categories:', error);
      }
    }
  }, [show]); // Reload when modal opens

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const oldValue = formData[name];
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear subCategory when category changes
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        subCategory: ''
      }));
    }
    
    // Add history entry for significant field changes
    if (oldValue !== value && (name === 'name' || name === 'description')) {
      if (name === 'name') {
        addHistoryEntry('Name Updated', `Asset name changed from "${oldValue || 'None'}" to "${value}"`, oldValue, value);
      } else if (name === 'description') {
        addHistoryEntry('Description Updated', 'Asset description was modified', oldValue, value);
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.assetId.trim()) {
      newErrors.assetId = 'Asset ID is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Asset name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    // Validate value if provided
    if (formData.value && formData.value.trim()) {
      const value = parseFloat(formData.value);
      if (isNaN(value) || value < 0) {
        newErrors.value = 'Asset value must be a valid positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Ensure required fields are provided
      const assetDataWithId = {
        ...formData,
        assetId: formData.assetId.trim() || generateAssetId(), // Use user input or generate if empty
        location: formData.location || 'Unspecified Location',
        // Automatically set assigned date if asset is assigned to an employee
        assignedDate: formData.assignedTo ? new Date().toISOString() : null,
        // Set updatedAt to current timestamp for sorting
        updatedAt: new Date().toISOString()
      };
      
      // Add history entry for new asset creation
      if (!asset) {
        addHistoryEntry('Asset Created', `Asset "${formData.name}" was created`);
      }
      
      console.log('🔍 Submitting asset with data:', assetDataWithId);
      console.log('🔍 Asset ID value:', assetDataWithId.assetId);
      console.log('🔍 Location value:', assetDataWithId.location);
      console.log('🔍 Assigned Date value:', assetDataWithId.assignedDate);
      console.log('🔍 Full formData:', formData);
      onSave(assetDataWithId);
    }
  };

  // Generate unique asset ID
  const generateAssetId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `AST${timestamp}${random}`;
  };



  const handleBackdropClick = (e) => {
    // Only close if clicking on the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      onHide();
    }
    // Don't close dropdown when clicking on modal content
  };
  
  // Handle category selection from custom dropdown
  const handleCategorySelect = (categoryValue) => {
    const oldValue = formData.category;
    setFormData(prev => ({
      ...prev,
      category: categoryValue,
      subCategory: '' // Clear subCategory when category changes
    }));
    setShowCategoryDropdown(false);
    
    // Add history entry if category changed
    if (oldValue !== categoryValue) {
      addHistoryEntry('Category Changed', `Category updated from "${oldValue || 'None'}" to "${categoryValue}"`, oldValue, categoryValue);
    }
    
    // Clear error when user selects
    if (errors.category) {
      setErrors(prev => ({
        ...prev,
        category: ''
      }));
    }
  };

  // Handle sub-category selection from custom dropdown
  const handleSubCategorySelect = (subCategoryValue) => {
    setFormData(prev => ({
      ...prev,
      subCategory: subCategoryValue
    }));
    setShowSubCategoryDropdown(false);
  };
  
  // Handle status selection from custom dropdown
  const handleStatusSelect = (statusValue) => {
    const oldValue = formData.status;
    setFormData(prev => ({
      ...prev,
      status: statusValue
    }));
    setShowStatusDropdown(false);
    
    // Add history entry if status changed
    if (oldValue !== statusValue) {
      addHistoryEntry('Status Changed', `Status updated from "${oldValue || 'None'}" to "${statusValue}"`, oldValue, statusValue);
    }
    
    // Clear error when user selects
    if (errors.status) {
      setErrors(prev => ({
        ...prev,
        status: ''
      }));
    }
  };
  
  // Handle location selection from custom dropdown
  const handleLocationSelect = (locationValue) => {
    const oldValue = formData.location;
    setFormData(prev => ({
      ...prev,
      location: locationValue
    }));
    setShowLocationDropdown(false);
    
    // Add history entry if location changed
    if (oldValue !== locationValue) {
      addHistoryEntry('Location Changed', `Location updated from "${oldValue || 'None'}" to "${locationValue}"`, oldValue, locationValue);
    }
  };
  
  // Handle assigned to selection from custom dropdown
  const handleAssignedToSelect = (employeeName) => {
    const oldValue = formData.assignedTo;
    setFormData(prev => ({
      ...prev,
      assignedTo: employeeName
      // assignedDate will be set automatically when saving
    }));
    setShowAssignedToDropdown(false);
    setAssignedToSearch(''); // Clear search when selection is made
    
    // Add history entry if assignment changed
    if (oldValue !== employeeName) {
      if (employeeName) {
        addHistoryEntry('Asset Assigned', `Asset assigned to ${employeeName}`, oldValue, employeeName);
      } else {
        addHistoryEntry('Asset Unassigned', `Asset unassigned from ${oldValue}`, oldValue, 'Unassigned');
      }
    }
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(employee => {
    if (!assignedToSearch) return true;
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    return fullName.includes(assignedToSearch.toLowerCase());
  });
  
  // Handle click outside dropdown
  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  // Clear search when dropdown is closed
  const handleAssignedToDropdownToggle = () => {
    setShowAssignedToDropdown(!showAssignedToDropdown);
    if (showAssignedToDropdown) {
      setAssignedToSearch(''); // Clear search when closing
    }
  };
  
  // Add history entry
  const addHistoryEntry = (action, details, oldValue = null, newValue = null) => {
    const historyEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action: action,
      details: details,
      oldValue: oldValue,
      newValue: newValue
    };
    
    setFormData(prev => ({
      ...prev,
      history: [...(prev.history || []), historyEntry]
    }));
  };
  
  // Get status icon with color
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return { icon: 'fas fa-check-circle', color: 'text-green-600' };
      case 'Inactive':
        return { icon: 'fas fa-times-circle', color: 'text-red-600' };
      case 'Maintenance':
        return { icon: 'fas fa-tools', color: 'text-yellow-600' };
      case 'Repaired':
        return { icon: 'fas fa-wrench', color: 'text-blue-600' };
      case 'Available':
        return { icon: 'fas fa-hand-holding', color: 'text-purple-600' };
      case 'Lost':
        return { icon: 'fas fa-exclamation-triangle', color: 'text-red-600' };
      default:
        return { icon: 'fas fa-circle', color: 'text-gray-600' };
    }
  };
  
  // Get category icon with color
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'IT Equipment':
        return { icon: 'fas fa-desktop', color: 'text-blue-600' };
      case 'Office Furniture':
        return { icon: 'fas fa-couch', color: 'text-purple-600' };
      case 'Vehicles':
        return { icon: 'fas fa-car', color: 'text-green-600' };
      case 'Machinery':
        return { icon: 'fas fa-cogs', color: 'text-orange-600' };
      case 'Tools':
        return { icon: 'fas fa-wrench', color: 'text-red-600' };
      case 'Electronics':
        return { icon: 'fas fa-laptop', color: 'text-indigo-600' };
      case 'Software':
        return { icon: 'fas fa-code', color: 'text-pink-600' };
      default:
        return { icon: 'fas fa-box', color: 'text-gray-600' };
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close category dropdown
      if (showCategoryDropdown) {
        const dropdown = document.querySelector('.category-dropdown');
        const button = document.querySelector('.category-button');
        if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
          setShowCategoryDropdown(false);
        }
      }
      
      // Close sub-category dropdown
      if (showSubCategoryDropdown) {
        const dropdown = document.querySelector('.subcategory-dropdown');
        const button = document.querySelector('.subcategory-button');
        if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
          setShowSubCategoryDropdown(false);
        }
      }
      
      // Close status dropdown
      if (showStatusDropdown) {
        const dropdown = document.querySelector('.status-dropdown');
        const button = document.querySelector('.status-button');
        if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
          setShowStatusDropdown(false);
        }
      }
      
      // Close assigned to dropdown
      if (showAssignedToDropdown) {
        const dropdown = document.querySelector('.assigned-to-dropdown');
        const button = document.querySelector('.assigned-to-button');
        if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
          setShowAssignedToDropdown(false);
        }
      }
      
      // Close location dropdown
      if (showLocationDropdown) {
        const dropdown = document.querySelector('.location-dropdown');
        const button = document.querySelector('.location-button');
        if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
          setShowLocationDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown, showSubCategoryDropdown, showStatusDropdown, showAssignedToDropdown, showLocationDropdown]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-50 text-gray-900 rounded-t-2xl border-none p-6 border-b border-gray-200 flex justify-between items-center">
          <h5 className="text-xl font-semibold mb-0">
            {asset ? 'Edit Asset' : 'Add New Asset'}
          </h5>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            onClick={onHide}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="text-gray-900 bg-white p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset ID *
                </label>
                <input
                  type="text"
                  name="assetId"
                  value={formData.assetId}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border px-4 py-3 pl-12 transition-all duration-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/50 ${
                    errors.assetId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Asset ID"
                />
                {errors.assetId && (
                  <div className="text-red-500 text-sm mt-1">{errors.assetId}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter asset name"
                />
                {errors.name && (
                  <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                )}
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className={`category-button w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onClick={() => {
                      setShowCategoryDropdown(!showCategoryDropdown);
                    }}
                  >
                    <span className={formData.category ? 'text-gray-900' : 'text-gray-500'}>
                      {formData.category || 'Select Category'}
                    </span>
                    <i className={`fas fa-chevron-down transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`}></i>
                  </button>
                  
                  {showCategoryDropdown && (
                    <div 
                      className="category-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      onClick={handleDropdownClick}
                      style={{ zIndex: 9999 }}
                    >
                      <ul className="py-1">
                        {categories.map((category, index) => {
                          // Check if it's a custom category with icon and color
                          if (category.icon && category.color) {
                            return (
                              <li key={`custom-category-${category.id || category.name}-${index}`}>
                                <button
                                  type="button"
                                  onClick={() => handleCategorySelect(category.value || category.name)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                                >
                                  <i className={`${category.icon} ${category.color} w-4`}></i>
                                  <span className="text-gray-900">{category.value || category.name}</span>
                                </button>
                              </li>
                            );
                          } else {
                            // Default category
                            const categoryIcon = getCategoryIcon(category.value);
                            return (
                              <li key={`default-category-${category.value}-${index}`}>
                                <button
                                  type="button"
                                  onClick={() => handleCategorySelect(category.value)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                                >
                                  <i className={`${categoryIcon.icon} ${categoryIcon.color} w-4`}></i>
                                  <span className="text-gray-900">{category.value}</span>
                                </button>
                              </li>
                            );
                          }
                        })}
                      </ul>
                    </div>
                  )}
                </div>
                {errors.category && (
                  <div className="text-red-500 text-sm mt-1">{errors.category}</div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-Category
                </label>
                {formData.category && getAvailableSubCategories().length > 0 ? (
                  <div className="relative">
                    <button
                      type="button"
                      className={`subcategory-button w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between ${
                        errors.subCategory ? 'border-red-500' : 'border-gray-300'
                      }`}
                      onClick={() => {
                        setShowSubCategoryDropdown(!showSubCategoryDropdown);
                      }}
                    >
                      <span className={formData.subCategory ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.subCategory || 'Select Sub-Category'}
                      </span>
                      <i className={`fas fa-chevron-down transition-transform duration-200 ${showSubCategoryDropdown ? 'rotate-180' : ''}`}></i>
                    </button>
                    
                    {showSubCategoryDropdown && (
                      <div 
                        className="subcategory-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        style={{ zIndex: 9999 }}
                      >
                        <ul className="py-1">
                          {getAvailableSubCategories().map((subCategory, index) => (
                            <li key={`subcategory-${subCategory.name}-${index}`}>
                              <button
                                type="button"
                                onClick={() => handleSubCategorySelect(subCategory.name)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center transition-colors duration-200"
                              >
                                <i className={`${subCategory.icon} ${subCategory.color} mr-3 w-4`}></i>
                                <span className="text-gray-900">{subCategory.name}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 ${
                      errors.subCategory ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={formData.category ? "No sub-categories available. Enter manually." : "Select a category first"}
                    disabled={!formData.category}
                  />
                )}
                {errors.subCategory && (
                  <div className="text-red-500 text-sm mt-1">{errors.subCategory}</div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className={`status-button w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between ${
                      errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onClick={() => {
                      setShowStatusDropdown(!showStatusDropdown);
                    }}
                  >
                    <span className={formData.status ? 'text-gray-900' : 'text-gray-500'}>
                      {formData.status || 'Select Status'}
                    </span>
                    <i className={`fas fa-chevron-down transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`}></i>
                  </button>
                  
                  {showStatusDropdown && (
                    <div 
                      className="status-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      onClick={handleDropdownClick}
                      style={{ zIndex: 9999 }}
                    >
                      <ul className="py-1">
                        {statuses.map((status, index) => {
                          // Check if it's a custom status object
                          if (typeof status === 'object' && status.icon && status.color) {
                            return (
                              <li key={`custom-status-${status.id || status.name}-${index}`}>
                                <button
                                  type="button"
                                  onClick={() => handleStatusSelect(status.name)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                                >
                                  <i className={`${status.icon} ${status.color} w-4`}></i>
                                  <span className="text-gray-900">{status.name}</span>
                                </button>
                              </li>
                            );
                          } else {
                            // Default status string
                            const statusIcon = getStatusIcon(status);
                            return (
                              <li key={`default-status-${status}-${index}`}>
                                <button
                                  type="button"
                                  onClick={() => handleStatusSelect(status)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                                >
                                  <i className={`${statusIcon.icon} ${statusIcon.color} w-4`}></i>
                                  <span className="text-gray-900">{status}</span>
                                </button>
                              </li>
                            );
                          }
                        })}
                      </ul>
                    </div>
                  )}
                </div>
                {errors.status && (
                  <div className="text-red-500 text-sm mt-1">{errors.status}</div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    className={`location-button w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <span className={formData.location ? 'text-gray-900' : 'text-gray-500'}>
                      {formData.location || 'Select location'}
                    </span>
                    <i className={`fas fa-chevron-down transition-transform duration-200 ${showLocationDropdown ? 'rotate-180' : ''}`}></i>
                  </button>
                  
                  {showLocationDropdown && (
                    <div 
                      className="location-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                      onClick={handleDropdownClick}
                      style={{ zIndex: 9999 }}
                    >
                      <ul className="py-2">
                        {locationOptions.map((location, index) => {
                          const locationIcon = getLocationIcon(location);
                          return (
                            <li key={`location-${index}`}>
                              <button
                                type="button"
                                onClick={() => handleLocationSelect(location)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                              >
                                <i className={`${locationIcon.icon} ${locationIcon.color} w-4`}></i>
                                <span className="text-gray-900">{location}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
                {errors.location && (
                  <div className="text-red-500 text-sm mt-1">{errors.location}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Value (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border px-4 py-3 pl-10 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 ${
                      errors.value ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter asset value in rupees"
                    min="0"
                    step="1"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 text-sm">₹</span>
                  </div>
                </div>
                {errors.value && (
                  <div className="text-red-500 text-sm mt-1">{errors.value}</div>
                )}
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className={`assigned-to-button w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between`}
                    onClick={handleAssignedToDropdownToggle}
                  >
                    <span className={formData.assignedTo ? 'text-gray-900' : 'text-gray-500'}>
                      {formData.assignedTo || 'Unassigned'}
                    </span>
                    <i className={`fas fa-chevron-down transition-transform duration-200 ${showAssignedToDropdown ? 'rotate-180' : ''}`}></i>
                  </button>
                  
                  {showAssignedToDropdown && (
                    <div 
                      className="assigned-to-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-hidden"
                      onClick={handleDropdownClick}
                      style={{ zIndex: 9999 }}
                    >
                      {/* Search Bar */}
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <input
                            type="text"
                            value={assignedToSearch}
                            onChange={(e) => setAssignedToSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-3 py-2 pl-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                            <i className="fas fa-search text-gray-400 text-sm"></i>
                          </div>
                        </div>
                      </div>
                      
                      {/* Employee List */}
                      <div className="max-h-48 overflow-y-auto">
                        <ul className="py-1">
                          <li>
                            <button
                              type="button"
                              onClick={() => handleAssignedToSelect('')}
                              className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                            >
                              <i className="fas fa-user-slash text-red-500 w-4"></i>
                              <span className="text-gray-900">Unassigned</span>
                            </button>
                          </li>
                          {filteredEmployees
                            .filter(emp => emp.status === 'Active')
                            .map((employee, index) => (
                              <li key={employee._id || employee.id || `employee-${index}`}>
                                <button
                                  type="button"
                                  onClick={() => handleAssignedToSelect(employee.fullName || `${employee.firstName} ${employee.lastName}`)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                                >
                                  <i className="fas fa-user text-blue-600 w-4"></i>
                                  <span className="text-gray-900">{employee.fullName || `${employee.firstName} ${employee.lastName}`} ({employee.department})</span>
                                </button>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>


              







            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                placeholder="Enter asset description"
              />
            </div>

            {/* Asset History Section */}
            {asset && formData.history && formData.history.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Asset History
                </label>
                <div className="bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-3">
                    {formData.history.slice().reverse().map((entry) => (
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
              </div>
            )}
          </div>
          
          <div className="bg-white text-gray-900 border-t border-gray-200 p-6 flex justify-end gap-3">
            <button
              type="button"
              className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={onHide}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border-none bg-gray-800 text-white shadow-sm hover:bg-gray-900 hover:transform hover:-translate-y-1 hover:shadow-md"
            >
              {asset ? 'Update Asset' : 'Save Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;
