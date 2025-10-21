import React from 'react';
import Hero from '../components/landing/Hero';
import WhySwiftmeal from '../components/landing/WhySwiftmeal';
import HowItWorks from '../components/landing/HowItWorks';
import ServiceAreas from '../components/landing/ServiceAreas';
import Testimonials from '../components/landing/Testimonials';
import CallToAction from '../components/landing/CallToAction';
import AboutUs from '../components/landing/AboutUs';
import WhatMakesUsDifferent from '../components/landing/WhatMakesUsDifferent';
import Stats from '../components/landing/Stats';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <WhySwiftmeal />
      <HowItWorks />
      <ServiceAreas />
      <Stats />
      <Testimonials />
      <CallToAction />
      <AboutUs />
      <WhatMakesUsDifferent />
    </div>
  );
};

export default LandingPage;
