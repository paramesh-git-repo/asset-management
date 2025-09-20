const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const Employee = require('../models/Employee');

// Get timeline/activity data
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching timeline data...');
    
    // Get all assets with their history
    const assets = await Asset.find({}).sort({ updatedAt: -1 });
    
    // Get all employees with their history (if they have any)
    const employees = await Employee.find({}).sort({ updatedAt: -1 });
    
    const timelineData = [];
    
    // Process asset activities
    assets.forEach(asset => {
      if (asset.history && asset.history.length > 0) {
        asset.history.forEach(historyItem => {
          timelineData.push({
            id: historyItem.id || Date.now() + Math.random(),
            timestamp: historyItem.timestamp,
            title: historyItem.action,
            description: historyItem.details,
            type: 'assets',
            assetId: asset.assetId,
            assetName: asset.name,
            icon: getActivityIcon(historyItem.action),
            color: getActivityColor(historyItem.action)
          });
        });
      }
      
      // Add asset creation as an activity
      if (asset.createdAt) {
        timelineData.push({
          id: `asset-created-${asset._id}`,
          timestamp: asset.createdAt,
          title: 'Asset Created',
          description: `Asset "${asset.name}" (${asset.assetId}) was created`,
          type: 'assets',
          assetId: asset.assetId,
          assetName: asset.name,
          icon: 'fas fa-plus-circle',
          color: 'success'
        });
      }
    });
    
    // Process employee activities
    employees.forEach(employee => {
      if (employee.createdAt) {
        timelineData.push({
          id: `employee-created-${employee._id}`,
          timestamp: employee.createdAt,
          title: 'Employee Added',
          description: `Employee "${employee.fullName || `${employee.firstName} ${employee.lastName}`}" was added`,
          type: 'employees',
          employeeId: employee.id,
          employeeName: employee.fullName || `${employee.firstName} ${employee.lastName}`,
          icon: 'fas fa-user-plus',
          color: 'primary'
        });
      }
    });
    
    // Sort by timestamp (newest first)
    timelineData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log(`✅ Found ${timelineData.length} timeline activities`);
    
    res.json({
      status: 'success',
      data: timelineData,
      total: timelineData.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching timeline data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch timeline data',
      error: error.message
    });
  }
});

// Helper function to get appropriate icon for activity
function getActivityIcon(action) {
  const iconMap = {
    'Asset Created': 'fas fa-plus-circle',
    'Name Updated': 'fas fa-edit',
    'Category Changed': 'fas fa-tags',
    'Status Changed': 'fas fa-toggle-on',
    'Location Changed': 'fas fa-map-marker-alt',
    'Asset Assigned': 'fas fa-user-check',
    'Asset Unassigned': 'fas fa-user-times',
    'Description Updated': 'fas fa-align-left',
    'Asset Retired': 'fas fa-trash',
    'Asset Deleted': 'fas fa-trash-alt',
    'Employee Added': 'fas fa-user-plus',
    'Employee Updated': 'fas fa-user-edit',
    'Employee Deleted': 'fas fa-user-minus'
  };
  
  return iconMap[action] || 'fas fa-info-circle';
}

// Helper function to get appropriate color for activity
function getActivityColor(action) {
  const colorMap = {
    'Asset Created': 'success',
    'Name Updated': 'info',
    'Category Changed': 'info',
    'Status Changed': 'warning',
    'Location Changed': 'info',
    'Asset Assigned': 'primary',
    'Asset Unassigned': 'warning',
    'Description Updated': 'info',
    'Asset Retired': 'danger',
    'Asset Deleted': 'danger',
    'Employee Added': 'success',
    'Employee Updated': 'info',
    'Employee Deleted': 'danger'
  };
  
  return colorMap[action] || 'info';
}

module.exports = router;
