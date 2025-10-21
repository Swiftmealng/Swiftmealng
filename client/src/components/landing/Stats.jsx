import React from 'react';

const Stats = () => {
  const stats = [
    { number: '20,000+', label: 'Happy Customers' },
    { number: '50+', label: 'Trusted Restaurant Partners' },
    { number: '4.8/5', label: 'Average Rating' }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-5xl md:text-6xl font-bold text-[#FF0000] mb-2">
                {stat.number}
              </div>
              <p className="text-gray-600 text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
