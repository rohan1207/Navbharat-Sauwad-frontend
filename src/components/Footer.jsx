import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <img 
              src="/logo.png" 
              alt="नवभारत संवाद" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-gray-600 text-sm mb-2">
              महाराष्ट्रातील अग्रगण्य मराठी वृत्तपत्र. सत्य, निष्पक्ष आणि वस्तुनिष्ठ बातम्या.
            </p>
            <p className="text-sm text-orange-600 italic font-semibold">
              एक संवाद भारताच्या विकासासाठी
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-900">द्रुत लिंक</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-orange-600 transition-colors">
                  मुखपृष्ठ
                </Link>
              </li>
              <li>
                <Link to="/epaper" className="text-gray-600 hover:text-orange-600 transition-colors">
                  ई-पेपर
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-600 hover:text-orange-600 transition-colors">
                  गॅलरी
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-gray-600 hover:text-orange-600 transition-colors">
                  ब्लॉग
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-900">संपर्क</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <FaMapMarkerAlt className="mt-1 text-orange-600" />
                <span className="text-gray-600">
                  नवभारत संवाद,<br />
                  मुख्य कार्यालय,<br />
                  मुंबई, महाराष्ट्र - 400001
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <FaPhone className="text-orange-600" />
                <span className="text-gray-600">+91 22 1234 5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaEnvelope className="text-orange-600" />
                <span className="text-gray-600">info@navbharatsamvad.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media & RNI */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-900">सोशल मीडिया</h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-500 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-600 transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-700 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong className="text-blue-900">RNI नंबर:</strong> MAHENG/2024/12345
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} नवभारत संवाद. सर्व हक्क सुरक्षित.</p> <p>Designed and developed by TheSocialKollab</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

