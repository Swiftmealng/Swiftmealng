import React from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'

const navigation = {
  about: [
    { name: 'Order Food', to: '/create-order' },
    { name: 'Favorites', to: '/favorites' },
    { name: 'My Account', to: '/profile' }
  ]
}

export const Footer = () =>  {
  return (
    <footer className="bg-gray-900 text-white mb-0" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Our Company
      </h2>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-14 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1 lg:pr-5  ">
            <img
              className="h-30 "
              src={assets.logoGroup}
              alt="Company logo"
            />
            <p className="text-gray-300 text-base text-justify ">
              We start SWIFTMEAL with one belief: hunger no suppose delay person. <br />
              For Lagos hustle, every minute matter so we dey deliver food wey match the speed of the city.
            </p>
            {/* <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-300 hover:text-tertiary">
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div> */}
          </div>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 xl:mt-15 xl:col-span-2">
            <div className="md:grid md:grid-cols-1 lg:grid-cols-2 md:gap-8 lg:pl-10">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase ">Quick Link</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {navigation.about.map((item) => (
                    <li key={item.name}>
                      <NavLink to={item.to} className="text-base text-gray-300 hover:text-tertiary">
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase ">Contact Us</h3>
                <ul role="list" className="mt-4 space-y-4 text-gray-300">
                  <li>(+234) 909 990 9990</li>
                  <li>swiftmeal@gmail.com</li>
                  <li>Headquarters, Lagos, Nigeria</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-20 border-t border-tertiary/50 pt-8">
          <p className="text-base text-gray-300 xl:text-center ">&copy; 2025 Swiftmeal, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

