import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler,
} from 'chart.js';
import dataService from '../services/dataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
);

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    assets: {
      total: 0,
      active: 0,
      maintenance: 0,
      retired: 0,
      assigned: 0,
      growth: 0
    },
    categories: {},
    performance: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [85, 88, 92, 89, 94, 96],
      target: 95
    },
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load assets and employees from API
        const [assetsData, employeesData] = await Promise.all([
          dataService.getAssets(),
          dataService.getEmployees()
        ]);
        
        setAssets(assetsData);
        setEmployees(employeesData);
        
        console.log('✅ Dashboard data loaded from API:', { assets: assetsData, employees: employeesData });

        // Calculate dashboard data
        const totalAssets = assetsData.length;
        const activeAssets = assetsData.filter(asset => asset.status === 'Active').length;
        const maintenanceAssets = assetsData.filter(asset => asset.status === 'Maintenance').length;
        const retiredAssets = assetsData.filter(asset => asset.status === 'Retired').length;
        const assignedAssets = assetsData.filter(asset => asset.assignedTo && asset.assignedTo.trim() !== '').length;

        // Calculate categories
        const categories = {};
        assetsData.forEach(asset => {
          if (asset.category) {
            if (!categories[asset.category]) {
              categories[asset.category] = { count: 0, growth: 0, color: getRandomColor() };
            }
            categories[asset.category].count++;
          }
        });

        // Generate alerts based on data
        const alerts = [];
        if (maintenanceAssets > 0) {
          alerts.push({
            type: 'warning',
            message: `${maintenanceAssets} asset(s) require maintenance`,
            icon: 'fas fa-exclamation-triangle'
          });
        }
        if (assignedAssets > 0) {
          alerts.push({
            type: 'info',
            message: `${assignedAssets} asset(s) are currently assigned`,
            icon: 'fas fa-info-circle'
          });
        }
        if (employeesData.length > 0) {
          alerts.push({
            type: 'success',
            message: `${employeesData.length} employee(s) in the system`,
            icon: 'fas fa-users'
          });
        }

        setDashboardData({
          assets: {
            total: totalAssets,
            active: activeAssets,
            maintenance: maintenanceAssets,
            retired: retiredAssets,
            assigned: assignedAssets,
            growth: 0
          },
          categories,
          performance: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [85, 88, 92, 89, 94, 96],
            target: 95
          },
          alerts
        });
      } catch (err) {
        setError(err);
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getRandomColor = () => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const assetPerformanceData = {
    labels: dashboardData.performance.labels,
    datasets: [
      {
        label: 'Asset Performance',
        data: dashboardData.performance.data,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const categoryDistributionData = {
    labels: Object.keys(dashboardData.categories),
    datasets: [
      {
        data: Object.values(dashboardData.categories).map(cat => cat.count),
        backgroundColor: Object.values(dashboardData.categories).map(cat => cat.color),
        borderWidth: 0
      }
    ]
  };

  const assetStatusData = {
    labels: ['Active', 'Maintenance', 'Retired'],
    datasets: [
      {
        data: [
          dashboardData.assets.active,
          dashboardData.assets.maintenance,
          dashboardData.assets.retired
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0
      }
    ]
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Alerts Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error.message}</div>;
  }

  return (
    <div className="space-y-6">

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Assets</p>
              <h3 className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{dashboardData.assets.total}</h3>
              <p className="text-green-600 text-sm font-medium mt-1">
                <i className="fas fa-arrow-up mr-1 animate-bounce"></i>+12% from last month
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <i className="fas fa-boxes"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Active Assets</p>
              <h3 className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{dashboardData.assets.active}</h3>
              <p className="text-green-600 text-sm font-medium mt-1">
                <i className="fas fa-check-circle mr-1 animate-pulse"></i>In good condition
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <i className="fas fa-check"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Maintenance</p>
              <h3 className="text-3xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors duration-300">{dashboardData.assets.maintenance}</h3>
              <p className="text-yellow-600 text-sm font-medium mt-1">
                <i className="fas fa-exclamation-triangle mr-1 animate-pulse"></i>Requires attention
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <i className="fas fa-tools"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Assigned</p>
              <h3 className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">{dashboardData.assets.assigned}</h3>
              <p className="text-blue-600 text-sm font-medium mt-1">
                <i className="fas fa-users mr-1 animate-bounce"></i>To employees
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <i className="fas fa-user-check"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ marginTop: '50px' }}>
        {/* Asset Performance Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-lg font-semibold text-gray-900">Asset Performance</h5>
            <div className="flex space-x-2">
              <button className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">Monthly</button>
              <button className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-800 text-white">Quarterly</button>
            </div>
          </div>
          <div className="h-64">
            <Line 
              data={assetPerformanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-lg font-semibold text-gray-900">Category Distribution</h5>
            <button className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>
          <div className="h-64">
            <Doughnut 
              data={categoryDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6" style={{ marginTop: '50px' }}>
        <h5 className="text-lg font-semibold text-gray-900 mb-6">System Alerts</h5>
        <div className="space-y-4">
          {dashboardData.alerts.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
              <h6 className="text-lg font-medium text-gray-900 mb-2">All Systems Operational</h6>
              <p className="text-gray-500">No alerts at this time. Everything is running smoothly.</p>
            </div>
          ) : (
            dashboardData.alerts.map((alert, index) => (
              <div key={index} className={`flex items-center p-4 rounded-xl border-l-4 ${
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                alert.type === 'danger' ? 'bg-red-50 border-red-400' :
                alert.type === 'success' ? 'bg-green-50 border-green-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  alert.type === 'danger' ? 'bg-red-100 text-red-600' :
                  alert.type === 'success' ? 'bg-green-100 text-green-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <i className={alert.icon}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
