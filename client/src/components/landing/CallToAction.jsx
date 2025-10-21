import React from 'react';
import { assets } from '../../assets/assets';

const CallToAction = () => {
  return (
    <section className="py-16 bg-cover bg-center relative" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${assets.banner})`
    }}>
      <div className="container mx-auto px-4 text-center text-white relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Hunger no dey wait. Why you go wait?
        </h2>
        <p className="text-xl mb-8">
          Take the fastest route to food now.
        </p>
        <button className="bg-[#FF6600] hover:bg-[#E55A00] text-white px-10 py-4 rounded-full text-lg font-semibold transition-colors flex items-center gap-2 mx-auto">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
          </svg>
          Order now
        </button>
      </div>
    </section>
  );
};

export default CallToAction;
