import React, { useState, useEffect } from 'react';
import EmployeeModal from '../components/EmployeeModal';
import DeleteModal from '../components/DeleteModal';
import ViewEmployeeModal from '../components/ViewEmployeeModal';
import Notification from '../components/Notification';
import dataService from '../services/dataService';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeModalErrors, setEmployeeModalErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  
  // Dropdown states
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Helper function to show notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
  };

  // Load employees from API on component mount
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dataService.getEmployees();
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.warn('⚠️ Employees data is not an array:', data);
          setEmployees([]);
          return;
        }
        
        console.log('✅ Employees loaded from API:', data);
        setEmployees(data);
      } catch (error) {
        console.error('❌ Error loading employees:', error);
        setError('Failed to load employees');
        setEmployees([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  // Save employees to localStorage whenever employees change
  useEffect(() => {
    if (Array.isArray(employees) && employees.length > 0) {
      localStorage.setItem('employees', JSON.stringify(employees));
    }
  }, [employees]);

  // Filter employees based on search and filters
  useEffect(() => {
    let filtered = [...employees];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(employee => {
        // Search in name (full name or first + last name)
        const fullName = (employee.fullName || `${employee.firstName} ${employee.lastName}`).toLowerCase();
        const nameMatch = fullName.includes(query) || 
                         employee.firstName?.toLowerCase().includes(query) || 
                         employee.lastName?.toLowerCase().includes(query);
        
        // Search in employee ID
        const idMatch = employee.id?.toLowerCase().includes(query) || 
                       employee.employeeId?.toLowerCase().includes(query);
        
        // Search in email
        const emailMatch = employee.email?.toLowerCase().includes(query);
        
        // Search in phone number
        const phoneMatch = employee.phone?.toLowerCase().includes(query) ||
                          employee.phone?.replace(/\D/g, '').includes(query.replace(/\D/g, ''));
        
        // Search in department
        const departmentMatch = employee.department?.toLowerCase().includes(query);
        
        // Search in role/position
        const roleMatch = employee.position?.toLowerCase().includes(query) ||
                         employee.role?.toLowerCase().includes(query);
        
        return nameMatch || idMatch || emailMatch || phoneMatch || departmentMatch || roleMatch;
      });
    }

    // Apply department filter
    if (departmentFilter) {
      filtered = filtered.filter(employee => employee.department === departmentFilter);
    }

    // Apply role filter
    if (roleFilter) {
      filtered = filtered.filter(employee => employee.position === roleFilter);
    }

    // Sort employees by creation date (newest first) to match backend sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.dateCreated || 0);
      const dateB = new Date(b.createdAt || b.dateCreated || 0);
      return dateB - dateA; // Newest first
    });

    setFilteredEmployees(filtered);
  }, [employees, searchQuery, departmentFilter, roleFilter]);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeModalErrors({}); // Clear any previous errors
    setShowEmployeeModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setEmployeeModalErrors({}); // Clear any previous errors
    setShowEmployeeModal(true);
  };

  const handleViewEmployee = (employee) => {
    setViewingEmployee(employee);
    setShowViewModal(true);
  };

  const handleDeleteEmployee = (employee) => {
    setDeletingEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      // Handle asset assignment
      const { assignedAssets, ...employeeInfo } = employeeData;
      
      // Assign assets to employee if any were selected
      if (assignedAssets && assignedAssets.length > 0) {
        for (const asset of assignedAssets) {
          // Update the asset to assign it to this employee
          const updatedAsset = {
            ...asset,
            assignedTo: employeeInfo.firstName + ' ' + employeeInfo.lastName,
            assignedDate: new Date().toISOString()
          };
          await dataService.updateAsset(asset.id, updatedAsset);
        }
        console.log('✅ Assets assigned to employee successfully');
        
        // Note: Assets will be refreshed when the modal reopens
      }

      if (editingEmployee) {
        // Update existing employee
        console.log('🔍 Updating employee with ID:', editingEmployee.id);
        console.log('🔍 Employee data to update:', employeeInfo);
        const updatedEmployee = await dataService.updateEmployee(editingEmployee.id, employeeInfo);
        console.log('🔍 Updated employee response:', updatedEmployee);
        
        // Update local state
        setEmployees(prevEmployees => {
          const updated = Array.isArray(prevEmployees) ? prevEmployees.map(employee => {
            if (employee.id === editingEmployee.id) {
              console.log('🔍 Updating employee in list:', employee.id, 'with data:', updatedEmployee);
              return { ...updatedEmployee, id: editingEmployee.id };
            }
            return employee;
          }) : [];
          console.log('🔍 Updated employees list:', updated);
          return updated;
        });
        
        console.log('✅ Employee updated successfully:', updatedEmployee);
        showNotification('Employee updated successfully!', 'success');
      } else {
        // Add new employee
        const savedEmployee = await dataService.createEmployee(employeeInfo);
        
        // Update local state - add at the beginning to match backend sorting (newest first)
        // Ensure the saved employee has a createdAt timestamp for consistent sorting
        const employeeWithTimestamp = {
          ...savedEmployee,
          createdAt: savedEmployee.createdAt || new Date().toISOString()
        };
        setEmployees(prevEmployees => [employeeWithTimestamp, ...prevEmployees]);
        
        console.log('✅ Employee created successfully:', savedEmployee);
        showNotification('Employee created successfully!', 'success');
      }
      
      setShowEmployeeModal(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('❌ Error saving employee:', error);
      
      // Check if it's a validation error
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.type === 'validation') {
          // Set validation errors in the modal
          setEmployeeModalErrors(errorData.errors);
          return; // Don't close modal, let user fix errors
        }
      } catch {
        // Not a validation error, show general error
        showNotification(`Failed to save employee: ${error.message}`, 'error');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingEmployee) {
      try {
        // Delete employee from API
        await dataService.deleteEmployee(deletingEmployee.id);
        
        // Remove employee's assigned assets from assets list
        const savedAssets = localStorage.getItem('assets');
        if (savedAssets) {
          try {
            const assets = JSON.parse(savedAssets);
            const updatedAssets = assets.filter(asset => asset.assignedTo !== deletingEmployee.name);
            localStorage.setItem('assets', JSON.stringify(updatedAssets));
          } catch (error) {
            console.error('Error updating assets after employee deletion:', error);
          }
        }

        // Update local state
        setEmployees(prevEmployees => Array.isArray(prevEmployees) ? prevEmployees.filter(employee => employee.id !== deletingEmployee.id) : []);
        
        console.log('✅ Employee deleted successfully:', deletingEmployee.id);
      } catch (error) {
        console.error('❌ Error deleting employee:', error);
        showNotification(`Failed to delete employee: ${error.message}`, 'error');
      } finally {
        setShowDeleteModal(false);
        setDeletingEmployee(null);
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('');
    setRoleFilter('');
  };

  // Dropdown handlers
  const handleDepartmentSelect = (department) => {
    setDepartmentFilter(department);
    setShowDepartmentDropdown(false);
  };

  const handleRoleSelect = (role) => {
    setRoleFilter(role);
    setShowRoleDropdown(false);
  };

  // Get department icon
  const getDepartmentIcon = (department) => {
    switch (department) {
      case 'HR':
        return { icon: 'fas fa-users', color: 'text-purple-600' };
      case 'IT':
        return { icon: 'fas fa-laptop-code', color: 'text-blue-600' };
      case 'Finance':
        return { icon: 'fas fa-calculator', color: 'text-green-600' };
      case 'Marketing':
        return { icon: 'fas fa-bullhorn', color: 'text-orange-600' };
      case 'Sales':
        return { icon: 'fas fa-chart-line', color: 'text-red-600' };
      default:
        return { icon: 'fas fa-building', color: 'text-gray-600' };
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'Manager':
        return { icon: 'fas fa-user-tie', color: 'text-blue-600' };
      case 'Developer':
        return { icon: 'fas fa-code', color: 'text-green-600' };
      case 'Designer':
        return { icon: 'fas fa-paint-brush', color: 'text-purple-600' };
      case 'Analyst':
        return { icon: 'fas fa-chart-bar', color: 'text-orange-600' };
      default:
        return { icon: 'fas fa-user', color: 'text-gray-600' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Load custom departments and roles from settings
  const [customDepartments, setCustomDepartments] = useState([]);
  const [customRoles, setCustomRoles] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [customStatuses, setCustomStatuses] = useState([]);

  // Load custom data on component mount
  useEffect(() => {
    // Load employee settings
    const employeeSettings = localStorage.getItem('employeePageSettings');
    if (employeeSettings) {
      try {
        const settings = JSON.parse(employeeSettings);
        if (settings.customDepartments) {
          setCustomDepartments(settings.customDepartments);
        }
        if (settings.customRoles) {
          setCustomRoles(settings.customRoles);
        }
      } catch (error) {
        console.error('Error loading employee settings:', error);
      }
    }

    // Load asset settings for asset creation form
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
      // Close department dropdown
      if (showDepartmentDropdown) {
        const dropdown = document.querySelector('.department-dropdown');
        const button = document.querySelector('.department-button');
        if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
          setShowDepartmentDropdown(false);
        }
      }
      
      // Close role dropdown
      if (showRoleDropdown) {
        const dropdown = document.querySelector('.role-dropdown');
        const button = document.querySelector('.role-button');
        if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
          setShowRoleDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDepartmentDropdown, showRoleDropdown]);

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

  // Combine default and custom departments
  const defaultDepartments = ['IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Sales', 'Engineering'];
  const departments = [...defaultDepartments, ...customDepartments];

  // Combine default and custom roles
  const defaultRoles = ['Admin', 'Manager', 'Employee', 'Intern', 'Senior', 'Junior'];
  const roles = [...defaultRoles, ...customRoles];

  // Combine default and custom categories for asset creation
  const defaultCategories = [
    { value: 'IT Equipment', icon: 'fas fa-desktop' },
    { value: 'Office Furniture', icon: 'fas fa-couch' },
    { value: 'Vehicles', icon: 'fas fa-car' },
    { value: 'Machinery', icon: 'fas fa-cogs' },
    { value: 'Tools', icon: 'fas fa-wrench' },
    { value: 'Electronics', icon: 'fas fa-laptop' },
    { value: 'Software', icon: 'fas fa-code' }
  ];

  // Combine default and custom statuses for asset creation
  const defaultStatuses = ['Active', 'Relieved', 'Maintenance', 'Retired'];

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
            <p className="text-gray-600 mt-1">Manage your organization's employees and their asset assignments</p>
          </div>
          <button 
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border-none bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg hover:from-gray-700 hover:to-gray-800 hover:transform hover:-translate-y-1 hover:shadow-xl group"
            onClick={handleAddEmployee}
          >
            <i className="fas fa-plus mr-2 group-hover:rotate-90 transition-transform duration-300"></i>Add New Employee
          </button>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Employees</p>
                              <h3 className="text-3xl font-bold text-gray-900">{Array.isArray(employees) ? employees.length : 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-2xl text-white">
              <i className="fas fa-users"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Active Employees</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {Array.isArray(employees) ? employees.filter(emp => emp.status === 'Active').length : 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center text-2xl text-white">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Departments</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {Array.isArray(employees) ? new Set(employees.map(emp => emp.department)).size : 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl text-white">
              <i className="fas fa-building"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Assets Assigned</p>
              <h3 className="text-3xl font-bold text-gray-900">0</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-yellow-600 flex items-center justify-center text-2xl text-white">
              <i className="fas fa-boxes"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="searchInput" className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-search mr-2 text-purple-600"></i>Search Employees
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pl-12 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                id="searchInput"
                placeholder="Search by name, ID, email, phone, department, or role..."
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
              <i className="fas fa-building mr-2 text-blue-600"></i>Department
            </label>
            <div className="relative">
              <button
                type="button"
                className="department-button w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between"
                onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
              >
                <span className={departmentFilter ? 'text-gray-900' : 'text-gray-500'}>
                  {departmentFilter || 'All Departments'}
                </span>
                <i className={`fas fa-chevron-down transition-transform duration-200 ${showDepartmentDropdown ? 'rotate-180' : ''}`}></i>
              </button>
              
              {showDepartmentDropdown && (
                <div 
                  className="department-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  style={{ zIndex: 9999 }}
                >
                  <ul className="py-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => handleDepartmentSelect('')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                      >
                        <i className="fas fa-list text-gray-600 w-4"></i>
                        <span className="text-gray-900">All Departments</span>
                      </button>
                    </li>
                    {departments.map((dept, index) => {
                      const deptName = typeof dept === 'object' ? dept.name : dept;
                      const deptKey = typeof dept === 'object' ? `custom-dept-${dept.id || dept.name}-${index}` : `default-dept-${dept}-${index}`;
                      const deptIcon = getDepartmentIcon(deptName);
                      return (
                        <li key={deptKey}>
                          <button
                            type="button"
                            onClick={() => handleDepartmentSelect(deptName)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                          >
                            <i className={`${deptIcon.icon} ${deptIcon.color} w-4`}></i>
                            <span className="text-gray-900">{deptName}</span>
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
              <i className="fas fa-user-tie mr-2 text-green-600"></i>Role
            </label>
            <div className="relative">
              <button
                type="button"
                className="role-button w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              >
                <span className={roleFilter ? 'text-gray-900' : 'text-gray-500'}>
                  {roleFilter || 'All Roles'}
                </span>
                <i className={`fas fa-chevron-down transition-transform duration-200 ${showRoleDropdown ? 'rotate-180' : ''}`}></i>
              </button>
              
              {showRoleDropdown && (
                <div 
                  className="role-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  style={{ zIndex: 9999 }}
                >
                  <ul className="py-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => handleRoleSelect('')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                      >
                        <i className="fas fa-list text-gray-600 w-4"></i>
                        <span className="text-gray-900">All Roles</span>
                      </button>
                    </li>
                    {roles.map((role, index) => {
                      const roleName = typeof role === 'object' ? role.name : role;
                      const roleKey = typeof role === 'object' ? `custom-role-${role.id || role.name}-${index}` : `default-role-${role}-${index}`;
                      const roleIcon = getRoleIcon(roleName);
                      return (
                        <li key={roleKey}>
                          <button
                            type="button"
                            onClick={() => handleRoleSelect(roleName)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                          >
                            <i className={`${roleIcon.icon} ${roleIcon.color} w-4`}></i>
                            <span className="text-gray-900">{roleName}</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
            <button 
              className="w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 border border-gray-300 bg-white text-gray-700 focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
              onClick={clearFilters}
            >
              <i className="fas fa-times mr-1"></i>Clear
            </button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h5 className="text-lg font-semibold text-gray-900 mb-0">
            Employee List ({filteredEmployees.length} employees)
          </h5>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Hire Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                      </div>
                      <h5 className="text-lg font-medium text-gray-900 mb-2 mt-4">Loading Employees...</h5>
                      <p className="text-gray-500">{error || 'Please wait while we fetch the employee data.'}</p>
                      <div className="mt-4 flex space-x-1">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
                      <h5 className="text-lg font-medium text-gray-900 mb-2">No Employees Found</h5>
                      <p className="text-gray-500">No employees match your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(employee => (
                  <tr key={employee.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{employee.employeeId || employee.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{employee.fullName || `${employee.firstName} ${employee.lastName}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-600 text-white">
                        {employee.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{employee.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{employee.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{formatDate(employee.hireDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          employee.status === 'Active' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm'
                        }`}>
                          {employee.status}
                        </span>
                        {employee.handoverDetails && (employee.status === 'Relieved' || employee.status === 'Terminated') && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 shadow-sm flex items-center gap-1" title={`Handover to: ${employee.handoverDetails.handoverTo}`}>
                            <i className="fas fa-handshake text-xs"></i>
                            Handover
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:scale-110 transition-all duration-300 shadow-sm"
                          onClick={() => handleViewEmployee(employee)}
                          title="View"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="p-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 hover:scale-110 transition-all duration-300 shadow-sm" 
                          onClick={() => handleEditEmployee(employee)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:scale-110 transition-all duration-300 shadow-sm"
                          onClick={() => handleDeleteEmployee(employee)}
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

      {/* Employee Modal */}
      <EmployeeModal
        show={showEmployeeModal}
        onHide={() => {
          setShowEmployeeModal(false);
          setEditingEmployee(null);
          setEmployeeModalErrors({}); // Clear errors when closing
        }}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
        employees={employees} // Pass employees list for handover functionality
        departments={departments}
        roles={roles}
        categories={categories}
        statuses={statuses}
        validationErrors={employeeModalErrors}
      />

      {/* View Employee Modal */}
      <ViewEmployeeModal
        show={showViewModal}
        onHide={() => {
          setShowViewModal(false);
          setViewingEmployee(null);
        }}
        employee={viewingEmployee}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setDeletingEmployee(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete the employee "${deletingEmployee?.name}"? This action cannot be undone.`}
      />

      {/* Notification */}
      <Notification
        show={notification.show}
        onHide={() => setNotification({ show: false, message: '', type: 'info' })}
        message={notification.message}
        type={notification.type}
      />
      {/* closes p-6 space-y-6 wrapper */}
    </div>
  );
};

export default Employees;
