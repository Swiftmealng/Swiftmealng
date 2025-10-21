import React from 'react';

const WhySwiftmeal = () => {
  const reasons = [
    {
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      ),
      title: 'Speed wey fit Lagos',
      description: 'Food don deliver before you fit blink eye-lids'
    },
    {
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      ),
      title: 'Meals wey burst brain',
      description: 'Simply dey chop, sharp! E sweet well-well'
    },
    {
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      title: 'Trusted by thousands',
      description: 'Plenty people dey use SWIFTMEAL everyday'
    },
    {
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      ),
      title: 'Local & global vibes',
      description: 'From Jollof to pasta, we get am'
    }
  ];

  return (
    <section className="py-20 bg-[#FF0000] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Why people dey rush SWIFTMEAL
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {reasons.map((reason, index) => (
            <div key={index} className="bg-white text-gray-800 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
              <div className="text-[#FF0000] mb-4">{reason.icon}</div>
              <h3 className="text-xl font-bold mb-3">{reason.title}</h3>
              <p className="text-gray-600 leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button className="bg-white hover:bg-gray-50 text-[#FF0000] px-8 py-3.5 rounded-full font-semibold transition-all hover:shadow-lg inline-flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Become part of the movement
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhySwiftmeal;
