import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SubscribePopup from './SubscribePopup';

const Header = () => {
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const currentDate = new Date().toLocaleDateString('mr-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      <header className="bg-cleanWhite border-b border-subtleGray fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Info Bar - Desktop */}
          <div className="hidden md:flex items-center justify-between py-2.5 px-4 bg-gradient-to-r from-subtleGray/40 to-subtleGray/20 border-b border-subtleGray/60">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-metaGray font-semibold tracking-wide">PRGI Reg No:</span>
                <span className="text-deepCharcoal font-bold">MHMAR/25/A4153</span>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-metaGray font-semibold tracking-wide">Chief Editor:</span>
                <span className="text-deepCharcoal font-semibold">शिवानी रोहन सुरवसे पाटील</span>
              </div>
            </div>
            <a 
              href="mailto:navmanch25@gmail.com" 
              className="flex items-center gap-2 text-xs text-metaGray hover:text-newsRed transition-all duration-300 group"
            >
              <span className="font-semibold tracking-wide">E-mail:</span>
              <span className="text-deepCharcoal font-semibold group-hover:text-newsRed transition-colors duration-300">navmanch25@gmail.com</span>
            </a>
          </div>

          {/* Top Info Bar - Mobile */}
          <div className="md:hidden py-2 px-3 bg-gradient-to-r from-subtleGray/40 to-subtleGray/20 border-b border-subtleGray/60">
            <div className="flex flex-col gap-1.5 text-[10px]">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-metaGray font-semibold">PRGI Reg No:</span>
                  <span className="text-deepCharcoal font-bold">MHMAR/25/A4153</span>
                </div>
                <a 
                  href="mailto:navmanch25@gmail.com" 
                  className="text-deepCharcoal hover:text-newsRed transition-colors duration-300 font-semibold text-[9px]"
                >
                  navmanch25@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-metaGray font-semibold">Chief Editor:</span>
                <span className="text-deepCharcoal font-semibold">शिवानी रोहन सुरवसे पाटील</span>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex items-center justify-between py-2 md:hidden">
            <div className="flex flex-col">
              <span className="text-[11px] text-metaGray leading-tight">
                {currentDate}
              </span>
            </div>

            <Link to="/" className="flex-shrink-0">
              <img
                src="/logo1.png"
                alt="नवभारत संवाद"
                className="h-[90px] w-auto"
              />
            </Link>

            <div className="flex items-center space-x-2">
              <Link
                to="/epaper"
                className="px-3 py-1 rounded-full bg-editorialBlue text-cleanWhite text-xs font-semibold tracking-wide hover:bg-editorialBlue/90 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                ई-पेपर
              </Link>
              <button
                onClick={() => setIsSubscribeOpen(true)}
                className="px-3 py-1 rounded-full bg-newsRed text-cleanWhite text-xs font-semibold tracking-wide hover:bg-newsRed/90 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                सबस्क्राईब
              </button>
            </div>
          </div>

          {/* Desktop / Tablet Header */}
          <div className="hidden md:flex items-center justify-between py-2 h-[80px] min-h-[80px]">
            {/* Left: Date */}
            <div className="flex items-center">
              <span className="text-sm text-slateBody font-light tracking-wide">
                {currentDate}
              </span>
            </div>

            {/* Center: Logo */}
            <Link
              to="/"
              className="flex-shrink-0 transform scale-125 md:scale-150 transition-transform duration-300 hover:scale-[1.3] md:hover:scale-[1.55]"
            >
              <img
                src="/logo1.png"
                alt="नवभारत संवाद"
                className="h-20 md:h-24 w-auto"
              />
            </Link>

            {/* Right: E-Paper and Subscribe */}
            <div className="flex items-center space-x-3">
              <Link
                to="/epaper"
                className="bg-editorialBlue text-cleanWhite px-5 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-editorialBlue/80 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 rounded-full"
              >
                ई-पेपर
              </Link>
              <button
                onClick={() => setIsSubscribeOpen(true)}
                className="bg-newsRed text-cleanWhite px-5 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-newsRed/80 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 rounded-full"
              >
                सबस्क्राईब करा
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Subscribe Popup */}
      <SubscribePopup 
        isOpen={isSubscribeOpen} 
        onClose={() => setIsSubscribeOpen(false)} 
      />
    </>
  );
};

export default Header;
