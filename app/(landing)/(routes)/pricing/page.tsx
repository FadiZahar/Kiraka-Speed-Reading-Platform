import React from 'react';
import './PricingPage.css';

const PricingPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center" style={{ marginTop: '-475px' }}>
        <h1 className="text-white text-7xl font-bold mb-12 typewriter" style={{ color: 'rgb(220,220,200)', lineHeight: '1.2'}}>Our Pricing Plans</h1>
        <p className="text-white text-lg max-w-xl mx-auto animate-gradientFadeIn landing-font">
          Our platform is freely available to all. We are dedicated to enhancing your reading experience 
          by providing innovative tools that help you read faster and more efficiently. Whether you&apos;re a 
          student, professional, or lifelong learner, start your journey to faster reading today!
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
