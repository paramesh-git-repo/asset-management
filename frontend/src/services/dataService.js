import { assetAPI, employeeAPI, dashboardAPI } from './api';
import config from '../config/config';

// Data Service with API + localStorage fallback
class DataService {
  constructor() {
    this.useAPI = true; // Set to false to use localStorage only
    this.offlineMode = false;
  }

  // Check if API is available
  async checkAPIConnection() {
    try {
      await fetch(`${config.API_BASE_URL}/health`, { method: 'GET' });
      this.useAPI = true;
      this.offlineMode = false;
      return true;
    } catch (error) {
      this.useAPI = false;
      this.offlineMode = true;
      console.warn('API not available, falling back to localStorage');
      return false;
    }
  }

  // Asset operations
  async getAssets() {
    try {
      console.log('🔍 DataService.getAssets: Attempting API call...');
      const response = await assetAPI.getAll();
      console.log('✅ DataService.getAssets: Successfully loaded from API:', response);
      
      // Handle API response format: {status, data, pagination}
      let assets;
      if (response && typeof response === 'object' && 'data' in response) {
        assets = response.data;
        console.log('🔍 Extracted assets data from response:', assets);
      } else {
        assets = response;
        console.log('🔍 Using response directly as assets data:', assets);
      }
      
      // Ensure we always return an array
      if (!Array.isArray(assets)) {
        console.warn('⚠️ API returned non-array, converting to array:', assets);
        return [];
      }
      
      return assets;
    } catch (error) {
      console.warn('⚠️ DataService.getAssets: API failed, falling back to localStorage:', error.message);
      const fallbackAssets = this.loadFromLocalStorage("assets");
      console.log('📦 DataService.getAssets: Loaded from localStorage fallback:', fallbackAssets);
      
      // Ensure fallback also returns an array
      if (!Array.isArray(fallbackAssets)) {
        console.warn('⚠️ localStorage fallback returned non-array, converting to array:', fallbackAssets);
        return [];
      }
      
      return fallbackAssets;
    }
  }

  async createAsset(assetData) {
    try {
      console.log('🔍 DataService.createAsset called with:', JSON.stringify(assetData, null, 2));
      console.log('📦 Payload:', assetData);
      console.log('🚀 Sending to API:', JSON.stringify(assetData));
      
      if (this.useAPI) {
        const result = await assetAPI.create(assetData);
        console.log('✅ API createAsset success:', result);
        
        // Handle API response format: {status, message, data}
        if (result && typeof result === 'object' && 'data' in result) {
          console.log('🔍 Extracted asset data from API response:', result.data);
          return result.data;
        } else {
          console.log('🔍 Using API response directly as asset data:', result);
          return result;
        }
      } else {
        const result = this.createAssetInStorage(assetData);
        console.log('📦 Storage createAsset fallback:', result);
        return result;
      }
    } catch (error) {
      console.error('❌ DataService.createAsset error:', error);
      throw error;
    }
  }

  async updateAsset(id, assetData) {
    if (this.useAPI) {
      try {
        const response = await assetAPI.update(id, assetData);
        
        // Handle API response format: {status, message, data}
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        } else {
          return response;
        }
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        return this.updateAssetInStorage(id, assetData);
      }
    }
    return this.updateAssetInStorage(id, assetData);
  }

  async deleteAsset(id) {
    if (this.useAPI) {
      try {
        await assetAPI.delete(id);
        return true;
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        return this.deleteAssetFromStorage(id);
      }
    }
    return this.deleteAssetFromStorage(id);
  }

  // Helper method to load data from localStorage
  loadFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`❌ Error loading from localStorage for ${key}:`, error);
      return [];
    }
  }

  // Employee operations
  async getEmployees() {
    try {
      console.log('🔍 DataService.getEmployees: Attempting API call...');
      console.log('🔍 Token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
      const response = await employeeAPI.getAll();
      console.log('✅ DataService.getEmployees: Successfully loaded from API:', response);
      
      // Handle API response format: {status, data, pagination}
      let employees;
      if (response && typeof response === 'object' && 'data' in response) {
        employees = response.data;
        console.log('🔍 Extracted employees data from response:', employees);
      } else {
        employees = response;
        console.log('🔍 Using response directly as employees data:', employees);
      }
      
      // Ensure we always return an array
      if (!Array.isArray(employees)) {
        console.warn('⚠️ API returned non-array, converting to array:', employees);
        return [];
      }
      
      return employees;
    } catch (error) {
      // Check if it's a token expiration error
      if (error.message.includes('Session expired') || error.message.includes('Token expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      console.warn('⚠️ DataService.getEmployees: API failed, falling back to localStorage:', error.message);
      const fallbackEmployees = this.loadFromLocalStorage("employees");
      console.log('📦 DataService.getEmployees: Loaded from localStorage fallback:', fallbackEmployees);
      
      // Ensure fallback also returns an array
      if (!Array.isArray(fallbackEmployees)) {
        console.warn('⚠️ localStorage fallback returned non-array, converting to array:', fallbackEmployees);
        return [];
      }
      
      return fallbackEmployees;
    }
  }

  async createEmployee(employeeData) {
    if (this.useAPI) {
      try {
        const response = await employeeAPI.create(employeeData);
        return response.data;
      } catch (error) {
        // Check if it's a validation error
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.type === 'validation') {
            throw error; // Re-throw validation errors to be handled by UI
          }
        } catch {
          // Check if it's a token expiration error
          if (error.message.includes('Session expired') || error.message.includes('Token expired')) {
            throw error; // Re-throw token expiration errors
          }
          // Not a validation or token error, fall back to localStorage
          console.warn('API failed, falling back to localStorage:', error);
          return this.createEmployeeInStorage(employeeData);
        }
        throw error; // Re-throw other errors
      }
    }
    return this.createEmployeeInStorage(employeeData);
  }

  async updateEmployee(id, employeeData) {
    if (this.useAPI) {
      try {
        const response = await employeeAPI.update(id, employeeData);
        return response.data;
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        return this.updateEmployeeInStorage(id, employeeData);
      }
    }
    return this.updateEmployeeInStorage(id, employeeData);
  }

  async deleteEmployee(id) {
    if (this.useAPI) {
      try {
        await employeeAPI.delete(id);
        return true;
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        return this.deleteEmployeeFromStorage(id);
      }
    }
    return this.deleteEmployeeFromStorage(id);
  }

  // Dashboard operations
  async getDashboardData() {
    if (this.useAPI) {
      try {
        const response = await dashboardAPI.getOverview();
        return response.data;
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        return this.getDashboardDataFromStorage();
      }
    }
    return this.getDashboardDataFromStorage();
  }

  // LocalStorage fallback methods
  getAssetsFromStorage() {
    try {
      const assets = localStorage.getItem(config.STORAGE_KEYS.ASSETS);
      return assets ? JSON.parse(assets) : [];
    } catch (error) {
      console.error('Error reading assets from localStorage:', error);
      return [];
    }
  }

  createAssetInStorage(assetData) {
    try {
      const assets = this.getAssetsFromStorage();
      const newAsset = {
        ...assetData,
        id: `AST${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      assets.push(newAsset);
      localStorage.setItem(config.STORAGE_KEYS.ASSETS, JSON.stringify(assets));
      return newAsset;
    } catch (error) {
      console.error('Error creating asset in localStorage:', error);
      throw error;
    }
  }

  updateAssetInStorage(id, assetData) {
    try {
      const assets = this.getAssetsFromStorage();
      const index = assets.findIndex(asset => asset.id === id);
      if (index !== -1) {
        assets[index] = { ...assets[index], ...assetData, updatedAt: new Date().toISOString() };
        localStorage.setItem(config.STORAGE_KEYS.ASSETS, JSON.stringify(assets));
        return assets[index];
      }
      throw new Error('Asset not found');
    } catch (error) {
      console.error('Error updating asset in localStorage:', error);
      throw error;
    }
  }

  deleteAssetFromStorage(id) {
    try {
      const assets = this.getAssetsFromStorage();
      const filteredAssets = assets.filter(asset => asset.id !== id);
      localStorage.setItem(config.STORAGE_KEYS.ASSETS, JSON.stringify(filteredAssets));
      return true;
    } catch (error) {
      console.error('Error deleting asset from localStorage:', error);
      return false;
    }
  }

  getEmployeesFromStorage() {
    try {
      const employees = localStorage.getItem(config.STORAGE_KEYS.EMPLOYEES);
      return employees ? JSON.parse(employees) : [];
    } catch (error) {
      console.error('Error reading employees from localStorage:', error);
      return [];
    }
  }

  createEmployeeInStorage(employeeData) {
    try {
      const employees = this.getEmployeesFromStorage();
      const newEmployee = {
        ...employeeData,
        id: `EMP${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      employees.push(newEmployee);
      localStorage.setItem(config.STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
      return newEmployee;
    } catch (error) {
      console.error('Error creating employee in localStorage:', error);
      throw error;
    }
  }

  updateEmployeeInStorage(id, employeeData) {
    try {
      const employees = this.getEmployeesFromStorage();
      const index = employees.findIndex(emp => emp.id === id);
      if (index !== -1) {
        employees[index] = { ...employees[index], ...employeeData, updatedAt: new Date().toISOString() };
        localStorage.setItem(config.STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
        return employees[index];
      }
      throw new Error('Employee not found');
    } catch (error) {
      console.error('Error updating employee in localStorage:', error);
      throw error;
    }
  }

  deleteEmployeeFromStorage(id) {
    try {
      const employees = this.getEmployeesFromStorage();
      const filteredEmployees = employees.filter(emp => emp.id !== id);
      localStorage.setItem(config.STORAGE_KEYS.EMPLOYEES, JSON.stringify(filteredEmployees));
      return true;
    } catch (error) {
      console.error('Error deleting employee from localStorage:', error);
      return false;
    }
  }

  getDashboardDataFromStorage() {
    try {
      const assets = this.getAssetsFromStorage();
      const employees = this.getEmployeesFromStorage();
      
      return {
        assets: {
          total: assets.length,
          active: assets.filter(a => a.status === 'Active').length,
          maintenance: assets.filter(a => a.status === 'Maintenance').length,
          retired: assets.filter(a => a.status === 'Retired').length,
          assigned: assets.filter(a => a.assignedTo).length,
        },
        employees: {
          total: employees.length,
          active: employees.filter(e => e.status === 'Active').length,
          departments: [...new Set(employees.map(e => e.department))].length,
        },
        categories: this.getAssetCategories(assets),
      };
    } catch (error) {
      console.error('Error getting dashboard data from localStorage:', error);
      return { assets: {}, employees: {}, categories: {} };
    }
  }

  getAssetCategories(assets) {
    const categories = {};
    assets.forEach(asset => {
      if (asset.category) {
        if (!categories[asset.category]) {
          categories[asset.category] = 0;
        }
        categories[asset.category]++;
      }
    });
    return categories;
  }

  // Sync localStorage with API (for when connection is restored)
  async syncWithAPI() {
    if (!this.useAPI) return false;
    
    try {
      // Sync assets
      const localAssets = this.getAssetsFromStorage();
      for (const asset of localAssets) {
        if (!asset.syncedWithAPI) {
          await assetAPI.create(asset);
          asset.syncedWithAPI = true;
        }
      }
      
      // Sync employees
      const localEmployees = this.getEmployeesFromStorage();
      for (const employee of localEmployees) {
        if (!employee.syncedWithAPI) {
          await employeeAPI.create(employee);
          employee.syncedWithAPI = true;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing with API:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const dataService = new DataService();
export default dataService;
