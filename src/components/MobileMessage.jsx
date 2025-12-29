import React, { useState, useEffect } from 'react';

const MobileMessage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  // Currently unused, but updated to match new palette for future use
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-newsRed to-editorialBlue z-50 flex items-center justify-center p-4">
      <div className="bg-cleanWhite rounded-2xl shadow-2xl p-8 max-w-md text-center">
        <div className="mb-6">
          <svg 
            className="w-24 h-24 mx-auto text-orange-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-deepCharcoal mb-4">
          मोबाइल संस्करण लवकरच येणार आहे
        </h2>
        <p className="text-lg text-slateBody mb-6">
          कृपया लॅपटॉप किंवा डेस्कटॉपवर पहा
        </p>
        <p className="text-sm text-slateBody mb-4">
          Mobile version coming soon
        </p>
        <p className="text-sm text-metaGray">
          Please view on laptop or desktop
        </p>
      </div>
    </div>
  );
};

export default MobileMessage;


