import React from 'react';
import { useHeader } from '../context/HeaderContext';

const MainContent = ({ children }) => {
  const { isHeaderVisible, headerHeight } = useHeader();
  const breakingNewsHeight = 56; // Fixed height of breaking news ticker
  const navigationHeight = 56; // Fixed height of navigation bar
  
  // Calculate total height of fixed elements
  const totalFixedHeightVisible = (headerHeight || 0) + breakingNewsHeight + navigationHeight;
  const totalFixedHeightHidden = breakingNewsHeight + navigationHeight;

  const paddingTop = isHeaderVisible ? totalFixedHeightVisible : totalFixedHeightHidden;

  return (
    <main 
      className="flex-grow pb-16 md:pb-20"
      style={{ 
        paddingTop: `${paddingTop}px`,
        transition: 'padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'padding-top'
      }}
    >
      {children}
    </main>
  );
};

export default MainContent;

