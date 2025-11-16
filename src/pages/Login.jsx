import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">लॉगिन</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ईमेल
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="आपला ईमेल प्रविष्ट करा"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                पासवर्ड
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="आपला पासवर्ड प्रविष्ट करा"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-2 rounded font-semibold hover:opacity-90 transition-opacity"
            >
              लॉगिन करा
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-orange-600 hover:text-orange-700">
              मुखपृष्ठावर परत जा
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;





