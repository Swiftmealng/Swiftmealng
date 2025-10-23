import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceAreas = () => {
  const navigate = useNavigate();

  const handleOrderNow = () => {
    navigate('/create-order');
  };

  const areas = [
    {
      icon: (
        <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
      title: 'Breakfast before class',
      description: 'Hot meals reach you 6-10, no shakara'
    },
    {
      icon: (
        <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
        </svg>
      ),
      title: 'Office lunch',
      description: 'Chop sharp-sharp, no time waste'
    },
    {
      icon: (
        <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
        </svg>
      ),
      title: 'Midnight cravings',
      description: 'Late-night grub, delivered hot'
    }
  ];

  return (
    <section className="py-20 bg-[#FF0000] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Wherever hunger hold you, SWIFTMEAL dey:
          </h2>
          <p className="text-xl opacity-90">
            Rain drop, sun comot!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {areas.map((area, index) => (
            <div key={index} className="bg-white text-gray-800 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
              <div className="text-[#FF0000] mb-4">{area.icon}</div>
              <h3 className="text-xl font-bold mb-3">{area.title}</h3>
              <p className="text-gray-600 leading-relaxed">{area.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button 
            onClick={handleOrderNow}
            className="bg-white hover:bg-gray-50 text-[#FF0000] px-8 py-3.5 rounded-full font-semibold transition-all hover:shadow-lg inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Order now
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServiceAreas;
