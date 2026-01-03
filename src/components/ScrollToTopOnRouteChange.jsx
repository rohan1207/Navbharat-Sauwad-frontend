import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Component to automatically scroll to top on route change
const ScrollToTopOnRouteChange = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top immediately when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'instant' for immediate scroll, 'smooth' for animated
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTopOnRouteChange;






