const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// GET dashboard overview statistics
router.get('/overview', authenticateToken, requirePermission('view_reports'), async (req, res) => {
  try {
    // Asset statistics
    const totalAssets = await Asset.countDocuments({ isActive: true });
    const activeAssets = await Asset.countDocuments({ status: 'Active', isActive: true });
    const maintenanceAssets = await Asset.countDocuments({ status: 'Maintenance', isActive: true });
    const retiredAssets = await Asset.countDocuments({ status: 'Retired', isActive: true });
    
    // Employee statistics
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const activeEmployees = await Employee.countDocuments({ status: 'Active', isActive: true });
    const onLeaveEmployees = await Employee.countDocuments({ status: 'On Leave', isActive: true });
    
    // Financial statistics
    const totalAssetValue = await Asset.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$currentValue' } } }
    ]);
    
    const totalPurchaseValue = await Asset.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$purchasePrice' } } }
    ]);
    
    // Recent activities
    const recentAssets = await Asset.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'firstName lastName employeeId');
    
    const recentEmployees = await Employee.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Category distribution
    const assetCategories = await Asset.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalValue: { $sum: '$currentValue' } } },
      { $sort: { count: -1 } }
    ]);
    
    // Department distribution
    const employeeDepartments = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Asset status distribution
    const assetStatuses = await Asset.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Monthly asset additions (last 12 months)
    const monthlyAssets = await Asset.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    
    // Asset age distribution
    const assetAgeDistribution = await Asset.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$purchaseDate'] },
                1000 * 60 * 60 * 24 * 365.25
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 1] }, then: 'Less than 1 year' },
                { case: { $lt: ['$age', 3] }, then: '1-3 years' },
                { case: { $lt: ['$age', 5] }, then: '3-5 years' },
                { case: { $lt: ['$age', 10] }, then: '5-10 years' }
              ],
              default: 'More than 10 years'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      status: 'success',
      data: {
        assets: {
          total: totalAssets,
          active: activeAssets,
          maintenance: maintenanceAssets,
          retired: retiredAssets,
          categories: assetCategories,
          statuses: assetStatuses,
          ageDistribution: assetAgeDistribution
        },
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          onLeave: onLeaveEmployees,
          departments: employeeDepartments
        },
        financial: {
          totalAssetValue: totalAssetValue[0]?.total || 0,
          totalPurchaseValue: totalPurchaseValue[0]?.total || 0,
          depreciation: (totalPurchaseValue[0]?.total || 0) - (totalAssetValue[0]?.total || 0)
        },
        recent: {
          assets: recentAssets,
          employees: recentEmployees
        },
        trends: {
          monthlyAssets
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard overview',
      error: error.message
    });
  }
});

// GET asset analytics
router.get('/assets/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Asset creation trend
    const assetTrend = await Asset.aggregate([
      { $match: { createdAt: { $gte: startDate }, isActive: true } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
    
    // Asset value by category
    const valueByCategory = await Asset.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$currentValue' },
          avgValue: { $avg: '$currentValue' }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);
    
    // Asset status distribution
    const statusDistribution = await Asset.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$currentValue' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Top valuable assets
    const topValuableAssets = await Asset.find({ isActive: true })
      .sort({ currentValue: -1 })
      .limit(10)
      .populate('assignedTo', 'firstName lastName employeeId department')
      .select('name assetId category currentValue assignedTo location');
    
    // Assets requiring maintenance
    const maintenanceNeeded = await Asset.find({
      isActive: true,
      $or: [
        { status: 'Maintenance' },
        { nextMaintenance: { $lte: new Date() } }
      ]
    })
    .populate('assignedTo', 'firstName lastName employeeId department')
    .select('name assetId category status nextMaintenance assignedTo')
    .limit(10);
    
    res.json({
      status: 'success',
      data: {
        assetTrend,
        valueByCategory,
        statusDistribution,
        topValuableAssets,
        maintenanceNeeded
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching asset analytics',
      error: error.message
    });
  }
});

// GET employee analytics
router.get('/employees/analytics', async (req, res) => {
  try {
    // Department distribution
    const departmentDistribution = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Employee status distribution
    const statusDistribution = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Salary distribution
    const salaryDistribution = await Employee.aggregate([
      { $match: { isActive: true, salary: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$salary', 30000] }, then: 'Under $30k' },
                { case: { $lt: ['$salary', 50000] }, then: '$30k - $50k' },
                { case: { $lt: ['$salary', 75000] }, then: '$50k - $75k' },
                { case: { $lt: ['$salary', 100000] }, then: '$75k - $100k' }
              ],
              default: 'Over $100k'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Top performers (based on performance reviews)
    const topPerformers = await Employee.aggregate([
      { $match: { isActive: true, 'performanceReviews.rating': { $exists: true } } },
      {
        $addFields: {
          avgRating: {
            $avg: '$performanceReviews.rating'
          }
        }
      },
      { $match: { avgRating: { $gte: 4 } } },
      { $sort: { avgRating: -1 } },
      { $limit: 10 },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          employeeId: 1,
          department: 1,
          position: 1,
          avgRating: 1
        }
      }
    ]);
    
    // Employee growth trend (last 12 months)
    const employeeGrowth = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            year: { $year: '$hireDate' },
            month: { $month: '$hireDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      status: 'success',
      data: {
        departmentDistribution,
        statusDistribution,
        salaryDistribution,
        topPerformers,
        employeeGrowth
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching employee analytics',
      error: error.message
    });
  }
});

// GET financial analytics
router.get('/financial/analytics', async (req, res) => {
  try {
    // Total asset value over time
    const assetValueOverTime = await Asset.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            year: { $year: '$purchaseDate' },
            month: { $month: '$purchaseDate' }
          },
          totalValue: { $sum: '$purchasePrice' },
          currentValue: { $sum: '$currentValue' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 24 }
    ]);
    
    // Depreciation by category
    const depreciationByCategory = await Asset.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalPurchaseValue: { $sum: '$purchasePrice' },
          totalCurrentValue: { $sum: '$currentValue' },
          depreciation: { $sum: { $subtract: ['$purchasePrice', '$currentValue'] } }
        }
      },
      { $sort: { depreciation: -1 } }
    ]);
    
    // Monthly maintenance costs
    const maintenanceCosts = await Asset.aggregate([
      { $match: { isActive: true, 'maintenanceHistory.cost': { $exists: true } } },
      { $unwind: '$maintenanceHistory' },
      {
        $group: {
          _id: {
            year: { $year: '$maintenanceHistory.date' },
            month: { $month: '$maintenanceHistory.date' }
          },
          totalCost: { $sum: '$maintenanceHistory.cost' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    
    // Asset ROI analysis
    const roiAnalysis = await Asset.aggregate([
      { $match: { isActive: true, purchasePrice: { $gt: 0 } } },
      {
        $addFields: {
          roi: {
            $multiply: [
              { $divide: [{ $subtract: ['$currentValue', '$purchasePrice'] }, '$purchasePrice'] },
              100
            ]
          }
        }
      },
      {
        $group: {
          _id: '$category',
          avgROI: { $avg: '$roi' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgROI: -1 } }
    ]);
    
    res.json({
      status: 'success',
      data: {
        assetValueOverTime,
        depreciationByCategory,
        maintenanceCosts,
        roiAnalysis
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching financial analytics',
      error: error.message
    });
  }
});

// GET system health and alerts
router.get('/health/alerts', async (req, res) => {
  try {
    const alerts = [];
    
    // Assets requiring maintenance
    const maintenanceAlerts = await Asset.countDocuments({
      isActive: true,
      $or: [
        { status: 'Maintenance' },
        { nextMaintenance: { $lte: new Date() } }
      ]
    });
    
    if (maintenanceAlerts > 0) {
      alerts.push({
        type: 'warning',
        message: `${maintenanceAlerts} assets require maintenance`,
        count: maintenanceAlerts,
        priority: 'medium'
      });
    }
    
    // Assets with warranty expiring soon (within 30 days)
    const warrantyAlerts = await Asset.countDocuments({
      isActive: true,
      warrantyExpiry: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    
    if (warrantyAlerts > 0) {
      alerts.push({
        type: 'info',
        message: `${warrantyAlerts} assets have warranty expiring soon`,
        count: warrantyAlerts,
        priority: 'low'
      });
    }
    
    // High-value assets without assignment
    const unassignedHighValue = await Asset.countDocuments({
      isActive: true,
      currentValue: { $gte: 10000 },
      assignedTo: null
    });
    
    if (unassignedHighValue > 0) {
      alerts.push({
        type: 'warning',
        message: `${unassignedHighValue} high-value assets are unassigned`,
        count: unassignedHighValue,
        priority: 'medium'
      });
    }
    
    // Employees with many assets
    const overloadedEmployees = await Asset.aggregate([
      { $match: { isActive: true, assignedTo: { $ne: null } } },
      {
        $group: {
          _id: '$assignedTo',
          assetCount: { $sum: 1 }
        }
      },
      { $match: { assetCount: { $gte: 5 } } }
    ]);
    
    if (overloadedEmployees.length > 0) {
      alerts.push({
        type: 'info',
        message: `${overloadedEmployees.length} employees have 5+ assets assigned`,
        count: overloadedEmployees.length,
        priority: 'low'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        alerts,
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.priority === 'high').length,
        warningAlerts: alerts.filter(a => a.priority === 'medium').length,
        infoAlerts: alerts.filter(a => a.priority === 'low').length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching system alerts',
      error: error.message
    });
  }
});

module.exports = router;
