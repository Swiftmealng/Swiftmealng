import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] bg-cover bg-center" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${assets.banner})`
    }}>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] text-white px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            SWIFT MEAL
          </h1>
          <p className="text-2xl md:text-3xl font-medium">
            Naija - fastest route to food- hot meals sharp-sharp
          </p>
          <p className="text-base md:text-lg max-w-2xl mx-auto text-gray-100">
            Whether you dey lag your room, office, or anywhere for Naija, we bring hot food straight 
            from your faves to streets, every day hot-hot!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              to="/track-order" 
              className="bg-[#FF0000] hover:bg-[#E00000] text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:shadow-lg"
            >
              Track your order
            </Link>
            <Link 
              to="/signup" 
              className="bg-white hover:bg-gray-50 text-[#FF0000] px-8 py-3.5 rounded-full font-semibold transition-all hover:shadow-lg"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
