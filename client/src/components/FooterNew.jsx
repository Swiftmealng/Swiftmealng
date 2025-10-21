import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const FooterNew = () => {
  return (
    <footer className="bg-[#1a1a1a] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={assets.logo} alt="SWIFTMEAL" className="h-10 w-10" />
              <span className="text-2xl font-bold text-[#FF0000]">SWIFTMEAL</span>
            </div>
            <p className="text-gray-400 text-sm">
              Naija's fastest route to hot meals sharp-sharp!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Order Food</Link></li>
              <li><Link to="/track-order" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/explore-kitchens" className="text-gray-400 hover:text-white transition-colors">Explore Kitchens</Link></li>
              <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Start Here</li>
              <li>Lagos, Nigeria</li>
              <li>Help/Support</li>
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h3 className="font-bold text-lg mb-4">Download App</h3>
            <div className="flex gap-2">
              <img src={assets.iconFacebook} alt="Facebook" className="w-6 h-6 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
              <img src={assets.iconTwitter} alt="Twitter" className="w-6 h-6 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
              <img src={assets.iconInstagram} alt="Instagram" className="w-6 h-6 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
              <img src={assets.iconLinkedln} alt="LinkedIn" className="w-6 h-6 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6">
          <p className="text-center text-gray-400 text-sm">
            © 2025 SWIFTMEAL. All rights reserved. | Powered by speed, served with love.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterNew;
