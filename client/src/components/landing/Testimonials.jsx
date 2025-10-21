import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Chioma',
      location: 'Ikeja',
      text: 'I must always have my food fast! SWIFTMEAL is the real deal. Hot food, quick delivery, zero stress!',
      rating: 5
    },
    {
      name: 'Emeka',
      location: 'Lekki',
      text: "No SWIFTMEAL, I can't even working exam week. SWIFTMEAL very my food like clock work. Steady vibes!",
      rating: 5
    },
    {
      name: 'Amaka',
      location: 'Yaba',
      text: 'Jollof wey touch stones like again. Food steady come hot, fresh. Rider with all smiles on time.',
      rating: 5
    },
    {
      name: 'Kunle',
      location: 'Ajah',
      text: 'Jollof wey sweet sweet like again. Food I dey always come hot. Rider with do smiles on time.',
      rating: 5
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          What people dey talk about us
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
                  {testimonial.name[0]}
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>
              <div className="flex mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-700">{testimonial.text}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button className="bg-[#00A651] hover:bg-[#008741] text-white px-8 py-3 rounded-full font-semibold transition-colors flex items-center gap-2 mx-auto">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            See all testimonials
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
