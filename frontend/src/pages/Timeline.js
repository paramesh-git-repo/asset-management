import React, { useState, useEffect } from 'react';
import { config } from '../config/config';
import { apiCall } from '../services/api';

const Timeline = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch timeline data from API
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiCall(`${config.API_BASE_URL}/timeline`);
        
        if (result.status === 'success') {
          setTimelineData(result.data);
        } else {
          setError(result.message || 'Failed to fetch timeline data');
        }
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, []);

  const filterTimeline = (filter) => {
    setActiveFilter(filter);
  };

  const filteredData = activeFilter === 'all' 
    ? timelineData 
    : timelineData.filter(item => item.type === activeFilter);

  const getColorClass = (color) => {
    const colorMap = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      danger: 'text-red-600',
      info: 'text-blue-600',
      primary: 'text-purple-600'
    };
    return colorMap[color] || 'text-gray-800';
  };

  // Format timestamp to relative time
  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
  };

  const getFilterButtonClass = (filter) => {
    const baseClass = "px-4 py-2 rounded-xl font-medium transition-all duration-300 border";
    const activeClass = "bg-gray-800 text-white border-gray-800";
    const inactiveClass = "border-gray-300 text-gray-700 hover:bg-gray-50";
    return `${baseClass} ${activeFilter === filter ? activeClass : inactiveClass}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Timeline</h2>
            <p className="text-gray-600 mt-1">Track all activities and changes in your asset management system</p>
          </div>
          <div className="flex flex-wrap gap-2">
          <button 
            className={getFilterButtonClass('all')}
            onClick={() => filterTimeline('all')}
          >
            All
          </button>
          <button 
            className={getFilterButtonClass('assets')}
            onClick={() => filterTimeline('assets')}
          >
            Assets
          </button>
          <button 
            className={getFilterButtonClass('employees')}
            onClick={() => filterTimeline('employees')}
          >
            Employees
          </button>
          <button 
            className={getFilterButtonClass('system')}
            onClick={() => filterTimeline('system')}
          >
            System
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          {loading ? (
            <div className="text-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              </div>
              <h5 className="text-lg font-medium text-gray-900 mb-2 mt-4">Loading Timeline...</h5>
              <p className="text-gray-500">Fetching activity data from the server</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <i className="fas fa-exclamation-triangle text-6xl text-red-300 mb-4"></i>
              <h5 className="text-lg font-medium text-gray-900 mb-2">Error Loading Timeline</h5>
              <p className="text-gray-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <i className="fas fa-refresh mr-2"></i>Retry
              </button>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-clock text-6xl text-gray-300 mb-4"></i>
              <h5 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h5>
              <p className="text-gray-500">No activities match your selected filter.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredData.map((item, index) => (
                <div key={item.id} className="relative flex items-start space-x-4">
                  {/* Timeline line */}
                  {index < filteredData.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  {/* Timeline marker */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 border-4 border-white shadow-sm flex items-center justify-center">
                    <i className={`${item.icon} ${getColorClass(item.color)} text-lg`}></i>
                  </div>
                  
                  {/* Timeline content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <h6 className="text-sm font-semibold text-gray-900">{item.title}</h6>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{formatTime(item.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      {item.assetName && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <i className="fas fa-box mr-1"></i>
                            {item.assetName} ({item.assetId})
                          </span>
                        </div>
                      )}
                      {item.employeeName && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <i className="fas fa-user mr-1"></i>
                            {item.employeeName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
