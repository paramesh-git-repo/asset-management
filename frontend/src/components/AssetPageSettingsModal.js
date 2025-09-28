import React, { useState, useEffect } from 'react';

const AssetPageSettingsModal = ({ show, onHide }) => {
  const [settings, setSettings] = useState({
    // Display settings
    showAssetImages: true,
    showAssetValue: true,
    showPurchaseDate: true,
    showAssignedDate: true,
    showDescription: false,
    
    // Table settings
    itemsPerPage: 10,
    enablePagination: true,
    enableSorting: true,
    enableFiltering: true,
    
    // Default filters
    defaultCategoryFilter: '',
    defaultStatusFilter: '',
    
    // Asset creation settings
    autoGenerateAssetId: true,
    requireAssetValue: false,
    requireDescription: false,
    
    // History settings
    enableHistoryTracking: true,
    maxHistoryEntries: 50,
    
    // Export settings
    enableExport: true,
    exportFormat: 'json',
    includeHistoryInExport: true
  });

  // Custom categories, statuses, and assigned to options
  const [customCategories, setCustomCategories] = useState([]);
  const [customStatuses, setCustomStatuses] = useState([]);
  const [assignedToOptions, setAssignedToOptions] = useState([]);
  const [customSubCategories, setCustomSubCategories] = useState([]);

  // All categories and statuses (default + custom)
  const [allCategories, setAllCategories] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);

  // Track removed default items
  const [removedDefaultCategories, setRemovedDefaultCategories] = useState([]);
  const [removedDefaultStatuses, setRemovedDefaultStatuses] = useState([]);

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

  // Load data on component mount
  useEffect(() => {
    // Default IT Equipment sub-categories from AssetModal
    const defaultITSubCategories = [
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

    // Convert default sub categories to the format we need
    const defaultSubCategories = defaultITSubCategories.map((name, index) => ({
      id: `default-${index}`,
      name: name,
      parentCategory: 'IT Equipment',
      icon: getSubCategoryIcon(name),
      color: getSubCategoryColor(name)
    }));

    // Load custom categories and statuses from localStorage
    const assetSettings = localStorage.getItem('assetPageSettings');
    if (assetSettings) {
      try {
        const settings = JSON.parse(assetSettings);
        if (settings.customCategories) {
          setCustomCategories(settings.customCategories);
        }
        if (settings.customStatuses) {
          setCustomStatuses(settings.customStatuses);
        }
        if (settings.customSubCategories) {
          setCustomSubCategories(settings.customSubCategories);
        }
        if (settings.removedDefaultCategories) {
          setRemovedDefaultCategories(settings.removedDefaultCategories);
        }
        if (settings.removedDefaultStatuses) {
          setRemovedDefaultStatuses(settings.removedDefaultStatuses);
        }
      } catch (error) {
        console.error('Error loading asset settings:', error);
      }
    }

    // Load employees for assigned to options
    const employees = localStorage.getItem('employees');
    if (employees) {
      try {
        const employeesData = JSON.parse(employees);
        if (Array.isArray(employeesData)) {
          setAssignedToOptions(employeesData);
        }
      } catch (error) {
        console.error('Error loading employees:', error);
      }
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('assetPageSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Combine default and custom categories/statuses when they change
  useEffect(() => {
    // Default categories (same as in Assets page)
    const defaultCategories = [
      { value: 'IT Equipment', icon: 'fas fa-desktop' },
      { value: 'Office Furniture', icon: 'fas fa-couch' },
      { value: 'Vehicles', icon: 'fas fa-car' },
      { value: 'Machinery', icon: 'fas fa-cogs' },
      { value: 'Tools', icon: 'fas fa-wrench' },
      { value: 'Electronics', icon: 'fas fa-laptop' },
      { value: 'Software', icon: 'fas fa-code' }
    ];

    // Default statuses
    const defaultStatuses = ['Active', 'Inactive', 'Maintenance', 'Repaired', 'Available', 'Lost'];

    // Filter out removed default categories and statuses
    const filteredDefaultCategories = defaultCategories.filter(cat => 
      !removedDefaultCategories.includes(cat.value)
    );
    const filteredDefaultStatuses = defaultStatuses.filter(status => 
      !removedDefaultStatuses.includes(status)
    );

    // Default IT Equipment sub-categories from AssetModal
    const defaultITSubCategories = [
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

    // Convert default sub categories to the format we need
    const defaultSubCategories = defaultITSubCategories.map((name, index) => ({
      id: `default-${index}`,
      name: name,
      parentCategory: 'IT Equipment',
      icon: getSubCategoryIcon(name),
      color: getSubCategoryColor(name)
    }));

    // Combine filtered default and custom
    setAllCategories([...filteredDefaultCategories, ...customCategories]);
    setAllStatuses([...filteredDefaultStatuses, ...customStatuses]);
    setAllSubCategories([...defaultSubCategories, ...customSubCategories]);
    
    // Debug: Log sub categories
    console.log('Default Sub Categories:', defaultSubCategories);
    console.log('Custom Sub Categories:', customSubCategories);
    console.log('All Sub Categories:', [...defaultSubCategories, ...customSubCategories]);
  }, [customCategories, customStatuses, customSubCategories, removedDefaultCategories, removedDefaultStatuses]);

  // Form states for adding new items
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newStatus, setNewStatus] = useState({ name: '' });
  const [newSubCategory, setNewSubCategory] = useState({ name: '', parentCategory: '' });
  const [showParentCategoryDropdown, setShowParentCategoryDropdown] = useState(false);

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

  // Load employees for assigned to options
  useEffect(() => {
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    setAssignedToOptions(employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      icon: 'fas fa-user',
      color: 'text-blue-600'
    })));
  }, []);

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

  // Auto-generate icon and color for categories
  const generateCategoryIcon = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('laptop') || nameLower.includes('computer') || nameLower.includes('pc')) {
      return { icon: 'fas fa-laptop', color: 'text-blue-600' };
    } else if (nameLower.includes('phone') || nameLower.includes('mobile')) {
      return { icon: 'fas fa-mobile-alt', color: 'text-green-600' };
    } else if (nameLower.includes('car') || nameLower.includes('vehicle')) {
      return { icon: 'fas fa-car', color: 'text-red-600' };
    } else if (nameLower.includes('furniture') || nameLower.includes('chair') || nameLower.includes('table')) {
      return { icon: 'fas fa-couch', color: 'text-brown-600' };
    } else if (nameLower.includes('office') || nameLower.includes('supply')) {
      return { icon: 'fas fa-paperclip', color: 'text-gray-600' };
    } else if (nameLower.includes('print') || nameLower.includes('printer')) {
      return { icon: 'fas fa-print', color: 'text-purple-600' };
    } else if (nameLower.includes('tool')) {
      return { icon: 'fas fa-tools', color: 'text-orange-600' };
    } else {
      return { icon: 'fas fa-tag', color: 'text-blue-600' };
    }
  };

  // Auto-generate icon and color for statuses
  const generateStatusIcon = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('active') || nameLower.includes('working')) {
      return { icon: 'fas fa-check-circle', color: 'text-green-600' };
    } else if (nameLower.includes('inactive') || nameLower.includes('broken')) {
      return { icon: 'fas fa-times-circle', color: 'text-red-600' };
    } else if (nameLower.includes('maintenance') || nameLower.includes('repair')) {
      return { icon: 'fas fa-tools', color: 'text-yellow-600' };
    } else if (nameLower.includes('retired') || nameLower.includes('archived')) {
      return { icon: 'fas fa-archive', color: 'text-gray-600' };
    } else if (nameLower.includes('warning') || nameLower.includes('alert')) {
      return { icon: 'fas fa-exclamation-triangle', color: 'text-orange-600' };
    } else {
      return { icon: 'fas fa-circle', color: 'text-gray-600' };
    }
  };

  // Category management functions
  const addCategory = () => {
    if (newCategory.name.trim()) {
      const { icon, color } = generateCategoryIcon(newCategory.name.trim());
      const category = {
        id: Date.now(),
        name: newCategory.name.trim(),
        icon,
        color
      };
      setCustomCategories(prev => [...prev, category]);
      setNewCategory({ name: '' });
    }
  };

  const removeCategory = (id) => {
    setCustomCategories(prev => prev.filter(cat => cat.id !== id));
  };

  // Status management functions
  const addStatus = () => {
    if (newStatus.name.trim()) {
      const { icon, color } = generateStatusIcon(newStatus.name.trim());
      const status = {
        id: Date.now(),
        name: newStatus.name.trim(),
        icon,
        color
      };
      setCustomStatuses(prev => [...prev, status]);
      setNewStatus({ name: '' });
    }
  };

  const removeStatus = (id) => {
    setCustomStatuses(prev => prev.filter(status => status.id !== id));
  };

  // Sub category management functions
  const addSubCategory = () => {
    if (newSubCategory.name.trim() && newSubCategory.parentCategory) {
      const { icon, color } = generateCategoryIcon(newSubCategory.name.trim());
      const subCategory = {
        id: Date.now(),
        name: newSubCategory.name.trim(),
        parentCategory: newSubCategory.parentCategory,
        icon,
        color
      };
      setCustomSubCategories(prev => [...prev, subCategory]);
      setNewSubCategory({ name: '', parentCategory: '' });
    }
  };

  const removeSubCategory = (id) => {
    setCustomSubCategories(prev => prev.filter(subCat => subCat.id !== id));
  };

  // Default category and status removal functions
  const removeDefaultCategory = (categoryName) => {
    // Add to removed list
    setRemovedDefaultCategories(prev => [...prev, categoryName]);
  };

  const removeDefaultStatus = (statusName) => {
    // Add to removed list
    setRemovedDefaultStatuses(prev => [...prev, statusName]);
  };

  const handleSave = () => {
    const dataToSave = {
      ...settings,
      customCategories,
      customStatuses,
      customSubCategories,
      removedDefaultCategories,
      removedDefaultStatuses
    };
    localStorage.setItem('assetPageSettings', JSON.stringify(dataToSave));
    onHide();
  };

  const handleReset = () => {
    const defaultSettings = {
      showAssetImages: true,
      showAssetValue: true,
      showPurchaseDate: true,
      showAssignedDate: true,
      showDescription: false,
      itemsPerPage: 10,
      enablePagination: true,
      enableSorting: true,
      enableFiltering: true,
      defaultCategoryFilter: '',
      defaultStatusFilter: '',
      autoGenerateAssetId: true,
      requireAssetValue: false,
      requireDescription: false,
      enableHistoryTracking: true,
      maxHistoryEntries: 50,
      enableExport: true,
      exportFormat: 'json',
      includeHistoryInExport: true
    };
    setSettings(defaultSettings);
  };

  // Load settings on mount
  useEffect(() => {
    if (show) {
      const savedSettings = localStorage.getItem('assetPageSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
          if (parsed.customCategories) {
            setCustomCategories(parsed.customCategories);
          }
          if (parsed.customStatuses) {
            setCustomStatuses(parsed.customStatuses);
          }
        } catch (error) {
          console.error('Error loading asset page settings:', error);
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
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mr-4">
              <i className="fas fa-boxes"></i>
            </div>
            <div>
              <h5 className="text-xl font-semibold mb-0">Asset Page Settings</h5>
              <p className="text-sm text-gray-600 mt-1">Configure asset management preferences</p>
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
                <i className="fas fa-eye mr-2 text-blue-600"></i>
                Display Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Show Asset Images</h5>
                    <p className="text-sm text-gray-600">Display asset images in the table</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.showAssetImages}
                      onChange={(e) => handleInputChange('showAssetImages', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Show Asset Value</h5>
                    <p className="text-sm text-gray-600">Display asset value column</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.showAssetValue}
                      onChange={(e) => handleInputChange('showAssetValue', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Show Purchase Date</h5>
                    <p className="text-sm text-gray-600">Display purchase date column</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.showPurchaseDate}
                      onChange={(e) => handleInputChange('showPurchaseDate', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Show Assigned Date</h5>
                    <p className="text-sm text-gray-600">Display assigned date column</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.showAssignedDate}
                      onChange={(e) => handleInputChange('showAssignedDate', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Table Settings */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-table mr-2 text-blue-600"></i>
                Table Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items per Page</label>
                  <div className="relative">
                    <button
                      type="button"
                      className="items-per-page-button w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-blue-800 focus:ring-4 focus:ring-blue-800/10 text-left flex items-center justify-between"
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
                      className="export-format-button w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-blue-800 focus:ring-4 focus:ring-blue-800/10 text-left flex items-center justify-between"
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Asset Creation Settings */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-plus mr-2 text-blue-600"></i>
                Asset Creation Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Auto-generate Asset ID</h5>
                    <p className="text-sm text-gray-600">Automatically create asset IDs</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.autoGenerateAssetId}
                      onChange={(e) => handleInputChange('autoGenerateAssetId', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Require Asset Value</h5>
                    <p className="text-sm text-gray-600">Make asset value mandatory</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.requireAssetValue}
                      onChange={(e) => handleInputChange('requireAssetValue', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-gray-900">Require Description</h5>
                    <p className="text-sm text-gray-600">Make description mandatory</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.requireDescription}
                      onChange={(e) => handleInputChange('requireDescription', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Category Management */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-tags mr-2 text-blue-600"></i>
                Category Management
              </h4>
              <div className="space-y-4">
                {/* Add new category */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Add New Category</h5>
                  <p className="text-sm text-gray-600 mb-3">Icon and color will be automatically generated based on the category name.</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Category name (e.g., Laptop, Furniture, Vehicle)"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:border-blue-800 focus:ring-2 focus:ring-blue-800/10"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      onClick={addCategory}
                    >
                      <i className="fas fa-plus mr-2"></i>Add Category
                    </button>
                  </div>
                </div>

                {/* Existing categories */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Existing Categories</h5>
                  <p className="text-sm text-gray-600 mb-3">All categories available in Add New Asset and Add New Employee modals</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allCategories.map((category, index) => {
                      // Check if it's a custom category (has id) or default category
                      const isCustom = category.id !== undefined;
                      const categoryName = category.value || category.name;
                      const categoryIcon = category.icon;
                      const categoryColor = category.color || 'text-gray-600';
                      
                      return (
                        <div key={`${isCustom ? 'custom' : 'default'}-${categoryName}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <i className={`${categoryIcon} ${categoryColor} mr-3`}></i>
                            <span className="font-medium text-gray-900">{categoryName}</span>
                            {isCustom && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Custom</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            onClick={() => isCustom ? removeCategory(category.id) : removeDefaultCategory(categoryName)}
                            title={isCustom ? "Remove custom category" : "Remove default category"}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Sub Category Management */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-sitemap mr-2 text-green-600"></i>
                Sub Category Management
              </h4>
              <div className="space-y-4">
                {/* Add new sub category */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Add New Sub Category</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-sitemap mr-2 text-green-600"></i>Parent Category
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between"
                          onClick={() => setShowParentCategoryDropdown(!showParentCategoryDropdown)}
                        >
                          <span className={newSubCategory.parentCategory ? 'text-gray-900' : 'text-gray-500'}>
                            {newSubCategory.parentCategory || 'Select Parent Category'}
                          </span>
                          <i className={`fas fa-chevron-down transition-transform duration-200 ${showParentCategoryDropdown ? 'rotate-180' : ''}`}></i>
                        </button>
                        
                        {showParentCategoryDropdown && (
                          <div 
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                            style={{ zIndex: 9999 }}
                          >
                            <ul className="py-1">
                              {allCategories.map((category, index) => {
                                const categoryName = category.value || category.name;
                                const categoryIcon = category.icon || 'fas fa-folder';
                                const categoryColor = category.color || 'text-gray-600';
                                return (
                                  <li key={`${categoryName}-${index}`}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNewSubCategory(prev => ({ ...prev, parentCategory: categoryName }));
                                        setShowParentCategoryDropdown(false);
                                      }}
                                      className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                                    >
                                      <i className={`${categoryIcon} ${categoryColor} w-4`}></i>
                                      <span className="text-gray-900">{categoryName}</span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-tag mr-2 text-green-600"></i>Sub Category Name
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        placeholder="Enter sub category name"
                        value={newSubCategory.name}
                        onChange={(e) => setNewSubCategory(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center"
                      onClick={addSubCategory}
                      disabled={!newSubCategory.name.trim() || !newSubCategory.parentCategory}
                    >
                      <i className="fas fa-plus mr-2"></i>Add Sub Category
                    </button>
                  </div>
                </div>

                {/* Existing sub categories */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">Existing Sub Categories</h5>
                    <button
                      type="button"
                      onClick={() => {
                        // Force reload default IT Equipment sub categories
                        const defaultITSubCategories = [
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

                        const defaultSubCategories = defaultITSubCategories.map((name, index) => ({
                          id: `default-${index}`,
                          name: name,
                          parentCategory: 'IT Equipment',
                          icon: getSubCategoryIcon(name),
                          color: getSubCategoryColor(name)
                        }));

                        setCustomSubCategories([]); // Clear custom sub categories to show only defaults
                        const assetSettings = localStorage.getItem('assetPageSettings');
                        const settings = assetSettings ? JSON.parse(assetSettings) : {};
                        const updatedSettings = {
                          ...settings,
                          customSubCategories: []
                        };
                        localStorage.setItem('assetPageSettings', JSON.stringify(updatedSettings));
                      }}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                    >
                      Show Default Sub Categories
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Sub categories available in Add New Asset modal</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allSubCategories.map((subCategory, index) => {
                      return (
                        <div key={`subcategory-${subCategory.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <i className={`${subCategory.icon} ${subCategory.color} mr-3`}></i>
                            <div>
                              <span className="font-medium text-gray-900">{subCategory.name}</span>
                              <div className="text-xs text-gray-500">Under: {subCategory.parentCategory}</div>
                            </div>
                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Sub Category</span>
                          </div>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            onClick={() => removeSubCategory(subCategory.id)}
                            title="Remove sub category"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      );
                    })}
                    {allSubCategories.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        <i className="fas fa-sitemap text-4xl mb-2"></i>
                        <p>No sub categories added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-toggle-on mr-2 text-blue-600"></i>
                Status Management
              </h4>
              <div className="space-y-4">
                {/* Add new status */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Add New Status</h5>
                  <p className="text-sm text-gray-600 mb-3">Icon and color will be automatically generated based on the status name.</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Status name (e.g., Active, Maintenance, Retired)"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:border-blue-800 focus:ring-2 focus:ring-blue-800/10"
                      value={newStatus.name}
                      onChange={(e) => setNewStatus(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      onClick={addStatus}
                    >
                      <i className="fas fa-plus mr-2"></i>Add Status
                    </button>
                  </div>
                </div>

                {/* Existing statuses */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Existing Statuses</h5>
                  <p className="text-sm text-gray-600 mb-3">All statuses available in Add New Asset and Add New Employee modals</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allStatuses.map((status, index) => {
                      // Check if it's a custom status (has id) or default status
                      const isCustom = typeof status === 'object' && status.id !== undefined;
                      const statusName = typeof status === 'object' ? status.name : status;
                      const statusIcon = typeof status === 'object' ? status.icon : 'fas fa-circle';
                      const statusColor = typeof status === 'object' ? status.color : 'text-gray-600';
                      
                      return (
                        <div key={`${isCustom ? 'custom' : 'default'}-${statusName}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <i className={`${statusIcon} ${statusColor} mr-3`}></i>
                            <span className="font-medium text-gray-900">{statusName}</span>
                            {isCustom && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Custom</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            onClick={() => isCustom ? removeStatus(status.id) : removeDefaultStatus(statusName)}
                            title={isCustom ? "Remove custom status" : "Remove default status"}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned To Management */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                <i className="fas fa-users mr-2 text-blue-600"></i>
                Assigned To Options
              </h4>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h5 className="font-medium text-gray-900 mb-3">Available Employees</h5>
                <p className="text-sm text-gray-600 mb-4">These options are automatically populated from the employee list.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assignedToOptions.map((employee) => (
                    <div key={employee.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <i className={`${employee.icon} ${employee.color} mr-3`}></i>
                      <span className="font-medium text-gray-900">{employee.fullName || `${employee.firstName} ${employee.lastName}`}</span>
                    </div>
                  ))}
                  {assignedToOptions.length === 0 && (
                    <div className="col-span-2 text-center py-4 text-gray-500">
                      <i className="fas fa-users text-2xl mb-2"></i>
                      <p>No employees found. Add employees first to see them here.</p>
                    </div>
                  )}
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
              className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border-none bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:transform hover:-translate-y-1 hover:shadow-md"
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

export default AssetPageSettingsModal;
