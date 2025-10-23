import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';

const HowItWorks = () => {
  const navigate = useNavigate();

  const handleOrderNow = () => {
    navigate('/create-order');
  };

  const steps = [
    {
      image: assets.banner, // Food selection image
      title: 'Choose your craving',
      description: 'E dey simple: select whatever wey you wan chop',
      isFood: true
    },
    {
      image: assets.rider1, // Rider with delivery box
      title: 'Place order',
      description: 'Tap, click, and say sharp! Your food dey on the way',
      isFood: false
    },
    {
      image: assets.rider2, // Rider on bike
      title: 'Chop am fast',
      description: 'We drop your hot meal for your doorstep, quick-quick',
      isFood: false
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Just 3 steps, no graga:
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="mb-6">
                <img 
                  src={step.image} 
                  alt={step.title} 
                  className={`w-full h-64 ${step.isFood ? 'object-cover' : 'object-contain'}`}
                />
              </div>
              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button 
            onClick={handleOrderNow}
            className="bg-[#FF6600] hover:bg-[#E55A00] text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:shadow-lg inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Get your meal now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
