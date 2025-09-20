import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';
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
    const activeClass = "border-gray-800 text-gray-900 bg-gray-50 shadow-sm";
    const inactiveClass = "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300";
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

  // Profile handlers
  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('File size must be less than 2MB');
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to localStorage
      localStorage.setItem('settings', JSON.stringify({
        general: generalSettings,
        appearance,
        security,
        profile
      }));
      
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-600 mt-1">Configure your application preferences</p>
            {saveMessage && (
              <div className={`mt-2 text-sm font-medium ${saveMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                <i className={`fas ${saveMessage.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                {saveMessage}
              </div>
            )}
          </div>
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border-none bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg hover:from-gray-700 hover:to-gray-800 hover:transform hover:-translate-y-1 hover:shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'} mr-2 group-hover:animate-bounce`}></i>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
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
              </div>
            </div>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Profile</h3>
                
                {/* Profile Picture */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <i className="fas fa-camera mr-2 text-blue-600"></i>Profile Picture
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
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
                      <p className="text-sm text-gray-600 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.firstName}
                        onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.lastName}
                        onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.dateOfBirth}
                        onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.address}
                        onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.employeeId}
                        onChange={(e) => setProfile(prev => ({ ...prev, employeeId: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.department}
                        onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.position}
                        onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.manager}
                        onChange={(e) => setProfile(prev => ({ ...prev, manager: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.hireDate}
                        onChange={(e) => setProfile(prev => ({ ...prev, hireDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-300 text-gray-900 bg-white focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10"
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
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
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
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
    </div>
  );
};

export default Settings;
