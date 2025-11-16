import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const categories = [
    { id: 'national', name: 'राष्ट्रीय', path: '/category/national' },
    { id: 'state', name: 'राज्य', path: '/category/state' },
    { id: 'city', name: 'शहर', path: '/category/city' },
    { id: 'youth', name: 'युवा', path: '/category/youth' },
    { id: 'politics', name: 'राजकारण', path: '/category/politics' },
    { id: 'adhyatm', name: 'अध्यात्म', path: '/category/adhyatm' },
    { id: 'health', name: 'आरोग्य', path: '/category/health' },
    { id: 'entertainment', name: 'मनोरंजन', path: '/category/entertainment' },
    { id: 'sports', name: 'क्रीडा', path: '/category/sports' },
    { id: 'education', name: 'शिक्षण', path: '/category/education' },
    { id: 'policies', name: 'धोरणे आणि विकास', path: '/category/policies' },
    { id: 'career', name: 'करिअर', path: '/category/career' },
    { id: 'empowerment', name: 'सक्षमीकरण', path: '/category/empowerment' },
  ];

  const otherPages = [
    { name: 'आमचे कार्यक्रम', path: '/events' },
    { name: 'गॅलरी', path: '/gallery' },
    { name: 'ब्लॉग', path: '/blogs' },
    { name: 'लेख', path: '/articles' },
    { name: 'शॉर्ट्स', path: '/shorts' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          {/* Left: Hamburger Menu and Search */}
          <div className="flex items-center space-x-3">
            <button
              className="p-2 text-gray-700 hover:text-orange-600 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-2">
              <FaSearch className="w-4 h-4 text-gray-500" />
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-sm text-gray-700 hover:text-orange-600 transition-colors"
              >
                शोध
              </button>
            </div>
          </div>

          {/* Center: Category Links */}
          <div className="hidden lg:flex items-center space-x-1 flex-wrap flex-1 justify-center">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.path}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(cat.path)
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-700 hover:text-orange-600'
                }`}
              >
                {cat.name}
              </Link>
            ))}
            {otherPages.map((page) => (
              <Link
                key={page.path}
                to={page.path}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(page.path)
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-700 hover:text-orange-600'
                }`}
              >
                {page.name}
              </Link>
            ))}
          </div>

          {/* Right: Empty for balance */}
          <div className="w-20"></div>
        </div>

        {/* Search Bar (when open) */}
        {searchOpen && (
          <div className="py-3 border-t border-gray-200">
            <input
              type="text"
              placeholder="बातमी शोधा..."
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
          </div>
        )}

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={cat.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(cat.path)
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
              {otherPages.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(page.path)
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  {page.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
