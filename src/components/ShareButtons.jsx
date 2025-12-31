import React from 'react';
import { FaWhatsapp, FaTwitter, FaFacebook, FaShareAlt } from 'react-icons/fa';

const ShareButtons = ({ title, description, image, url }) => {

  // Helper function to convert frontend URL to backend URL for crawlers
  const getBackendUrl = (frontendUrl) => {
    if (!frontendUrl) return frontendUrl;
    
    const backendBase = import.meta.env.VITE_BACKEND_URL || 'https://navmanch-backend.onrender.com';
    
    // Extract path from frontend URL
    try {
      const urlObj = new URL(frontendUrl);
      // Return backend URL with same path
      return `${backendBase}${urlObj.pathname}${urlObj.search}`;
    } catch (e) {
      // If URL parsing fails, try simple string replacement
      const frontendBase = window.location.origin;
      if (frontendUrl.startsWith(frontendBase)) {
        return frontendUrl.replace(frontendBase, backendBase);
      }
      // If it's already a backend URL or absolute URL, return as is
      return frontendUrl;
    }
  };

  // Get current page URL if not provided, and convert to backend URL
  const frontendUrl = url || window.location.href;
  const shareUrl = getBackendUrl(frontendUrl);
  const shareTitle = title || document.title;
  const shareDescription = description || '';
  const shareImage = image || '';

  // WhatsApp share - Format for rich preview card
  const shareWhatsApp = () => {
    // WhatsApp generates preview cards from Open Graph meta tags
    // The URL must be on its own line for WhatsApp to fetch and display preview
    // Format: Title on first line, description on second, URL on third line
    // WhatsApp will automatically fetch the page and show preview card with image
    const message = shareDescription 
      ? `${shareTitle}\n\n${shareDescription}\n\n${shareUrl}`
      : `${shareTitle}\n\n${shareUrl}`;
    
    // Use WhatsApp share API - this triggers preview card generation
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'width=600,height=400');
  };

  // Twitter share
  const shareTwitter = () => {
    const text = `${shareTitle}\n\n${shareUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  // Facebook share
  const shareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('लिंक कॉपी केला गेला!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('लिंक कॉपी करताना त्रुटी आली');
    }
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
      {/* WhatsApp Share */}
      <button
        onClick={shareWhatsApp}
        className="flex items-center justify-center gap-1 sm:gap-2 bg-green-500 text-cleanWhite px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="WhatsApp वर शेअर करा"
        title="WhatsApp वर शेअर करा"
      >
        <FaWhatsapp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-semibold text-xs sm:text-sm hidden sm:inline">WhatsApp</span>
      </button>

      {/* Facebook Share */}
      <button
        onClick={shareFacebook}
        className="flex items-center justify-center gap-1 sm:gap-2 bg-blue-600 text-cleanWhite px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="Facebook वर शेअर करा"
        title="Facebook वर शेअर करा"
      >
        <FaFacebook className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-semibold text-xs sm:text-sm hidden sm:inline">Facebook</span>
      </button>

      {/* Twitter Share */}
      <button
        onClick={shareTwitter}
        className="flex items-center justify-center gap-1 sm:gap-2 bg-sky-500 text-cleanWhite px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-sky-600 transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="Twitter वर शेअर करा"
        title="Twitter वर शेअर करा"
      >
        <FaTwitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-semibold text-xs sm:text-sm hidden sm:inline">Twitter</span>
      </button>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className="flex items-center justify-center gap-1 sm:gap-2 bg-subtleGray text-deepCharcoal px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-metaGray transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="लिंक कॉपी करा"
        title="लिंक कॉपी करा"
      >
        <FaShareAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-semibold text-xs sm:text-sm hidden sm:inline">कॉपी</span>
      </button>
    </div>
  );
};

export default ShareButtons;

