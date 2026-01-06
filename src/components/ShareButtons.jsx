import React from 'react';
import { FaWhatsapp, FaTwitter, FaFacebook, FaShareAlt } from 'react-icons/fa';

const ShareButtons = ({ title, description, image, url }) => {

  // Use frontend URL for sharing (cleaner, better branding)
  const frontendBase = 'https://navmanchnews.com';
  
  // Helper function to ensure frontend URL
  const getFrontendUrl = (inputUrl) => {
    if (!inputUrl) return window.location.href;
    
    try {
      const urlObj = new URL(inputUrl);
      // If it's a backend URL, convert to frontend
      if (urlObj.hostname.includes('onrender.com') || urlObj.hostname.includes('backend')) {
        return `${frontendBase}${urlObj.pathname}${urlObj.search}`;
      }
      // If it's already frontend URL, return as is
      if (urlObj.hostname.includes('navmanchnews.com')) {
        return inputUrl;
      }
      // If relative, make it absolute with frontend domain
      if (inputUrl.startsWith('/')) {
        return `${frontendBase}${inputUrl}`;
      }
      return inputUrl;
    } catch (e) {
      // If URL parsing fails, try simple string replacement
      if (inputUrl.includes('onrender.com') || inputUrl.includes('backend')) {
        return inputUrl.replace(/https?:\/\/[^\/]+/, frontendBase);
      }
      if (inputUrl.startsWith('/')) {
        return `${frontendBase}${inputUrl}`;
      }
      return inputUrl;
    }
  };

  // Get current page URL if not provided, and ensure it's frontend URL
  const inputUrl = url || window.location.href;
  // Ensure we always share the FRONTEND domain (navmanchnews.com)
  // Backend/social-preview HTML is used transparently via the proxy in Frontend/server.js
  // for crawlers, so users (and cards) always see navmanchnews.com links.
  let shareUrl = getFrontendUrl(inputUrl);
  
  // Add shared=true parameter for epaper links to allow reading without subscription.
  // NOTE: This works even when using backend preview domain above because the
  // backend social-preview routes ignore this param for crawlers and the
  // frontend React/Next pages use it to allow free view.
  try {
    if (shareUrl.includes('/epaper/')) {
      const urlObj = new URL(shareUrl);
      urlObj.searchParams.set('shared', 'true');
      shareUrl = urlObj.toString();
    }
  } catch (e) {
    // Ignore parsing errors
  }
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
      </button>

      {/* Facebook Share */}
      <button
        onClick={shareFacebook}
        className="flex items-center justify-center gap-1 sm:gap-2 bg-blue-600 text-cleanWhite px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="Facebook वर शेअर करा"
        title="Facebook वर शेअर करा"
      >
        <FaFacebook className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Twitter Share */}
      <button
        onClick={shareTwitter}
        className="flex items-center justify-center gap-1 sm:gap-2 bg-sky-500 text-cleanWhite px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-sky-600 transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="Twitter वर शेअर करा"
        title="Twitter वर शेअर करा"
      >
        <FaTwitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className="flex items-center justify-center gap-1 sm:gap-2 bg-subtleGray text-deepCharcoal px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-metaGray transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="लिंक कॉपी करा"
        title="लिंक कॉपी करा"
      >
        <FaShareAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};

export default ShareButtons;

