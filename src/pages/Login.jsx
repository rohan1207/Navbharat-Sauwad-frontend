import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen bg-subtleGray flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-cleanWhite border border-subtleGray rounded-lg p-8">
          <h2 className="text-2xl font-bold text-deepCharcoal mb-6 text-center">लॉगिन</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-deepCharcoal mb-2">
                ईमेल
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-subtleGray rounded focus:outline-none focus:ring-2 focus:ring-newsRed"
                placeholder="आपला ईमेल प्रविष्ट करा"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-deepCharcoal mb-2">
                पासवर्ड
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-subtleGray rounded focus:outline-none focus:ring-2 focus:ring-newsRed"
                placeholder="आपला पासवर्ड प्रविष्ट करा"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-newsRed to-editorialBlue text-cleanWhite py-2 rounded font-semibold hover:opacity-90 transition-opacity"
            >
              लॉगिन करा
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-editorialBlue hover:text-newsRed">
              मुखपृष्ठावर परत जा
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;






