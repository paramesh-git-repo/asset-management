import React, { useState, useEffect, memo } from 'react';

const Notification = memo(({ 
  show, 
  onHide, 
  message, 
  type = "info", // success, error, warning, info
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onHide, 300); // Wait for animation to complete
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  if (!show) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'fas fa-check-circle',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          icon: 'fas fa-exclamation-circle',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: 'fas fa-exclamation-triangle',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800'
        };
      default: // info
        return {
          icon: 'fas fa-info-circle',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-800'
        };
    }
  };

  const { icon, bgColor, borderColor, iconColor, textColor } = getIconAndColor();

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${bgColor} ${borderColor} border rounded-lg shadow-lg p-4 max-w-sm`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className={`${icon} ${iconColor} text-lg`}></i>
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${textColor}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onHide}
              className={`${iconColor} hover:opacity-75 transition-opacity`}
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

Notification.displayName = 'Notification';

export default Notification;
