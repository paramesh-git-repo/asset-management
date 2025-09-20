import React, { useState, useEffect } from 'react';

const EmployeePageSettingsModal = ({ show, onHide }) => {
  const [settings, setSettings] = useState({
    // Display settings
    showEmployeePhotos: true,
    showEmployeeEmail: true,
    showEmployeePhone: true,
    showEmployeeDepartment: true,
    showEmployeeRole: true,
    showHireDate: true,
    showEmployeeStatus: true,
    
    // Table settings
    itemsPerPage: 10,
    enablePagination: true,
    enableSorting: true,
    enableFiltering: true,
    
    // Default filters
    defaultDepartmentFilter: '',
    defaultRoleFilter: '',
    defaultStatusFilter: '',
    
    // Employee creation settings
    autoGenerateEmployeeId: true,
    requirePhoneNumber: true,
    requireDepartment: true,
    requireRole: true,
    
    // Asset assignment settings
    enableAssetAssignment: true,
    allowMultipleAssets: true,
    requireAssetAssignment: false,
    
    // Export settings
    enableExport: true,
    exportFormat: 'json',
    includeAssignedAssets: true
  });

  // Custom departments, roles, and statuses
  const [customDepartments, setCustomDepartments] = useState([
    { id: 1, name: 'IT', icon: 'fas fa-laptop-code', color: 'text-blue-600' },
    { id: 2, name: 'HR', icon: 'fas fa-users', color: 'text-purple-600' },
    { id: 3, name: 'Finance', icon: 'fas fa-chart-line', color: 'text-green-600' },
    { id: 4, name: 'Marketing', icon: 'fas fa-bullhorn', color: 'text-orange-600' }
  ]);

  const [customRoles, setCustomRoles] = useState([
    { id: 1, name: 'Manager', icon: 'fas fa-user-tie', color: 'text-blue-600' },
    { id: 2, name: 'Developer', icon: 'fas fa-code', color: 'text-green-600' },
    { id: 3, name: 'Analyst', icon: 'fas fa-chart-bar', color: 'text-purple-600' },
    { id: 4, name: 'Assistant', icon: 'fas fa-user', color: 'text-gray-600' }
  ]);

  const [customEmployeeStatuses, setCustomEmployeeStatuses] = useState([
    { id: 1, name: 'Active', icon: 'fas fa-check-circle', color: 'text-green-600' },
    { id: 2, name: 'Inactive', icon: 'fas fa-times-circle', color: 'text-red-600' },
    { id: 3, name: 'On Leave', icon: 'fas fa-calendar-alt', color: 'text-yellow-600' },
    { id: 4, name: 'Terminated', icon: 'fas fa-user-slash', color: 'text-gray-600' }
  ]);

  // Form states for adding new items
  const [newDepartment, setNewDepartment] = useState({ name: '' });
  const [newRole, setNewRole] = useState({ name: '' });
  const [newEmployeeStatus, setNewEmployeeStatus] = useState({ name: '' });

  // Dropdown states
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const [showExportFormatDropdown, setShowExportFormatDropdown] = useState(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Helper functions for dropdown icons and colors
  const getItemsPerPageIcon = (items) => {
    switch (items) {
      case 5:
        return { icon: 'fas fa-list', color: 'text-green-600' };
      case 10:
        return { icon: 'fas fa-list-ol', color: 'text-blue-600' };
      case 25:
        return { icon: 'fas fa-th-list', color: 'text-purple-600' };
      case 50:
        return { icon: 'fas fa-table', color: 'text-orange-600' };
      case 100:
        return { icon: 'fas fa-th-large', color: 'text-red-600' };
      default:
        return { icon: 'fas fa-list', color: 'text-gray-600' };
    }
  };

  const getExportFormatIcon = (format) => {
    switch (format) {
      case 'json':
        return { icon: 'fas fa-code', color: 'text-yellow-600' };
      case 'csv':
        return { icon: 'fas fa-file-csv', color: 'text-green-600' };
      case 'excel':
        return { icon: 'fas fa-file-excel', color: 'text-blue-600' };
      default:
        return { icon: 'fas fa-download', color: 'text-gray-600' };
    }
  };

  // Dropdown handlers
  const handleItemsPerPageSelect = (items) => {
    handleInputChange('itemsPerPage', items);
    setShowItemsPerPageDropdown(false);
  };

  const handleExportFormatSelect = (format) => {
    handleInputChange('exportFormat', format);
    setShowExportFormatDropdown(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.items-per-page-button') && !event.target.closest('.items-per-page-dropdown')) {
        setShowItemsPerPageDropdown(false);
      }
      if (!event.target.closest('.export-format-button') && !event.target.closest('.export-format-dropdown')) {
        setShowExportFormatDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-generate icon and color for departments
  const generateDepartmentIcon = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('it') || nameLower.includes('tech') || nameLower.includes('development')) {
      return { icon: 'fas fa-laptop-code', color: 'text-blue-600' };
    } else if (nameLower.includes('hr') || nameLower.includes('human')) {
      return { icon: 'fas fa-users', color: 'text-purple-600' };
    } else if (nameLower.includes('finance') || nameLower.includes('accounting')) {
      return { icon: 'fas fa-chart-line', color: 'text-green-600' };
    } else if (nameLower.includes('marketing') || nameLower.includes('sales')) {
      return { icon: 'fas fa-bullhorn', color: 'text-orange-600' };
    } else if (nameLower.includes('operation') || nameLower.includes('admin')) {
      return { icon: 'fas fa-cogs', color: 'text-gray-600' };
    } else if (nameLower.includes('training') || nameLower.includes('education')) {
      return { icon: 'fas fa-graduation-cap', color: 'text-yellow-600' };
    } else if (nameLower.includes('security')) {
      return { icon: 'fas fa-shield-alt', color: 'text-red-600' };
    } else {
      return { icon: 'fas fa-building', color: 'text-blue-600' };
    }
  };

  // Auto-generate icon and color for roles
  const generateRoleIcon = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('manager') || nameLower.includes('lead')) {
      return { icon: 'fas fa-user-tie', color: 'text-blue-600' };
    } else if (nameLower.includes('developer') || nameLower.includes('programmer')) {
      return { icon: 'fas fa-code', color: 'text-green-600' };
    } else if (nameLower.includes('analyst')) {
      return { icon: 'fas fa-chart-bar', color: 'text-purple-600' };
    } else if (nameLower.includes('engineer')) {
      return { icon: 'fas fa-cogs', color: 'text-orange-600' };
    } else if (nameLower.includes('trainer') || nameLower.includes('instructor')) {
      return { icon: 'fas fa-graduation-cap', color: 'text-yellow-600' };
    } else if (nameLower.includes('admin')) {
      return { icon: 'fas fa-shield-alt', color: 'text-red-600' };
    } else {
      return { icon: 'fas fa-user', color: 'text-gray-600' };
    }
  };

  // Auto-generate icon and color for employee statuses
  const generateEmployeeStatusIcon = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('active') || nameLower.includes('working')) {
      return { icon: 'fas fa-check-circle', color: 'text-green-600' };
    } else if (nameLower.includes('inactive') || nameLower.includes('terminated')) {
      return { icon: 'fas fa-times-circle', color: 'text-red-600' };
    } else if (nameLower.includes('leave') || nameLower.includes('vacation')) {
      return { icon: 'fas fa-calendar-alt', color: 'text-yellow-600' };
    } else if (nameLower.includes('suspended')) {
      return { icon: 'fas fa-user-slash', color: 'text-gray-600' };
    } else if (nameLower.includes('warning')) {
      return { icon: 'fas fa-exclamation-triangle', color: 'text-orange-600' };
    } else {
      return { icon: 'fas fa-circle', color: 'text-gray-600' };
    }
  };

  // Department management functions
  const addDepartment = () => {
    if (newDepartment.name.trim()) {
      const { icon, color } = generateDepartmentIcon(newDepartment.name.trim());
      const department = {
        id: Date.now(),
        name: newDepartment.name.trim(),
        icon,
        color
      };
      setCustomDepartments(prev => [...prev, department]);
      setNewDepartment({ name: '' });
    }
  };

  const removeDepartment = (id) => {
    setCustomDepartments(prev => prev.filter(dept => dept.id !== id));
  };

  // Role management functions
  const addRole = () => {
    if (newRole.name.trim()) {
      const { icon, color } = generateRoleIcon(newRole.name.trim());
      const role = {
        id: Date.now(),
        name: newRole.name.trim(),
        icon,
        color
      };
      setCustomRoles(prev => [...prev, role]);
      setNewRole({ name: '' });
    }
  };

  const removeRole = (id) => {
    setCustomRoles(prev => prev.filter(role => role.id !== id));
  };

  // Employee status management functions
  const addEmployeeStatus = () => {
    if (newEmployeeStatus.name.trim()) {
      const { icon, color } = generateEmployeeStatusIcon(newEmployeeStatus.name.trim());
      const status = {
        id: Date.now(),
        name: newEmployeeStatus.name.trim(),
        icon,
        color
      };
      setCustomEmployeeStatuses(prev => [...prev, status]);
      setNewEmployeeStatus({ name: '' });
    }
  };

  const removeEmployeeStatus = (id) => {
    setCustomEmployeeStatuses(prev => prev.filter(status => status.id !== id));
  };

  const handleSave = () => {
    const dataToSave = {
      ...settings,
      customDepartments,
      customRoles,
      customEmployeeStatuses
    };
    localStorage.setItem('employeePageSettings', JSON.stringify(dataToSave));
    onHide();
  };

  const handleReset = () => {
    const defaultSettings = {
      showEmployeePhotos: true,
      showEmployeeEmail: true,
      showEmployeePhone: true,
      showEmployeeDepartment: true,
      showEmployeeRole: true,
      showHireDate: true,
      showEmployeeStatus: true,
      itemsPerPage: 10,
      enablePagination: true,
      enableSorting: true,
      enableFiltering: true,
      defaultDepartmentFilter: '',
      defaultRoleFilter: '',
      defaultStatusFilter: '',
      autoGenerateEmployeeId: true,
      requirePhoneNumber: true,
      requireDepartment: true,
      requireRole: true,
      enableAssetAssignment: true,
      allowMultipleAssets: true,
      requireAssetAssignment: false,
      enableExport: true,
      exportFormat: 'json',
      includeAssignedAssets: true
    };
    setSettings(defaultSettings);
  };

  // Load settings on mount
  useEffect(() => {
    if (show) {
      const savedSettings = localStorage.getItem('employeePageSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
          if (parsed.customDepartments) {
            setCustomDepartments(parsed.customDepartments);
          }
          if (parsed.customRoles) {
            setCustomRoles(parsed.customRoles);
          }
          if (parsed.customEmployeeStatuses) {
            setCustomEmployeeStatuses(parsed.customEmployeeStatuses);
          }
        } catch (error) {
          console.error('Error loading employee page settings:', error);
        }
      }
    }
  }, [show]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-50 text-gray-900 rounded-t-2xl border-none p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white mr-4">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <h5 className="text-xl font-semibold mb-0">Employee Page Settings</h5>
              <p className="text-sm text-gray-600 mt-1">Configure employee management preferences</p>
            </div>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            onClick={onHide}
          >
            ×
          </button>
        </div>
        
        <div className="text-gray-900 bg-white p-6">
          <div className="space-y-6">
            {/* Display Settings */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-eye mr-2 text-green-600"></i>
                Display Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Show Employee Photos</h5>
                    <p className="text-sm text-gray-600">Display employee photos in the table</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.showEmployeePhotos}
                      onChange={(e) => handleInputChange('showEmployeePhotos', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Show Employee Email</h5>
                    <p className="text-sm text-gray-600">Display employee email column</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.showEmployeeEmail}
                      onChange={(e) => handleInputChange('showEmployeeEmail', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Show Employee Phone</h5>
                    <p className="text-sm text-gray-600">Display employee phone column</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.showEmployeePhone}
                      onChange={(e) => handleInputChange('showEmployeePhone', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Show Hire Date</h5>
                    <p className="text-sm text-gray-600">Display employee hire date column</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.showHireDate}
                      onChange={(e) => handleInputChange('showHireDate', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Table Settings */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-table mr-2 text-green-600"></i>
                Table Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items per Page</label>
                  <div className="relative">
                    <button
                      type="button"
                      className="items-per-page-button w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-green-800 focus:ring-4 focus:ring-green-800/10 text-left flex items-center justify-between"
                      onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
                    >
                      <div className="flex items-center">
                        <i className={`${getItemsPerPageIcon(settings.itemsPerPage).icon} ${getItemsPerPageIcon(settings.itemsPerPage).color} mr-3`}></i>
                        <span>{settings.itemsPerPage} items</span>
                      </div>
                      <i className="fas fa-chevron-down text-gray-400"></i>
                    </button>
                    
                    {showItemsPerPageDropdown && (
                      <div className="items-per-page-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                        {[
                          { value: 5, label: '5 items', icon: 'fas fa-list', color: 'text-green-600' },
                          { value: 10, label: '10 items', icon: 'fas fa-list-ol', color: 'text-blue-600' },
                          { value: 25, label: '25 items', icon: 'fas fa-th-list', color: 'text-purple-600' },
                          { value: 50, label: '50 items', icon: 'fas fa-table', color: 'text-orange-600' },
                          { value: 100, label: '100 items', icon: 'fas fa-th-large', color: 'text-red-600' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center transition-colors duration-200"
                            onClick={() => handleItemsPerPageSelect(option.value)}
                          >
                            <i className={`${option.icon} ${option.color} mr-3`}></i>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                  <div className="relative">
                    <button
                      type="button"
                      className="export-format-button w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-green-800 focus:ring-4 focus:ring-green-800/10 text-left flex items-center justify-between"
                      onClick={() => setShowExportFormatDropdown(!showExportFormatDropdown)}
                    >
                      <div className="flex items-center">
                        <i className={`${getExportFormatIcon(settings.exportFormat).icon} ${getExportFormatIcon(settings.exportFormat).color} mr-3`}></i>
                        <span className="uppercase">{settings.exportFormat}</span>
                      </div>
                      <i className="fas fa-chevron-down text-gray-400"></i>
                    </button>
                    
                    {showExportFormatDropdown && (
                      <div className="export-format-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                        {[
                          { value: 'json', label: 'JSON', icon: 'fas fa-code', color: 'text-yellow-600' },
                          { value: 'csv', label: 'CSV', icon: 'fas fa-file-csv', color: 'text-green-600' },
                          { value: 'excel', label: 'Excel', icon: 'fas fa-file-excel', color: 'text-blue-600' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center transition-colors duration-200"
                            onClick={() => handleExportFormatSelect(option.value)}
                          >
                            <i className={`${option.icon} ${option.color} mr-3`}></i>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Enable Pagination</h5>
                    <p className="text-sm text-gray-600">Show pagination controls</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.enablePagination}
                      onChange={(e) => handleInputChange('enablePagination', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Enable Sorting</h5>
                    <p className="text-sm text-gray-600">Allow column sorting</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.enableSorting}
                      onChange={(e) => handleInputChange('enableSorting', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Enable Filtering</h5>
                    <p className="text-sm text-gray-600">Show filter controls</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.enableFiltering}
                      onChange={(e) => handleInputChange('enableFiltering', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Employee Creation Settings */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-user-plus mr-2 text-green-600"></i>
                Employee Creation Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Auto-generate Employee ID</h5>
                    <p className="text-sm text-gray-600">Automatically create employee IDs</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.autoGenerateEmployeeId}
                      onChange={(e) => handleInputChange('autoGenerateEmployeeId', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Require Phone Number</h5>
                    <p className="text-sm text-gray-600">Make phone number mandatory</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.requirePhoneNumber}
                      onChange={(e) => handleInputChange('requirePhoneNumber', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Require Department</h5>
                    <p className="text-sm text-gray-600">Make department mandatory</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.requireDepartment}
                      onChange={(e) => handleInputChange('requireDepartment', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Require Role</h5>
                    <p className="text-sm text-gray-600">Make role mandatory</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.requireRole}
                      onChange={(e) => handleInputChange('requireRole', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Asset Assignment Settings */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-link mr-2 text-green-600"></i>
                Asset Assignment Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Enable Asset Assignment</h5>
                    <p className="text-sm text-gray-600">Allow assigning assets to employees</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.enableAssetAssignment}
                      onChange={(e) => handleInputChange('enableAssetAssignment', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Allow Multiple Assets</h5>
                    <p className="text-sm text-gray-600">Assign multiple assets to one employee</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.allowMultipleAssets}
                      onChange={(e) => handleInputChange('allowMultipleAssets', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Require Asset Assignment</h5>
                    <p className="text-sm text-gray-600">Make asset assignment mandatory</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.requireAssetAssignment}
                      onChange={(e) => handleInputChange('requireAssetAssignment', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Department Management */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-building mr-2 text-green-600"></i>
                Department Management
              </h4>
              <div className="space-y-4">
                {/* Add new department */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Add New Department</h5>
                  <p className="text-sm text-gray-600 mb-3">Icon and color will be automatically generated based on the department name.</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Department name (e.g., IT, HR, Finance, Marketing)"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      onClick={addDepartment}
                    >
                      <i className="fas fa-plus mr-2"></i>Add Department
                    </button>
                  </div>
                </div>

                {/* Existing departments */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Existing Departments</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customDepartments.map((department) => (
                      <div key={department.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <i className={`${department.icon} ${department.color} mr-3`}></i>
                          <span className="font-medium text-gray-900">{department.name}</span>
                        </div>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          onClick={() => removeDepartment(department.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Role Management */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-user-tie mr-2 text-green-600"></i>
                Role Management
              </h4>
              <div className="space-y-4">
                {/* Add new role */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Add New Role</h5>
                  <p className="text-sm text-gray-600 mb-3">Icon and color will be automatically generated based on the role name.</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Role name (e.g., Manager, Developer, Analyst)"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      onClick={addRole}
                    >
                      <i className="fas fa-plus mr-2"></i>Add Role
                    </button>
                  </div>
                </div>

                {/* Existing roles */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Existing Roles</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customRoles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <i className={`${role.icon} ${role.color} mr-3`}></i>
                          <span className="font-medium text-gray-900">{role.name}</span>
                        </div>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          onClick={() => removeRole(role.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Status Management */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-toggle-on mr-2 text-green-600"></i>
                Employee Status Management
              </h4>
              <div className="space-y-4">
                {/* Add new employee status */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Add New Employee Status</h5>
                  <p className="text-sm text-gray-600 mb-3">Icon and color will be automatically generated based on the status name.</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Status name (e.g., Active, On Leave, Terminated)"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                      value={newEmployeeStatus.name}
                      onChange={(e) => setNewEmployeeStatus(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      onClick={addEmployeeStatus}
                    >
                      <i className="fas fa-plus mr-2"></i>Add Employee Status
                    </button>
                  </div>
                </div>

                {/* Existing employee statuses */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Existing Employee Statuses</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customEmployeeStatuses.map((status) => (
                      <div key={status.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <i className={`${status.icon} ${status.color} mr-3`}></i>
                          <span className="font-medium text-gray-900">{status.name}</span>
                        </div>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          onClick={() => removeEmployeeStatus(status.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white text-gray-900 border-t border-gray-200 p-6 flex justify-between">
          <button
            type="button"
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={handleReset}
          >
            <i className="fas fa-undo mr-2"></i>Reset to Defaults
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={onHide}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border-none bg-green-600 text-white shadow-sm hover:bg-green-700 hover:transform hover:-translate-y-1 hover:shadow-md"
              onClick={handleSave}
            >
              <i className="fas fa-save mr-2"></i>Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePageSettingsModal;
