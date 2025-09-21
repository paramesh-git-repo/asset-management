import React, { useState, useEffect } from 'react';
import AssetModal from '../components/AssetModal';
import DeleteModal from '../components/DeleteModal';
import ViewAssetModal from '../components/ViewAssetModal';
import Notification from '../components/Notification';
import dataService from '../services/dataService';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [viewingAsset, setViewingAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  
  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  // Helper function to show notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
  };

  // Load assets from API on component mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        const assetsData = await dataService.getAssets();
        setAssets(assetsData);
      } catch (err) {
        console.error('❌ Error loading assets:', err);
        setError('Failed to load assets. Please try again.');
        // Fallback to localStorage if API fails
        const savedAssets = localStorage.getItem('assets');
        if (savedAssets) {
          try {
            const parsedAssets = JSON.parse(savedAssets);
            setAssets(Array.isArray(parsedAssets) ? parsedAssets : []);
          } catch (error) {
            console.error('Error loading assets from localStorage:', error);
            setAssets([]);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  // Load employees from API
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeesData = await dataService.getEmployees();
        setEmployees(employeesData);
      } catch (err) {
        console.error('❌ Error loading employees:', err);
        // Fallback to localStorage if API fails
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
          try {
            const parsedEmployees = JSON.parse(savedEmployees);
            setEmployees(Array.isArray(parsedEmployees) ? parsedEmployees : []);
          } catch (error) {
            console.error('Error loading employees from localStorage:', error);
            setEmployees([]);
          }
        }
      }
    };

    loadEmployees();
  }, []);

  // Save assets to localStorage whenever assets change
  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem('assets', JSON.stringify(assets));
    }
  }, [assets]);

  // Filter assets based on search and filters
  useEffect(() => {
    let filtered = [...assets];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset => {
        // Search in asset name
        const nameMatch = asset.name?.toLowerCase().includes(query);
        
        // Search in asset ID (multiple possible fields)
        const idMatch = asset.assetId?.toLowerCase().includes(query) ||
                       asset.id?.toLowerCase().includes(query) ||
                       asset._id?.toLowerCase().includes(query);
        
        // Search in category
        const categoryMatch = asset.category?.toLowerCase().includes(query);
        
        // Search in status
        const statusMatch = asset.status?.toLowerCase().includes(query);
        
        // Search in assigned employee
        const assignedMatch = asset.assignedTo?.toLowerCase().includes(query);
        
        // Search in location
        const locationMatch = asset.location?.toLowerCase().includes(query);
        
        // Search in description
        const descriptionMatch = asset.description?.toLowerCase().includes(query);
        
        // Search in purchase date (formatted)
        const purchaseDateMatch = asset.purchaseDate ? 
          new Date(asset.purchaseDate).toLocaleDateString().toLowerCase().includes(query) : false;
        
        // Search in assigned date (formatted)
        const assignedDateMatch = asset.assignedDate ? 
          new Date(asset.assignedDate).toLocaleDateString().toLowerCase().includes(query) : false;
        
        return nameMatch || idMatch || categoryMatch || statusMatch || 
               assignedMatch || locationMatch || descriptionMatch || 
               purchaseDateMatch || assignedDateMatch;
      });
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(asset => asset.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(asset => asset.status === statusFilter);
    }

    // Apply company filter
    if (companyFilter) {
      filtered = filtered.filter(asset => asset.location === companyFilter);
    }

    // Sort assets by creation date (newest first) to match backend sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.dateCreated || 0);
      const dateB = new Date(b.createdAt || b.dateCreated || 0);
      return dateB - dateA; // Newest first
    });

    console.log('🔍 Filtering assets:', {
      totalAssets: assets.length,
      filteredCount: filtered.length,
      searchQuery,
      categoryFilter,
      statusFilter,
      companyFilter
    });
    setFilteredAssets(filtered);
  }, [assets, searchQuery, categoryFilter, statusFilter, companyFilter]);

  const generateAssetId = () => {
    if (assets.length === 0) return 'AST001';
    const maxId = Math.max(...assets.map(a => parseInt(a.id.replace('AST', ''))));
    return `AST${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleRefreshAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const assetsData = await dataService.getAssets();
      setAssets(assetsData);
      console.log('🔄 Assets refreshed from API:', assetsData);
      console.log('🔍 Number of assets after refresh:', assetsData.length);
    } catch (err) {
      console.error('❌ Error refreshing assets:', err);
      setError('Failed to refresh assets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowAssetModal(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowAssetModal(true);
  };

  const handleViewAsset = (asset) => {
    setViewingAsset(asset);
    setShowViewModal(true);
  };

  const handleDeleteAsset = (asset) => {
    setDeletingAsset(asset);
    setShowDeleteModal(true);
  };

  const handleSaveAsset = async (assetData) => {
    try {
      if (editingAsset) {
        // Update existing asset
        const updatedAsset = { 
          ...assetData, 
          id: editingAsset.id,
          // Remove frontend-specific fields that backend doesn't expect
          history: assetData.history || editingAsset.history || []
        };
        
        // Update in API
        await dataService.updateAsset(editingAsset.id, updatedAsset);
        
        // Update local state
        setAssets(prevAssets =>
          prevAssets.map(asset =>
            (asset._id || asset.id) === (editingAsset._id || editingAsset.id) ? updatedAsset : asset
          )
        );
        
        console.log('✅ Asset updated successfully:', updatedAsset);
      } else {
        // Add new asset - send only what the user provides
        const newAsset = {
          assetId: assetData.assetId, // Include the auto-generated asset ID
          name: assetData.name || 'Unnamed Asset',
          category: assetData.category || 'Other',
          status: assetData.status || 'Active',
          // Send any other fields the user provides
          ...(assetData.location && { location: assetData.location }),
          ...(assetData.assignedTo && { assignedTo: assetData.assignedTo }),
          ...(assetData.description && { description: assetData.description }),
          // History is optional
          ...(assetData.history && { history: assetData.history })
        };
        
        // Debug: Log what we're sending to the API
        console.log('🔍 Data being sent to API:', JSON.stringify(newAsset, null, 2));
        console.log('🔍 Asset ID being sent:', newAsset.assetId);
        console.log('🔍 Location being sent:', newAsset.location);
        
        // Save to API
        const savedAsset = await dataService.createAsset(newAsset);
        
        // Update local state with the saved asset (API might add additional fields)
        // Add new asset at the beginning of the list so it appears at the top
        setAssets(prevAssets => [savedAsset, ...prevAssets]);
        
        console.log('✅ Asset created successfully:', savedAsset);
      }
      
      setShowAssetModal(false);
      setEditingAsset(null);
    } catch (error) {
      console.error('❌ Error saving asset:', error);
      // Show error message to user
      showNotification(`Failed to save asset: ${error.message}`, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingAsset) {
      try {
        // Delete from API
        await dataService.deleteAsset(deletingAsset.id);
        
        // Update local state
        setAssets(prevAssets => prevAssets.filter(asset => (asset._id || asset.id) !== (deletingAsset._id || deletingAsset.id)));
        
        console.log('✅ Asset deleted successfully:', deletingAsset.id);
      } catch (error) {
        console.error('❌ Error deleting asset:', error);
        showNotification(`Failed to delete asset: ${error.message}`, 'error');
      } finally {
        setShowDeleteModal(false);
        setDeletingAsset(null);
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStatusFilter('');
    setCompanyFilter('');
  };

  // Dropdown handlers
  const handleCategorySelect = (category) => {
    setCategoryFilter(category);
    setShowCategoryDropdown(false);
  };

  const handleStatusSelect = (status) => {
    setStatusFilter(status);
    setShowStatusDropdown(false);
  };

  const handleCompanySelect = (company) => {
    setCompanyFilter(company);
    setShowCompanyDropdown(false);
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'IT Equipment':
        return { icon: 'fas fa-laptop', color: 'text-blue-600' };
      case 'Office Furniture':
        return { icon: 'fas fa-chair', color: 'text-green-600' };
      case 'Electronics':
        return { icon: 'fas fa-microchip', color: 'text-purple-600' };
      case 'Vehicles':
        return { icon: 'fas fa-car', color: 'text-orange-600' };
      case 'Tools':
        return { icon: 'fas fa-tools', color: 'text-red-600' };
      default:
        return { icon: 'fas fa-tags', color: 'text-gray-600' };
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return { icon: 'fas fa-check-circle', color: 'text-green-600' };
      case 'Inactive':
        return { icon: 'fas fa-times-circle', color: 'text-red-600' };
      case 'Maintenance':
        return { icon: 'fas fa-wrench', color: 'text-yellow-600' };
      case 'Retired':
        return { icon: 'fas fa-ban', color: 'text-gray-600' };
      default:
        return { icon: 'fas fa-circle', color: 'text-gray-600' };
    }
  };

  // Get company icon
  const getCompanyIcon = (company) => {
    switch (company) {
      case 'Axess Technology, Tidel':
        return { icon: 'fas fa-building', color: 'text-blue-600' };
      case 'Axess Technology, Velachery':
        return { icon: 'fas fa-building', color: 'text-green-600' };
      case 'V-Accel AI Dynamics Pvt Ltd':
        return { icon: 'fas fa-building', color: 'text-purple-600' };
      default:
        return { icon: 'fas fa-building', color: 'text-gray-600' };
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm';
      case 'Maintenance': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300 shadow-sm';
      case 'Retired': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 shadow-sm';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm';
    }
  };

  const getAvailableStatusClass = (assignedTo) => {
    if (assignedTo) {
      // Asset is assigned - show as unavailable
      return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 shadow-sm';
    } else {
      // Asset is not assigned - show as available
      return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Load custom categories and statuses from settings
  const [customCategories, setCustomCategories] = useState([]);
  const [customStatuses, setCustomStatuses] = useState([]);

  // Load custom data on component mount
  useEffect(() => {
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
      } catch (error) {
        console.error('Error loading asset settings:', error);
      }
    }
  }, []);

  // Handle click outside dropdowns
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
      
      // Close company dropdown
      if (showCompanyDropdown) {
        const dropdown = document.querySelector('.company-dropdown');
        const button = document.querySelector('.company-button');
        if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
          setShowCompanyDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown, showStatusDropdown, showCompanyDropdown]);

  // Get removed default items
  const getRemovedDefaults = () => {
    const assetSettings = localStorage.getItem('assetPageSettings');
    if (assetSettings) {
      try {
        const settings = JSON.parse(assetSettings);
        return {
          removedCategories: settings.removedDefaultCategories || [],
          removedStatuses: settings.removedDefaultStatuses || []
        };
      } catch (error) {
        console.error('Error loading removed defaults:', error);
      }
    }
    return { removedCategories: [], removedStatuses: [] };
  };

  // Combine default and custom categories
  const defaultCategories = [
    { value: 'IT Equipment', icon: 'fas fa-desktop' },
    { value: 'Office Furniture', icon: 'fas fa-couch' },
    { value: 'Vehicles', icon: 'fas fa-car' },
    { value: 'Machinery', icon: 'fas fa-cogs' },
    { value: 'Tools', icon: 'fas fa-wrench' },
    { value: 'Electronics', icon: 'fas fa-laptop' },
    { value: 'Software', icon: 'fas fa-code' }
  ];

  // Combine default and custom statuses
  const defaultStatuses = ['Active', 'Inactive', 'Maintenance', 'Retired'];

  // Get removed defaults
  const { removedCategories, removedStatuses } = getRemovedDefaults();

  // Filter out removed default categories and statuses
  const filteredDefaultCategories = defaultCategories.filter(cat => 
    !removedCategories.includes(cat.value)
  );
  const filteredDefaultStatuses = defaultStatuses.filter(status => 
    !removedStatuses.includes(status)
  );

  const categories = [...filteredDefaultCategories, ...customCategories];
  const statuses = [...filteredDefaultStatuses, ...customStatuses];

  return (
    <div className="px-0 py-4 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center px-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Asset Management</h2>
            <p className="text-gray-600 mt-1">Manage your organization's assets efficiently</p>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredAssets.length} of {assets.length} assets
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              className="px-4 py-3 rounded-xl font-medium transition-all duration-300 border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:transform hover:-translate-y-1 hover:shadow-lg group"
              onClick={handleRefreshAssets}
              title="Refresh Assets"
            >
              <i className="fas fa-sync-alt mr-2 group-hover:animate-spin"></i>Refresh
            </button>
            <button 
              className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border-none bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg hover:from-gray-700 hover:to-gray-800 hover:transform hover:-translate-y-1 hover:shadow-xl group"
              onClick={handleAddAsset}
            >
              <i className="fas fa-plus mr-2 group-hover:rotate-90 transition-transform duration-300"></i>Add Asset
            </button>
          </div>
      </div>

      {/* Asset Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-search mr-2 text-purple-600"></i>Search Assets
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pl-12 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                placeholder="Search by name, ID, category, status, location, or assigned employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-tags mr-2 text-blue-600"></i>Category
            </label>
            <div className="relative">
              <button
                type="button"
                className="category-button w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <span className={categoryFilter ? 'text-gray-900' : 'text-gray-500'}>
                  {categoryFilter || 'All Categories'}
                </span>
                <i className={`fas fa-chevron-down transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`}></i>
              </button>
              
              {showCategoryDropdown && (
                <div 
                  className="category-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  style={{ zIndex: 9999 }}
                >
                  <ul className="py-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => handleCategorySelect('')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                      >
                        <i className="fas fa-list text-gray-600 w-4"></i>
                        <span className="text-gray-900">All Categories</span>
                      </button>
                    </li>
                    {categories.map((category, index) => {
                      const categoryName = category.value || category.name;
                      const categoryKey = category.value ? `default-category-${category.value}-${index}` : `custom-category-${category.id || category.name}-${index}`;
                      const categoryIcon = getCategoryIcon(categoryName);
                      return (
                        <li key={categoryKey}>
                          <button
                            type="button"
                            onClick={() => handleCategorySelect(categoryName)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                          >
                            <i className={`${categoryIcon.icon} ${categoryIcon.color} w-4`}></i>
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
              <i className="fas fa-circle mr-2 text-green-600"></i>Status
            </label>
            <div className="relative">
              <button
                type="button"
                className="status-button w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <span className={statusFilter ? 'text-gray-900' : 'text-gray-500'}>
                  {statusFilter || 'All Statuses'}
                </span>
                <i className={`fas fa-chevron-down transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`}></i>
              </button>
              
              {showStatusDropdown && (
                <div 
                  className="status-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  style={{ zIndex: 9999 }}
                >
                  <ul className="py-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => handleStatusSelect('')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                      >
                        <i className="fas fa-list text-gray-600 w-4"></i>
                        <span className="text-gray-900">All Statuses</span>
                      </button>
                    </li>
                    {statuses.map((status, index) => {
                      const statusName = typeof status === 'object' ? status.name : status;
                      const statusKey = typeof status === 'object' ? `custom-status-${status.id || status.name}-${index}` : `default-status-${status}-${index}`;
                      const statusIcon = getStatusIcon(statusName);
                      return (
                        <li key={statusKey}>
                          <button
                            type="button"
                            onClick={() => handleStatusSelect(statusName)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                          >
                            <i className={`${statusIcon.icon} ${statusIcon.color} w-4`}></i>
                            <span className="text-gray-900">{statusName}</span>
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
              <i className="fas fa-building mr-2 text-orange-600"></i>Company
            </label>
            <div className="relative">
              <button
                type="button"
                className="company-button w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between"
                onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              >
                <span className={companyFilter ? 'text-gray-900' : 'text-gray-500'}>
                  {companyFilter || 'All Companies'}
                </span>
                <i className={`fas fa-chevron-down transition-transform duration-200 ${showCompanyDropdown ? 'rotate-180' : ''}`}></i>
              </button>
              
              {showCompanyDropdown && (
                <div 
                  className="company-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  style={{ zIndex: 9999 }}
                >
                  <ul className="py-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => handleCompanySelect('')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                      >
                        <i className="fas fa-list text-gray-600 w-4"></i>
                        <span className="text-gray-900">All Companies</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleCompanySelect('Axess Technology, Tidel')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                      >
                        <i className="fas fa-building text-blue-600 w-4"></i>
                        <span className="text-gray-900">Axess Technology, Tidel</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleCompanySelect('Axess Technology, Velachery')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                      >
                        <i className="fas fa-building text-green-600 w-4"></i>
                        <span className="text-gray-900">Axess Technology, Velachery</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleCompanySelect('V-Accel AI Dynamics Pvt Ltd')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                      >
                        <i className="fas fa-building text-purple-600 w-4"></i>
                        <span className="text-gray-900">V-Accel AI Dynamics Pvt Ltd</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-end">
            <button 
              className="w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 border border-gray-300 text-gray-700 hover:bg-gray-900 hover:text-white"
              onClick={clearFilters}
            >
              <i className="fas fa-times mr-1"></i>Clear
            </button>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h5 className="text-lg font-semibold text-gray-900 mb-0">
            Asset List ({filteredAssets.length} assets)
          </h5>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Asset ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Available Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Assigned Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                      </div>
                      <h5 className="text-lg font-medium text-gray-900 mb-2 mt-4">Loading Assets...</h5>
                      <p className="text-gray-500">Please wait while we fetch the asset data.</p>
                      <div className="mt-4 flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-red-500">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-exclamation-triangle text-6xl mb-4"></i>
                      <h5 className="text-lg font-medium text-gray-900 mb-2">Error: {error}</h5>
                      <p className="text-gray-500">Failed to load assets. Please check your connection and try again.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-boxes text-6xl text-gray-300 mb-4"></i>
                      <h5 className="text-lg font-medium text-gray-900 mb-2">No Assets Found</h5>
                      <p className="text-gray-500">Start by adding your first asset using the "Add Asset" button above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset, index) => (
                  <tr key={asset.assetId || asset._id || `asset-${index}`} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{asset.assetId || asset.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{asset.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-sm">
                        {asset.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getAvailableStatusClass(asset.assignedTo)}`}>
                        {asset.assignedTo ? 'Unavailable' : 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm">
                        {asset.location || 'Not Specified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {asset.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {asset.assignedDate ? formatDate(asset.assignedDate) : 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:scale-110 transition-all duration-300 shadow-sm"
                          onClick={() => handleViewAsset(asset)}
                          title="View"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="p-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 hover:scale-110 transition-all duration-300 shadow-sm"
                          onClick={() => handleEditAsset(asset)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:scale-110 transition-all duration-300 shadow-sm"
                          onClick={() => handleDeleteAsset(asset)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Modal */}
      <AssetModal
        show={showAssetModal}
        onHide={() => {
          setShowAssetModal(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        asset={editingAsset}
        categories={categories}
        statuses={statuses}
        employees={employees}
      />

      {/* View Asset Modal */}
      <ViewAssetModal
        show={showViewModal}
        onHide={() => {
          setShowViewModal(false);
          setViewingAsset(null);
        }}
        asset={viewingAsset}
        employees={employees}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setDeletingAsset(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Asset"
        message={`Are you sure you want to delete the asset "${deletingAsset?.name}"? This action cannot be undone.`}
      />

      {/* Notification */}
      <Notification
        show={notification.show}
        onHide={() => setNotification({ show: false, message: '', type: 'info' })}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
};

export default Assets;
