import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';

const Header = () => {
  const currentDate = new Date().toLocaleDateString('mr-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-between">
          {/* Left: Date and e-Paper */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{currentDate}</span>
            <Link 
              to="/epaper" 
               className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white px-4 py-2 text-sm font-semibold uppercase hover:opacity-90 transition-opacity rounded-full"
            >
              ई-पेपर
            </Link>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="नवभारत संवाद" 
              className="h-16 md:h-28 w-auto mx-auto scale-150"
            />
          </Link>

          {/* Right: Login and Subscribe */}
          <div className="flex items-center space-x-4">
            
            <Link 
              to="/login" 
              className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white px-4 py-2 text-sm font-semibold uppercase hover:opacity-90 transition-opacity rounded-full"
            >
              सबस्क्राईब करा
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
