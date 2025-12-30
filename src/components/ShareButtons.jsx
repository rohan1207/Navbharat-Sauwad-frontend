import React, { useState } from 'react';
import { FaWhatsapp, FaTwitter, FaFacebook, FaShareAlt, FaTimes } from 'react-icons/fa';

const ShareButtons = ({ title, description, image, url }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get current page URL if not provided
  const shareUrl = url || window.location.href;
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
    setIsOpen(false);
  };

  // Twitter share
  const shareTwitter = () => {
    const text = `${shareTitle}\n\n${shareUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  // Facebook share
  const shareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('लिंक कॉपी केला गेला!');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('लिंक कॉपी करताना त्रुटी आली');
    }
  };

  return (
    <div className="relative">
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-editorialBlue text-cleanWhite px-4 py-2 rounded-lg hover:bg-editorialBlue/90 transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="शेअर करा"
      >
        <FaShareAlt className="w-4 h-4" />
        <span className="font-semibold text-sm">शेअर करा</span>
      </button>

      {/* Share Options Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-cleanWhite rounded-lg shadow-xl border border-subtleGray z-50 overflow-hidden">
            <div className="p-2">
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-subtleGray mb-2">
                <h3 className="font-bold text-deepCharcoal text-sm">शेअर करा</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-metaGray hover:text-deepCharcoal transition-colors"
                  aria-label="बंद करा"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* Share Options */}
              <div className="space-y-1">
                <button
                  onClick={shareWhatsApp}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-subtleGray rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <FaWhatsapp className="w-5 h-5 text-cleanWhite" />
                  </div>
                  <div>
                    <div className="font-semibold text-deepCharcoal text-sm">WhatsApp</div>
                    <div className="text-xs text-metaGray">WhatsApp वर शेअर करा</div>
                  </div>
                </button>

                <button
                  onClick={shareFacebook}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-subtleGray rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <FaFacebook className="w-5 h-5 text-cleanWhite" />
                  </div>
                  <div>
                    <div className="font-semibold text-deepCharcoal text-sm">Facebook</div>
                    <div className="text-xs text-metaGray">Facebook वर शेअर करा</div>
                  </div>
                </button>

                <button
                  onClick={shareTwitter}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-subtleGray rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center group-hover:bg-sky-600 transition-colors">
                    <FaTwitter className="w-5 h-5 text-cleanWhite" />
                  </div>
                  <div>
                    <div className="font-semibold text-deepCharcoal text-sm">Twitter</div>
                    <div className="text-xs text-metaGray">Twitter वर शेअर करा</div>
                  </div>
                </button>

                <div className="border-t border-subtleGray my-1" />

                <button
                  onClick={copyLink}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-subtleGray rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-subtleGray rounded-full flex items-center justify-center">
                    <FaShareAlt className="w-5 h-5 text-deepCharcoal" />
                  </div>
                  <div>
                    <div className="font-semibold text-deepCharcoal text-sm">लिंक कॉपी करा</div>
                    <div className="text-xs text-metaGray">URL क्लिपबोर्डवर कॉपी करा</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButtons;

