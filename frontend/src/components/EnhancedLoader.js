import React from 'react';

/**
 * ✅ Enhanced Loading Component
 * 
 * Provides better user experience with:
 * - Animated loading indicators
 * - Contextual messages
 * - Progress hints
 */

const EnhancedLoader = ({ 
  message = "Loading page...", 
  showProgress = false, 
  progress = 0,
  size = "medium" 
}) => {
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-12 w-12", 
    large: "h-16 w-16"
  };

  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="flex flex-col items-center space-y-4">
        {/* ✅ Animated spinner */}
        <div className={`${sizeClasses[size]} relative`}>
          <div className="animate-spin rounded-full h-full w-full border-b-2 border-blue-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-full w-full border-2 border-blue-200 opacity-20"></div>
        </div>
        
        {/* ✅ Loading message */}
        <div className="text-center">
          <p className="text-gray-600 text-sm font-medium">{message}</p>
          
          {/* ✅ Progress bar if enabled */}
          {showProgress && (
            <div className="mt-3 w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
          )}
          
          {/* ✅ Loading dots animation */}
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoader;
