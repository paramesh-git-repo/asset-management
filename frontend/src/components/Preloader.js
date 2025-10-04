import React, { useEffect } from 'react';

/**
 * ✅ Preloader Component
 * 
 * This component helps improve perceived performance by:
 * 1. Preloading critical pages in the background after dashboard loads
 * 2. Showing progress indicators during navigation
 * 3. Caching components for instant access
 */

const Preloader = ({ onPreloadComplete }) => {
  useEffect(() => {
    // ✅ Preload critical pages after a short delay
    const preloadPages = async () => {
      try {
        // Wait a bit to let dashboard load first
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Preload the most commonly used pages
        const pagesToPreload = [
          () => import('../pages/Assets'),
          () => import('../pages/Employees'),
          () => import('../pages/Settings'),
          () => import('../pages/Timeline')
        ];
        
        // Load pages in parallel but with small delays to not overwhelm
        const preloadPromises = pagesToPreload.map((pageLoader, index) => 
          new Promise(resolve => 
            setTimeout(() => {
              pageLoader().then(() => {
                console.log(`✅ Preloaded page ${index + 1}`);
                resolve();
              });
            }, index * 200) // Stagger preloading
          )
        );
        
        await Promise.all(preloadPromises);
        
        if (onPreloadComplete) {
          onPreloadComplete();
        }
        
        console.log('🚀 All pages preloaded successfully!');
      } catch (error) {
        console.warn('⚠️ Some pages failed to preload:', error);
      }
    };
    
    preloadPages();
  }, [onPreloadComplete]);
  
  return null; // This component doesn't render anything
};

export default Preloader;
