import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaSearch, FaChevronDown } from 'react-icons/fa';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Primary categories shown in main navigation
  const primaryCategories = [
    { id: 'latest-news', name: 'ताज्या बातम्या', path: '/category/latest-news' },
    { id: 'pune', name: 'पुणे', path: '/category/pune' },
    { id: 'maharashtra', name: 'महाराष्ट्र', path: '/category/maharashtra' },
    { id: 'national-international', name: 'देश विदेश', path: '/category/national-international' },
    { id: 'information-technology', name: 'माहिती तंत्रज्ञान', path: '/category/information-technology' },
    { id: 'lifestyle', name: 'लाईफस्टाईल', path: '/category/lifestyle' },
    { id: 'column-articles', name: 'स्तंभ लेख', path: '/category/column-articles' },
    { id: 'entertainment', name: 'मनोरंजन', path: '/category/entertainment' },
    { id: 'sports', name: 'क्रीडा', path: '/category/sports' },
    { id: 'health', name: 'आरोग्य', path: '/category/health' },
    { id: 'editorial', name: 'संपादकीय', path: '/category/editorial' },
  ];

  // Additional pages for hamburger menu
  const otherPages = [
    { name: 'ई पेपर', path: '/epaper' },
    { name: 'ई पेपर 2 (सरलीकृत)', path: '/epaper2' },
    { name: 'आमचे कार्यक्रम', path: '/events' },
    { name: 'गॅलरी', path: '/gallery' },
    { name: 'लेख', path: '/articles' },
    { name: 'आमच्याबद्दल', path: '/about' },
    { name: 'संपर्क', path: '/contact' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Close menu when search opens and vice versa
  useEffect(() => {
    if (searchOpen) {
      setIsMenuOpen(false);
    }
  }, [searchOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search navigation
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 fixed top-[134px] md:top-[112px] left-0 right-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between py-3 min-h-[60px]">
            {/* Left: Hamburger Menu and Search */}
            <div className="flex items-center space-x-4">
              <button
                className="p-2 text-gray-700 hover:text-gray-900 transition-all duration-300 hover:bg-gray-50 rounded-md group menu-container"
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  if (!isMenuOpen) setSearchOpen(false);
                }}
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <FaTimes className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <FaBars className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSearchOpen(!searchOpen);
                    if (!searchOpen) setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 text-sm font-medium transition-all duration-300 group ${
                    searchOpen 
                      ? 'text-red-600' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <FaSearch className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>शोध</span>
                </button>
              </div>
            </div>

            {/* Center: Primary Category Links */}
            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center px-4">
              {primaryCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={cat.path}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 relative group ${
                    isActive(cat.path)
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="relative z-10">{cat.name}</span>
                  {isActive(cat.path) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 transform transition-all duration-300"></span>
                  )}
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
              ))}
            </div>

            {/* Right: Empty for balance */}
            <div className="w-20"></div>
          </div>

          {/* Search Bar - Slides down smoothly below nav */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out border-t border-gray-100 ${
              searchOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 border-t-0'
            }`}
          >
            <div className="py-4">
              <form onSubmit={handleSearchSubmit} className="relative max-w-4xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="बातमी शोधा..."
                  className="w-full px-5 py-3.5 pr-14 border-2 border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300 text-sm font-light tracking-wide placeholder-gray-400 bg-white shadow-sm"
                  autoFocus={searchOpen}
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-700 transition-colors duration-300 p-1"
                >
                  <FaSearch className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Hamburger Menu - Fullscreen on mobile */}
      <div
        className={`fixed inset-0 bg-white z-50 transform transition-transform duration-500 ease-in-out overflow-y-auto ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Top row: title + close */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-semibold text-gray-700">
              मेनू
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
              aria-label="Close menu"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {/* Categories Section - Same as main navigation */}
            <div className="md:col-span-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                श्रेणी
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {primaryCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={cat.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md group ${
                      isActive(cat.path)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>{cat.name}</span>
                      <FaChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transform -rotate-90 transition-all duration-300" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Other Pages Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                पृष्ठे
              </h3>
              <div className="space-y-1">
                {otherPages.map((page) => (
                  <Link
                    key={page.path}
                    to={page.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md group ${
                      isActive(page.path)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>{page.name}</span>
                      <FaChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transform -rotate-90 transition-all duration-300" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* No separate overlay needed; menu covers full screen */}
    </>
  );
};

export default Navigation;
