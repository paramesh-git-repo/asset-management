import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import AssetPageSettingsModal from '../components/AssetPageSettingsModal';
import EmployeePageSettingsModal from '../components/EmployeePageSettingsModal';
import UserManagement from '../components/UserManagement';
import Notification from '../components/Notification';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [appearance, setAppearance] = useState({
    theme: 'light',
    sidebarCollapsed: false,
    showTooltips: true,
    fontSize: 'medium'
  });
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: 30,
    passwordExpiry: 90
  });
  
  const [profile, setProfile] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    department: 'IT',
    position: 'System Administrator',
    avatar: user?.avatar || null,
    bio: 'Experienced system administrator with expertise in asset management and IT infrastructure.',
    address: '123 Main Street, City, State 12345',
    dateOfBirth: '1985-06-15',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+1 (555) 987-6543',
    hireDate: '2020-01-15',
    employeeId: 'EMP001',
    manager: 'Sarah Johnson',
    location: 'New York Office'
  });

  // Profile validation and password change states
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  
  // Modal states
  const [showAssetPageSettings, setShowAssetPageSettings] = useState(false);
  const [showEmployeePageSettings, setShowEmployeePageSettings] = useState(false);
  
  // Dropdown states
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  
  // Form data
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Asset Management Corp'
  });

  const getTabButtonClass = (tab) => {
    const baseClass = "px-4 py-3 rounded-xl font-medium transition-all duration-300 border-b-2 relative group";
    const activeClass = "border-accent-primary text-primary bg-tertiary shadow-theme-sm";
    const inactiveClass = "border-transparent text-secondary hover:text-primary hover:bg-tertiary hover:border-accent-primary";
    return `${baseClass} ${activeTab === tab ? activeClass : inactiveClass}`;
  };

  // Helper functions for dropdown icons and colors

  const getThemeIcon = (theme) => {
    switch (theme) {
      case 'light':
        return { icon: 'fas fa-sun', color: 'text-yellow-600' };
      case 'dark':
        return { icon: 'fas fa-moon', color: 'text-indigo-600' };
      case 'auto':
        return { icon: 'fas fa-adjust', color: 'text-gray-600' };
      default:
        return { icon: 'fas fa-sun', color: 'text-gray-600' };
    }
  };

  // Dropdown handlers

  const handleThemeSelect = (theme) => {
    setAppearance(prev => ({ ...prev, theme }));
    setShowThemeDropdown(false);
    // Apply theme immediately for better UX
    document.documentElement.setAttribute('data-theme', theme);
    
    // Add visual feedback
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  };

  // Initialize appearance settings on mount
  useEffect(() => {
    // Load saved settings from localStorage and update state
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.appearance) {
          // Update state to reflect saved settings
          setAppearance(prev => ({
            ...prev,
            theme: settings.appearance.theme || 'light',
            fontSize: settings.appearance.fontSize || 'medium',
            showTooltips: settings.appearance.showTooltips !== undefined ? settings.appearance.showTooltips : true,
            sidebarCollapsed: settings.appearance.sidebarCollapsed !== undefined ? settings.appearance.sidebarCollapsed : false
          }));
        }
        if (settings.profile) {
          // Load saved profile data
          setProfile(prev => ({
            ...prev,
            ...settings.profile
          }));
        }
        if (settings.security) {
          // Load saved security settings
          setSecurity(prev => ({
            ...prev,
            ...settings.security
          }));
        }
        if (settings.general) {
          // Load saved general settings
          setGeneralSettings(prev => ({
            ...prev,
            ...settings.general
          }));
        }
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.theme-button') && !event.target.closest('.theme-dropdown')) {
        setShowThemeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleAppearanceChange = (key) => {
    setAppearance(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFontSizeChange = (size) => {
    setAppearance(prev => ({ ...prev, fontSize: size }));
    // Apply font size immediately
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    document.documentElement.style.setProperty('--base-font-size', sizeMap[size]);
  };

  // Profile validation function
  const validateProfile = () => {
    const errors = {};
    
    if (!profile.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!profile.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!profile.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (profile.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(profile.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (!profile.department.trim()) {
      errors.department = 'Department is required';
    }
    if (!profile.position.trim()) {
      errors.position = 'Position is required';
    }
    if (!profile.employeeId.trim()) {
      errors.employeeId = 'Employee ID is required';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password validation function
  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Profile handlers
  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (profileErrors[field]) {
      setProfileErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Password change handler
  const handlePasswordChange = async () => {
    if (!validatePassword()) return;
    
    setIsChangingPassword(true);
    try {
      // Call the real API
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);
      setSaveMessage('Password changed successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Password change error:', error);
      setSaveMessage(error.message || 'Failed to change password. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'department', 'position', 'employeeId', 'address', 'dateOfBirth', 'emergencyContact', 'emergencyPhone', 'hireDate', 'manager', 'location', 'bio'];
    const completedFields = fields.filter(field => profile[field] && profile[field].toString().trim() !== '');
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarData = e.target.result;
        setProfile(prev => ({ ...prev, avatar: avatarData }));
        // Update auth context immediately
        updateProfile({ avatar: avatarData });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSecurityChange = (key) => {
    setSecurity(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };


  const exportData = () => {
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const assets = JSON.parse(localStorage.getItem('assets') || '[]');
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert employees data to worksheet
    if (employees.length > 0) {
      const employeesWS = XLSX.utils.json_to_sheet(employees);
      XLSX.utils.book_append_sheet(workbook, employeesWS, 'Employees');
    }
    
    // Convert assets data to worksheet
    if (assets.length > 0) {
      const assetsWS = XLSX.utils.json_to_sheet(assets);
      XLSX.utils.book_append_sheet(workbook, assetsWS, 'Assets');
    }
    
    // Add summary sheet
    const summaryData = [
      { 'Data Type': 'Employees', 'Count': employees.length },
      { 'Data Type': 'Assets', 'Count': assets.length },
      { 'Data Type': 'Export Date', 'Count': new Date().toISOString().split('T')[0] }
    ];
    const summaryWS = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Download the file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asset-management-data-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Redirect non-Admin users (after all hooks are declared)
  if (user?.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-lock text-6xl text-gray-400 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You need Admin privileges to access settings.</p>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Validate profile if we're on the profile tab
      if (activeTab === 'profile' && !validateProfile()) {
        setSaveMessage('Please fix the validation errors before saving.');
        setTimeout(() => setSaveMessage(''), 3000);
        setIsSaving(false);
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to localStorage
      localStorage.setItem('settings', JSON.stringify({
        general: generalSettings,
        appearance,
        security,
        profile
      }));
      
      // Update auth context if profile was updated
      if (activeTab === 'profile') {
        updateProfile({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          avatar: profile.avatar
        });
      }
      
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-primary rounded-xl shadow-theme-md p-6 border border-theme">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-primary">Settings</h2>
                <p className="text-secondary mt-2">Configure your application preferences and account settings</p>
                {saveMessage && (
                  <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                    saveMessage.includes('successfully') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <i className={`fas ${saveMessage.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                    {saveMessage}
                  </div>
                )}
              </div>
        </div>

          {/* Tab Navigation */}
          <div className="bg-primary rounded-xl shadow-theme-md border border-theme">
            <div className="border-b border-theme">
              <nav className="flex space-x-8 px-6">
            <button
              className={getTabButtonClass('general')}
              onClick={() => setActiveTab('general')}
            >
              <i className="fas fa-cog mr-2 group-hover:rotate-90 transition-transform duration-300"></i>General
            </button>
            <button
              className={getTabButtonClass('appearance')}
              onClick={() => setActiveTab('appearance')}
            >
              <i className="fas fa-palette mr-2 group-hover:animate-bounce transition-all duration-300"></i>Appearance
            </button>
            <button
              className={getTabButtonClass('security')}
              onClick={() => setActiveTab('security')}
            >
              <i className="fas fa-shield-alt mr-2 group-hover:scale-110 transition-transform duration-300"></i>Security
            </button>
            <button
              className={getTabButtonClass('profile')}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user mr-2 group-hover:scale-110 transition-transform duration-300"></i>Profile
            </button>
            <button
              className={getTabButtonClass('data')}
              onClick={() => setActiveTab('data')}
            >
              <i className="fas fa-database mr-2 group-hover:rotate-12 transition-transform duration-300"></i>Data Management
            </button>
            {user?.role === 'Admin' && (
              <button
                className={getTabButtonClass('users')}
                onClick={() => setActiveTab('users')}
              >
                <i className="fas fa-users mr-2 group-hover:scale-110 transition-transform duration-300"></i>User Management
              </button>
            )}
          </nav>
        </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-4">General Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Company Name</label>
                        <input
                          type="text"
                          className="w-full rounded-xl border border-theme px-4 py-3 transition-all duration-300 text-primary bg-primary focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10"
                          placeholder="Enter your company name"
                      defaultValue="Asset Management Corp"
                    />
                  </div>
                  
                  {/* Page Settings Buttons */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Page Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setShowAssetPageSettings(true)}
                        className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all duration-300 group"
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-700 transition-colors duration-300">
                            <i className="fas fa-boxes text-white text-xl"></i>
                          </div>
                          <h5 className="font-medium text-blue-900 mb-1">Asset Page Settings</h5>
                          <p className="text-sm text-blue-700">Configure asset management preferences</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setShowEmployeePageSettings(true)}
                        className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all duration-300 group"
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-700 transition-colors duration-300">
                            <i className="fas fa-users text-white text-xl"></i>
                          </div>
                          <h5 className="font-medium text-green-900 mb-1">Employee Page Settings</h5>
                          <p className="text-sm text-green-700">Configure employee management preferences</p>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Save Button for General Tab */}
                  <div className="pt-6 border-t border-theme">
                    <button 
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border-none bg-accent-primary text-white shadow-theme-md hover-accent hover:transform hover:-translate-y-1 hover:shadow-theme-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'} mr-2 group-hover:animate-bounce`}></i>
                      {isSaving ? 'Saving...' : 'Save General Settings'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h3>
                
                {/* Theme Selection */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <i className="fas fa-palette mr-2 text-purple-600"></i>Theme & Colors
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                      <div className="relative">
                        <button
                          type="button"
                          className="theme-button w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 text-left flex items-center justify-between"
                          onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                        >
                          <div className="flex items-center">
                            <i className={`${getThemeIcon(appearance.theme).icon} ${getThemeIcon(appearance.theme).color} mr-3`}></i>
                            <span className="capitalize">{appearance.theme}</span>
                          </div>
                          <i className="fas fa-chevron-down text-gray-400"></i>
                        </button>
                        
                        {showThemeDropdown && (
                          <div className="theme-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                            {[
                              { value: 'light', label: 'Light', icon: 'fas fa-sun', color: 'text-yellow-600' },
                              { value: 'dark', label: 'Dark', icon: 'fas fa-moon', color: 'text-indigo-600' },
                              { value: 'auto', label: 'Auto', icon: 'fas fa-adjust', color: 'text-gray-600' }
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center transition-colors duration-200"
                                onClick={() => handleThemeSelect(option.value)}
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
                </div>


                {/* Font Size */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <i className="fas fa-font mr-2 text-orange-600"></i>Typography
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                    <div className="flex space-x-3">
                      {[
                        { value: 'small', label: 'Small', size: 'text-sm' },
                        { value: 'medium', label: 'Medium', size: 'text-base' },
                        { value: 'large', label: 'Large', size: 'text-lg' }
                      ].map((size) => (
                        <button
                          key={size.value}
                          onClick={() => handleFontSizeChange(size.value)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                            appearance.fontSize === size.value 
                              ? 'border-gray-800 bg-gray-100 text-gray-900' 
                              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <span className={size.size}>{size.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Save Button for Appearance Tab */}
                <div className="pt-6 border-t border-theme">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border-none bg-accent-primary text-white shadow-theme-md hover-accent hover:transform hover:-translate-y-1 hover:shadow-theme-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'} mr-2 group-hover:animate-bounce`}></i>
                    {isSaving ? 'Saving...' : 'Save Appearance Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={security.twoFactor}
                        onChange={() => handleSecurityChange('twoFactor')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-800/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      min="5"
                      max="480"
                    />
                  </div>
                </div>
                
                {/* Save Button for Security Tab */}
                <div className="pt-6 border-t border-theme">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border-none bg-accent-primary text-white shadow-theme-md hover-accent hover:transform hover:-translate-y-1 hover:shadow-theme-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'} mr-2 group-hover:animate-bounce`}></i>
                    {isSaving ? 'Saving...' : 'Save Security Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
                  <div className="flex items-center space-x-4">
                    {/* Profile Completion Indicator */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Profile Completion:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                            style={{ width: `${getProfileCompletion()}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{getProfileCompletion()}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Profile Picture */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <i className="fas fa-camera mr-2 text-blue-600"></i>Profile Picture
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-lg">
                      {profile.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        `${profile.firstName[0]}${profile.lastName[0]}`
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="profilePicture"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="hidden"
                      />
                      <label 
                        htmlFor="profilePicture"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer inline-block"
                      >
                        <i className="fas fa-upload mr-2"></i>Upload Photo
                      </label>
                      <p className="text-sm text-gray-600 mt-1">JPG, PNG or GIF. Max size 10MB.</p>
                      {profile.avatar && (
                        <button 
                          onClick={() => {
                            setProfile(prev => ({ ...prev, avatar: null }));
                            updateProfile({ avatar: null });
                          }}
                          className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors duration-200"
                        >
                          <i className="fas fa-trash mr-1"></i>Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <i className="fas fa-user mr-2 text-green-600"></i>Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:ring-4 focus:ring-gray-800/10 ${
                          profileErrors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-800'
                        }`}
                        value={profile.firstName}
                        onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      />
                      {profileErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {profileErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:ring-4 focus:ring-gray-800/10 ${
                          profileErrors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-800'
                        }`}
                        value={profile.lastName}
                        onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      />
                      {profileErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {profileErrors.lastName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:ring-4 focus:ring-gray-800/10 ${
                          profileErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-800'
                        }`}
                        value={profile.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                      />
                      {profileErrors.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {profileErrors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:ring-4 focus:ring-gray-800/10 ${
                          profileErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-800'
                        }`}
                        value={profile.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                      {profileErrors.phone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {profileErrors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.dateOfBirth}
                        onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        placeholder="123 Main Street, City, State 12345"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <i className="fas fa-phone mr-2 text-red-600"></i>Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.emergencyContact}
                        onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.emergencyPhone}
                        onChange={(e) => setProfile(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <i className="fas fa-briefcase mr-2 text-purple-600"></i>Work Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID *</label>
                      <input
                        type="text"
                        className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:ring-4 focus:ring-gray-800/10 ${
                          profileErrors.employeeId ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-800'
                        }`}
                        value={profile.employeeId}
                        onChange={(e) => handleProfileChange('employeeId', e.target.value)}
                        placeholder="EMP001"
                      />
                      {profileErrors.employeeId && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {profileErrors.employeeId}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                      <input
                        type="text"
                        className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:ring-4 focus:ring-gray-800/10 ${
                          profileErrors.department ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-800'
                        }`}
                        value={profile.department}
                        onChange={(e) => handleProfileChange('department', e.target.value)}
                        placeholder="IT"
                      />
                      {profileErrors.department && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {profileErrors.department}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                      <input
                        type="text"
                        className={`w-full rounded-xl border px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:ring-4 focus:ring-gray-800/10 ${
                          profileErrors.position ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-800'
                        }`}
                        value={profile.position}
                        onChange={(e) => handleProfileChange('position', e.target.value)}
                        placeholder="System Administrator"
                      />
                      {profileErrors.position && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {profileErrors.position}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.manager}
                        onChange={(e) => handleProfileChange('manager', e.target.value)}
                        placeholder="Sarah Johnson"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.hireDate}
                        onChange={(e) => handleProfileChange('hireDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.location}
                        onChange={(e) => handleProfileChange('location', e.target.value)}
                        placeholder="New York Office"
                      />
                    </div>
                  </div>
                </div>




                {/* Password Change Section */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <i className="fas fa-lock mr-2 text-red-600"></i>Password & Security
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-gray-900">Change Password</h5>
                        <p className="text-sm text-gray-600">Update your account password for better security</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                      >
                        <i className={`fas ${showPasswordSection ? 'fa-chevron-up' : 'fa-chevron-down'} mr-2`}></i>
                        {showPasswordSection ? 'Hide' : 'Change Password'}
                      </button>
                    </div>
                    
                    {showPasswordSection && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password *</label>
                          <div className="relative">
                            <input
                              type={showPasswords.currentPassword ? "text" : "password"}
                              className={`w-full rounded-xl border px-4 py-3 pr-12 transition-all duration-300 text-gray-900 bg-white focus:ring-4 focus:ring-gray-800/10 ${
                                passwordErrors.currentPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-800'
                              }`}
                              value={passwordData.currentPassword}
                              onChange={(e) => {
                                setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }));
                                if (passwordErrors.currentPassword) {
                                  setPasswordErrors(prev => ({ ...prev, currentPassword: '' }));
                                }
                              }}
                              placeholder="Enter your current password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('currentPassword')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                              <i className={`fas ${showPasswords.currentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          </div>
                          {passwordErrors.currentPassword && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <i className="fas fa-exclamation-circle mr-1"></i>
                              {passwordErrors.currentPassword}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
                          <div className="relative">
                            <input
                              type={showPasswords.newPassword ? "text" : "password"}
                              className={`w-full rounded-xl border px-4 py-3 pr-12 transition-all duration-300 text-gray-900 bg-white focus:ring-4 focus:ring-gray-800/10 ${
                                passwordErrors.newPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-800'
                              }`}
                              value={passwordData.newPassword}
                              onChange={(e) => {
                                setPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                                if (passwordErrors.newPassword) {
                                  setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                                }
                              }}
                              placeholder="Enter your new password (min 8 characters)"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('newPassword')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                              <i className={`fas ${showPasswords.newPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          </div>
                          {passwordErrors.newPassword && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <i className="fas fa-exclamation-circle mr-1"></i>
                              {passwordErrors.newPassword}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password *</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirmPassword ? "text" : "password"}
                              className={`w-full rounded-xl border px-4 py-3 pr-12 transition-all duration-300 text-gray-900 bg-white focus:ring-4 focus:ring-gray-800/10 ${
                                passwordErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-800'
                              }`}
                              value={passwordData.confirmPassword}
                              onChange={(e) => {
                                setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                                if (passwordErrors.confirmPassword) {
                                  setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                                }
                              }}
                              placeholder="Confirm your new password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirmPassword')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                              <i className={`fas ${showPasswords.confirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          </div>
                          {passwordErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <i className="fas fa-exclamation-circle mr-1"></i>
                              {passwordErrors.confirmPassword}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <i className={`fas ${isChangingPassword ? 'fa-spinner fa-spin' : 'fa-key'} mr-2`}></i>
                            {isChangingPassword ? 'Changing...' : 'Change Password'}
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordSection(false);
                              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                              setPasswordErrors({});
                              setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
                            }}
                            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <i className="fas fa-file-alt mr-2 text-orange-600"></i>Bio
                  </h4>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 resize-none"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Data Management Settings */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Export Data</h4>
                    <p className="text-sm text-blue-700 mb-3">Download all your data as an Excel file (.xlsx) for backup purposes.</p>
                    <button
                      onClick={exportData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <i className="fas fa-download mr-2"></i>Export Data
                    </button>
                  </div>
                  
                </div>
              </div>
            </div>
          )}

          {/* User Management Tab */}
              {activeTab === 'users' && (
                <UserManagement />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Asset Page Settings Modal */}
      <AssetPageSettingsModal
        show={showAssetPageSettings}
        onHide={() => setShowAssetPageSettings(false)}
      />

      {/* Employee Page Settings Modal */}
      <EmployeePageSettingsModal
        show={showEmployeePageSettings}
        onHide={() => setShowEmployeePageSettings(false)}
      />

      {/* Notification */}
      <Notification
        show={saveMessage !== ''}
        onHide={() => setSaveMessage('')}
        message={saveMessage}
        type={saveMessage.includes('successfully') ? 'success' : 'error'}
      />
    </div>
  );
};

export default Settings;
