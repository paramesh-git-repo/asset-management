import React from 'react';

const DeleteModal = ({ show, onHide, onConfirm, title, message }) => {
  const handleBackdropClick = (e) => {
    // Only close if clicking on the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
        <div className="bg-gray-50 text-gray-900 rounded-t-2xl border-none p-6 border-b border-gray-200 flex justify-between items-center">
          <h5 className="text-xl font-semibold mb-0">{title}</h5>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            onClick={onHide}
          >
            ×
          </button>
        </div>
        
        <div className="text-gray-900 bg-white p-6">
          <p>{message}</p>
        </div>
        
        <div className="bg-white text-gray-900 border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            type="button"
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onHide}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border-none bg-gray-800 text-white shadow-sm hover:bg-gray-900 hover:transform hover:-translate-y-1 hover:shadow-md"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
