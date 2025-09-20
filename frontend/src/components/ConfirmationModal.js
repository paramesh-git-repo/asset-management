import React from 'react';

const ConfirmationModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning" // warning, danger, info
}) => {
  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  const getIconAndColor = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'fas fa-exclamation-triangle',
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          borderColor: 'border-red-200'
        };
      case 'info':
        return {
          icon: 'fas fa-info-circle',
          iconColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          borderColor: 'border-blue-200'
        };
      default: // warning
        return {
          icon: 'fas fa-exclamation-triangle',
          iconColor: 'text-yellow-600',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          borderColor: 'border-yellow-200'
        };
    }
  };

  const { icon, iconColor, buttonColor, borderColor } = getIconAndColor();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        <div className={`p-6 border-l-4 ${borderColor}`}>
          <div className="flex items-center mb-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4`}>
              <i className={`${icon} ${iconColor} text-lg`}></i>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onHide}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onHide();
              }}
              className={`px-4 py-2 text-white rounded-md font-medium transition-colors ${buttonColor}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
