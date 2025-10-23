import React from 'react';

const AboutUs = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          About Us
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Our Story</h3>
            <p className="text-gray-700 leading-relaxed">
              We started SWIFTMEAL with one kasala: hunger no dey support delays! We began this Lagos hustle, every small time when hunger hold us, food-time go waste reach 30-45 minutes+ just because traffic sabi hinder and our riders slow! But guess wetin? Speed be the city.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Our Promise</h3>
              <p className="text-gray-700 leading-relaxed">
                Every SWIFTMEAL order comes with confidence. We deliver food fast to satisfy your hunger, guaranteed! It's like jollof rice on the express lane!
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                A service you can always trust.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-4">Why We Exist</h3>
              <p className="text-gray-700 leading-relaxed">
                Food brings joy, comfort, and energy! We want to bring you hot delivery with no delays. Nothing fresher, nothing faster - that's SWIFTMEAL!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
