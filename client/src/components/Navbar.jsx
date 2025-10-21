import { useState } from "react";
import { NavLink } from 'react-router-dom';
import { assets } from "../assets/assets";
import NotificationBell from "./NotificationBell";

const navigation = [
  { name: "How it Works", to: "/how-it-works" },
  { name: "Partner Kitchen", to: "/partner-kitchen" },
  { name: "About", to: "/about" },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/" className="flex items-center">
              <img
                src={assets.logoGroup}
                alt="SWIFTMEAL"
                className="h-8 w-auto"
              />
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#FF0000]'
                      : 'text-gray-700 hover:text-[#FF0000]'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Notification Bell & CTA Button - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <NotificationBell />
            <NavLink
              to="/create-order"
              className="inline-flex items-center px-6 py-2.5 bg-[#FF0000] text-white text-sm font-semibold rounded-full hover:bg-[#E00000] transition-colors"
            >
              Order Now
            </NavLink>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-red-50 text-[#FF0000]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <NavLink
              to="/create-order"
              className="block w-full text-center px-3 py-2.5 mt-4 bg-[#FF0000] text-white text-base font-semibold rounded-full hover:bg-[#E00000] transition-colors"
            >
              Order Now
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};
