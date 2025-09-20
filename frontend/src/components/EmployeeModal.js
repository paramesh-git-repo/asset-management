import React, { useState, useEffect } from 'react';
import { config } from '../config/config';
import { assetAPI } from '../services/api';

const EmployeeModal = ({ show, onHide, onSave, employee, departments, roles, categories = [], statuses = [], validationErrors = {} }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    hireDate: '',
    status: 'Active',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  
  // Update errors when prop changes (from backend validation)
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    }
  }, [validationErrors]);
  
  // Asset creation form state
  const [assetFormData, setAssetFormData] = useState({
    name: '',
    category: '',
    status: 'Active',
    value: '',
    description: ''
  });
  const [assetErrors, setAssetErrors] = useState({});
  
  // Asset assignment state
  const [availableAssets, setAvailableAssets] = useState([]);
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  
  // Custom dropdown state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showEmployeeStatusDropdown, setShowEmployeeStatusDropdown] = useState(false);
  
  // Handle category selection from custom dropdown
  const handleCategorySelect = (categoryValue) => {
    setAssetFormData(prev => ({
      ...prev,
      category: categoryValue
    }));
    setShowCategoryDropdown(false);
  };
  
  // Handle status selection from custom dropdown
  const handleStatusSelect = (statusValue) => {
    setAssetFormData(prev => ({
      ...prev,
      status: statusValue
    }));
    setShowStatusDropdown(false);
  };
  
  // Handle department selection from custom dropdown
  const handleDepartmentSelect = (departmentValue) => {
    setFormData(prev => ({
      ...prev,
      department: departmentValue
    }));
    setShowDepartmentDropdown(false);
    
    // Clear error when user selects
    if (errors.department) {
      setErrors(prev => ({
        ...prev,
        department: ''
      }));
    }
  };
  
  // Handle position selection from custom dropdown
  const handlePositionSelect = (positionValue) => {
    setFormData(prev => ({
      ...prev,
      position: positionValue
    }));
    setShowPositionDropdown(false);
    
    // Clear error when user selects
    if (errors.position) {
      setErrors(prev => ({
        ...prev,
        position: ''
      }));
    }
  };
  
  // Handle employee status selection from custom dropdown
  const handleEmployeeStatusSelect = (statusValue) => {
    setFormData(prev => ({
      ...prev,
      status: statusValue
    }));
    setShowEmployeeStatusDropdown(false);
    
    // Clear error when user selects
    if (errors.status) {
      setErrors(prev => ({
        ...prev,
        status: ''
      }));
    }
  };
  
  // Handle click outside dropdown
  const handleDropdownClick = (e) => {
    e.stopPropagation();
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
      case 'Retired':
        return { icon: 'fas fa-trash', color: 'text-gray-600' };
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
  
  // Get department icon with color
  const getDepartmentIcon = (department) => {
    switch (department) {
      case 'IT':
        return { icon: 'fas fa-laptop-code', color: 'text-blue-600' };
      case 'HR':
        return { icon: 'fas fa-users', color: 'text-purple-600' };
      case 'Finance':
        return { icon: 'fas fa-chart-line', color: 'text-green-600' };
      case 'Marketing':
        return { icon: 'fas fa-bullhorn', color: 'text-pink-600' };
      case 'Sales':
        return { icon: 'fas fa-handshake', color: 'text-orange-600' };
      case 'Operations':
        return { icon: 'fas fa-cogs', color: 'text-gray-600' };
      case 'Legal':
        return { icon: 'fas fa-gavel', color: 'text-red-600' };
      case 'Engineering':
        return { icon: 'fas fa-code', color: 'text-indigo-600' };
      default:
        return { icon: 'fas fa-building', color: 'text-gray-600' };
    }
  };
  
  // Get role icon with color
  const getRoleIcon = (role) => {
    switch (role) {
      case 'Manager':
        return { icon: 'fas fa-user-tie', color: 'text-blue-600' };
      case 'Developer':
        return { icon: 'fas fa-code', color: 'text-green-600' };
      case 'Designer':
        return { icon: 'fas fa-palette', color: 'text-purple-600' };
      case 'Analyst':
        return { icon: 'fas fa-chart-bar', color: 'text-orange-600' };
      case 'Coordinator':
        return { icon: 'fas fa-tasks', color: 'text-indigo-600' };
      case 'Specialist':
        return { icon: 'fas fa-user-graduate', color: 'text-pink-600' };
      case 'Assistant':
        return { icon: 'fas fa-user', color: 'text-gray-600' };
      case 'Director':
        return { icon: 'fas fa-crown', color: 'text-yellow-600' };
      default:
        return { icon: 'fas fa-user', color: 'text-gray-600' };
    }
  };
  
  // Get employee status icon with color
  const getEmployeeStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return { icon: 'fas fa-check-circle', color: 'text-green-600' };
      case 'Inactive':
        return { icon: 'fas fa-times-circle', color: 'text-red-600' };
      case 'On Leave':
        return { icon: 'fas fa-umbrella-beach', color: 'text-yellow-600' };
      case 'Terminated':
        return { icon: 'fas fa-user-slash', color: 'text-gray-600' };
      default:
        return { icon: 'fas fa-circle', color: 'text-gray-600' };
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
      
      // Close status dropdown
      if (showStatusDropdown) {
        const dropdown = document.querySelector('.status-dropdown');
        const button = document.querySelector('.status-button');
        if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
          setShowStatusDropdown(false);
        }
      }
      
      // Close department dropdown
      if (showDepartmentDropdown) {
        const dropdown = document.querySelector('.department-dropdown');
        const button = document.querySelector('.department-button');
        if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
          setShowDepartmentDropdown(false);
        }
      }
      
      // Close position dropdown
      if (showPositionDropdown) {
        const dropdown = document.querySelector('.position-dropdown');
        const button = document.querySelector('.position-button');
        if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
          setShowPositionDropdown(false);
        }
      }
      
      // Close employee status dropdown
      if (showEmployeeStatusDropdown) {
        const dropdown = document.querySelector('.employee-status-dropdown');
        const button = document.querySelector('.employee-status-button');
        if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
          setShowEmployeeStatusDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown, showStatusDropdown, showDepartmentDropdown, showPositionDropdown, showEmployeeStatusDropdown]);

  // Load assets from API
  useEffect(() => {
    const loadAssets = async () => {
      if (show) {
        try {
          const result = await assetAPI.getAll();
          
          if (result.status === 'success') {
            const assets = result.data;
            const unassignedAssets = assets.filter(asset => !asset.assignedTo || asset.assignedTo === '');
            setAvailableAssets(unassignedAssets);
          } else {
            console.error('Error loading assets:', result.message);
            setAvailableAssets([]);
          }
        } catch (error) {
          console.error('Error loading assets:', error);
          setAvailableAssets([]);
        }
      }
    };

    loadAssets();
  }, [show]);

  // Note: Employee ID will be auto-generated by the backend

  // Reset form when modal opens/closes or employee changes
  useEffect(() => {
    const loadEmployeeData = async () => {
      if (show) {
        if (employee) {
          // Editing existing employee
          setFormData({
            employeeId: employee.employeeId || '',
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            email: employee.email || '',
            department: employee.department || '',
            position: employee.position || '',
            phone: employee.phone || '',
            hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
            status: employee.status || 'Active',
            notes: employee.notes || ''
          });
          
          // Load assigned assets for this employee from API
          try {
            const result = await assetAPI.getAll();
            
            if (result.status === 'success') {
              const assets = result.data;
              const employeeAssets = assets.filter(asset => asset.assignedTo === `${employee.firstName} ${employee.lastName}`.trim());
              setAssignedAssets(employeeAssets);
            } else {
              console.error('Error loading assigned assets:', result.message);
              setAssignedAssets([]);
            }
          } catch (error) {
            console.error('Error loading assigned assets:', error);
            setAssignedAssets([]);
          }
        } else {
          // Adding new employee
          setFormData({
            employeeId: '', // Will be auto-generated by backend
            firstName: '',
            lastName: '',
            email: '',
            department: '',
            position: '',
            phone: '',
            hireDate: '',
            status: 'Active',
            notes: ''
          });
          setAssignedAssets([]);
        }
        setErrors({});
        setAssetErrors({});
        setSelectedAssets([]);
      }
    };

    loadEmployeeData();
  }, [show, employee]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Limit to 10 digits
      const limitedDigits = digitsOnly.slice(0, 10);
      
      setFormData(prev => ({
        ...prev,
        [name]: limitedDigits
      }));
      
      // Real-time validation for phone
      if (limitedDigits.length > 0 && limitedDigits.length !== 10) {
        setErrors(prev => ({
          ...prev,
          phone: 'Phone number must be exactly 10 digits'
        }));
      } else if (limitedDigits.length === 10) {
        setErrors(prev => ({
          ...prev,
          phone: ''
        }));
      }
    } else {
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
    }
  };

  const handleAssetInputChange = (e) => {
    const { name, value } = e.target;
    setAssetFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (assetErrors[name]) {
      setAssetErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Employee ID is only required when editing existing employee
    if (employee && !formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.position) {
      newErrors.position = 'Position is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.hireDate) {
      newErrors.hireDate = 'Hire date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAssetForm = () => {
    const newErrors = {};

    if (!assetFormData.name.trim()) {
      newErrors.name = 'Asset name is required';
    }

    if (!assetFormData.category) {
      newErrors.category = 'Category is required';
    }

    if (!assetFormData.status) {
      newErrors.status = 'Status is required';
    }

    if (assetFormData.value && isNaN(assetFormData.value)) {
      newErrors.value = 'Value must be a number';
    }

    setAssetErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateAssetId = () => {
    const savedAssets = localStorage.getItem('assets');
    if (savedAssets) {
      try {
        const assets = JSON.parse(savedAssets);
        if (assets.length === 0) return 'AST001';
        const maxId = Math.max(...assets.map(a => parseInt(a.id.replace('AST', ''))));
        return `AST${String(maxId + 1).padStart(3, '0')}`;
      } catch (error) {
        return 'AST001';
      }
    }
    return 'AST001';
  };

  const handleAddAsset = () => {
    if (validateAssetForm()) {
      const newAsset = {
        ...assetFormData,
        id: generateAssetId(),
        assignedTo: `${formData.firstName} ${formData.lastName}`.trim() || 'Unassigned',
        value: assetFormData.value ? parseFloat(assetFormData.value) : 0
      };

      // Add to assigned assets list
      setAssignedAssets(prev => [...prev, newAsset]);
      
      // Clear asset form
      setAssetFormData({
        name: '',
        category: '',
        status: 'Active',
        purchaseDate: '',
        value: '',
        description: ''
      });
      setAssetErrors({});
    }
  };

  const handleAssignAsset = (asset) => {
    if (!selectedAssets.find(a => a.id === asset.id)) {
      setSelectedAssets(prev => [...prev, asset]);
    }
  };

  const handleUnassignAsset = (assetId) => {
    setSelectedAssets(prev => prev.filter(a => a.id !== assetId));
  };

  const handleRemoveAssignedAsset = (assetId) => {
    setAssignedAssets(prev => prev.filter(a => a.id !== assetId));
  };

  const clearAssetForm = () => {
    setAssetFormData({
      name: '',
      category: '',
      status: 'Active',
      purchaseDate: '',
      value: '',
      description: ''
    });
    setAssetErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Save employee data
      const employeeData = {
        ...formData,
        assignedAssets: [...assignedAssets, ...selectedAssets]
      };
      
      onSave(employeeData);
    }
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking on the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      onHide();
    }
    // Don't close dropdown when clicking on modal content
  };

  if (!show) return null;



  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-50 text-gray-900 rounded-t-2xl border-none p-6 border-b border-gray-200 flex justify-between items-center">
          <h5 className="text-xl font-semibold mb-0">
            {employee ? 'Edit Employee' : 'Add New Employee'}
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
            {/* Employee Information Section */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h6 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID {employee ? '*' : ''}
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    readOnly={!employee} // Read-only for new employees
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 ${
                      errors.employeeId ? 'border-red-500' : 'border-gray-300'
                    } ${!employee ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    placeholder={employee ? "Employee ID" : "Auto-generated by system"}
                  />
                  {!employee && (
                    <div className="text-gray-500 text-sm mt-1">
                      <i className="fas fa-info-circle mr-1"></i>
                      Employee ID will be automatically generated when saved
                    </div>
                  )}
                  {errors.employeeId && (
                    <div className="text-red-500 text-sm mt-1">{errors.employeeId}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <div className="text-red-500 text-sm mt-1">{errors.firstName}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <div className="text-red-500 text-sm mt-1">{errors.lastName}</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className={`department-button w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between ${
                        errors.department ? 'border-red-500' : 'border-gray-300'
                      }`}
                      onClick={() => {
                        setShowDepartmentDropdown(!showDepartmentDropdown);
                      }}
                    >
                      <span className={formData.department ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.department || 'Select Department'}
                      </span>
                      <i className={`fas fa-chevron-down transition-transform duration-200 ${showDepartmentDropdown ? 'rotate-180' : ''}`}></i>
                    </button>
                    
                    {showDepartmentDropdown && (
                      <div 
                        className="department-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        onClick={handleDropdownClick}
                        style={{ zIndex: 9999 }}
                      >
                        <ul className="py-1">
                          {departments.map((department, index) => {
                            // Check if it's a custom department object
                            if (typeof department === 'object' && department.icon && department.color) {
                              return (
                                <li key={`custom-dept-${department.id || department.name}-${index}`}>
                                  <button
                                    type="button"
                                    onClick={() => handleDepartmentSelect(department.name)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                                  >
                                    <i className={`${department.icon} ${department.color} w-4`}></i>
                                    <span className="text-gray-900">{department.name}</span>
                                  </button>
                                </li>
                              );
                            } else {
                              // Default department string
                              const departmentIcon = getDepartmentIcon(department);
                              return (
                                <li key={`default-dept-${department}-${index}`}>
                                  <button
                                    type="button"
                                    onClick={() => handleDepartmentSelect(department)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                                  >
                                    <i className={`${departmentIcon.icon} ${departmentIcon.color} w-4`}></i>
                                    <span className="text-gray-900">{department}</span>
                                  </button>
                                </li>
                              );
                            }
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.department && (
                    <div className="text-red-500 text-sm mt-1">{errors.department}</div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className={`position-button w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between ${
                        errors.position ? 'border-red-500' : 'border-gray-300'
                      }`}
                      onClick={() => {
                        setShowPositionDropdown(!showPositionDropdown);
                      }}
                    >
                      <span className={formData.position ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.position || 'Select Position'}
                      </span>
                      <i className={`fas fa-chevron-down transition-transform duration-200 ${showPositionDropdown ? 'rotate-180' : ''}`}></i>
                    </button>
                    
                    {showPositionDropdown && (
                      <div 
                        className="position-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        onClick={handleDropdownClick}
                        style={{ zIndex: 9999 }}
                      >
                        <ul className="py-1">
                          {roles.map((role, index) => {
                            // Check if it's a custom position object
                            if (typeof role === 'object' && role.icon && role.color) {
                              return (
                                <li key={`custom-position-${role.id || role.name}-${index}`}>
                                  <button
                                    type="button"
                                    onClick={() => handlePositionSelect(role.name)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                                  >
                                    <i className={`${role.icon} ${role.color} w-4`}></i>
                                    <span className="text-gray-900">{role.name}</span>
                                  </button>
                                </li>
                              );
                            } else {
                              // Default position string
                              const roleIcon = getRoleIcon(role);
                              return (
                                <li key={`default-position-${role}-${index}`}>
                                  <button
                                    type="button"
                                    onClick={() => handlePositionSelect(role)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                                  >
                                    <i className={`${roleIcon.icon} ${roleIcon.color} w-4`}></i>
                                    <span className="text-gray-900">{role}</span>
                                  </button>
                                </li>
                              );
                            }
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.position && (
                    <div className="text-red-500 text-sm mt-1">{errors.position}</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10 digits"
                  />
                  {errors.phone && (
                    <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hire Date *
                  </label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 ${
                      errors.hireDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.hireDate && (
                    <div className="text-red-500 text-sm mt-1">{errors.hireDate}</div>
                  )}
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className={`employee-status-button w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between`}
                      onClick={() => {
                        setShowEmployeeStatusDropdown(!showEmployeeStatusDropdown);
                      }}
                    >
                      <span className={formData.status ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.status || 'Select Status'}
                      </span>
                      <i className={`fas fa-chevron-down transition-transform duration-200 ${showEmployeeStatusDropdown ? 'rotate-180' : ''}`}></i>
                    </button>
                    
                    {showEmployeeStatusDropdown && (
                      <div 
                        className="employee-status-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        onClick={handleDropdownClick}
                        style={{ zIndex: 9999 }}
                      >
                        <ul className="py-1">
                          {['Active', 'Inactive', 'On Leave', 'Terminated'].map((status) => {
                            const statusIcon = getEmployeeStatusIcon(status);
                            return (
                              <li key={status}>
                                <button
                                  type="button"
                                  onClick={() => handleEmployeeStatusSelect(status)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                                >
                                  <i className={`${statusIcon.icon} ${statusIcon.color} w-4`}></i>
                                  <span className="text-gray-900">{status}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                  placeholder="Additional notes about the employee..."
                />
              </div>
            </div>

            {/* Add New Asset Section */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h6 className="text-lg font-semibold text-gray-900 mb-4">Add New Asset</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={assetFormData.name}
                    onChange={handleAssetInputChange}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 ${
                      assetErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter asset name"
                  />
                  {assetErrors.name && (
                    <div className="text-red-500 text-sm mt-1">{assetErrors.name}</div>
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
                        assetErrors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                      onClick={() => {
                        setShowCategoryDropdown(!showCategoryDropdown);
                      }}
                    >
                      <span className={assetFormData.category ? 'text-gray-900' : 'text-gray-500'}>
                        {assetFormData.category || 'Select Category'}
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
                  {assetErrors.category && (
                    <div className="text-red-500 text-sm mt-1">{assetErrors.category}</div>
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
                        assetErrors.status ? 'border-red-500' : 'border-gray-300'
                      }`}
                      onClick={() => {
                        setShowStatusDropdown(!showStatusDropdown);
                      }}
                    >
                      <span className={assetFormData.status ? 'text-gray-900' : 'text-gray-500'}>
                        {assetFormData.status || 'Select Status'}
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
                  {assetErrors.status && (
                    <div className="text-red-500 text-sm mt-1">{assetErrors.status}</div>
                  )}
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Value
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={assetFormData.value}
                    onChange={handleAssetInputChange}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 ${
                      assetErrors.value ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter asset value"
                    step="0.01"
                    min="0"
                  />
                  {assetErrors.value && (
                    <div className="text-red-500 text-sm mt-1">{assetErrors.value}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={assetFormData.description}
                    onChange={handleAssetInputChange}
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                    placeholder="Enter asset description"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleAddAsset}
                  className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border-none bg-gray-800 text-white shadow-sm hover:bg-gray-900 hover:transform hover:-translate-y-1 hover:shadow-md"
                >
                  <i className="fas fa-plus mr-2"></i>Add Asset to Employee
                </button>
                <button
                  type="button"
                  onClick={clearAssetForm}
                  className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <i className="fas fa-times mr-2"></i>Clear Form
                </button>
              </div>
            </div>

            {/* Assets for this Employee Section */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h6 className="text-lg font-semibold text-gray-900 mb-4">Assets for this Employee</h6>
              <div className="space-y-3">
                {assignedAssets.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-2">No assets added yet.</p>
                    <p className="text-gray-500 text-sm">
                      <i className="fas fa-info-circle mr-1"></i>
                      Assets created above will be assigned to this employee when saved.
                    </p>
                  </div>
                ) : (
                  assignedAssets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900">{asset.name}</h6>
                        <p className="text-sm text-gray-600">{asset.category} • {asset.status}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAssignedAsset(asset.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Remove Asset"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Available Assets Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h6 className="text-lg font-semibold text-gray-900 mb-4">Available Assets to Assign</h6>
              <div className="space-y-3">
                {availableAssets.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No available assets to assign.</p>
                  </div>
                ) : (
                  availableAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900">{asset.name}</h6>
                        <p className="text-sm text-gray-600">{asset.category} • {asset.status}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAssignAsset(asset)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        disabled={selectedAssets.find(a => a.id === asset.id)}
                      >
                        {selectedAssets.find(a => a.id === asset.id) ? 'Assigned' : 'Assign'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
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
              {employee ? 'Update Employee' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
