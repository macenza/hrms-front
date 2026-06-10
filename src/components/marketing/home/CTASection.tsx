'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const reviews = [
  {
    name: "Aarav Sharma",
    role: "CEO",
    company: "TechVantage Solutions",
    comment: "Macenza HRMS has completely automated our monthly payroll runs. What used to take our HR team 3 days now takes 15 minutes! The employee dashboard is highly intuitive and easy to use.",
    rating: 5
  },
  {
    name: "Meera Nair",
    role: "HR Director",
    company: "AppStudio India",
    comment: "The Leave & Attendance check-ins are seamless. Our employees love the transparent self-service portal, and the excel reporting integration is clean and efficient.",
    rating: 5
  },
  {
    name: "Rohan Das",
    role: "Operations Head",
    company: "Zenith FinTech",
    comment: "The employee seat expansion add-ons allowed us to scale capacity dynamically from 50 to 120 employees without forcing an immediate subscription plan upgrade. Highly cost-effective!",
    rating: 5
  },
  {
    name: "Sneha Reddy",
    role: "People Ops Lead",
    company: "Innovate Labs",
    comment: "Stunning UI styling, clean dark modes, and extremely responsive customer support. Our team adoption rate has been 150+ members since deployment.",
    rating: 5
  }
];

export default function CTASection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextReview = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  // Auto play every 7 seconds
  useEffect(() => {
    const interval = setInterval(nextReview, 7000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const activeReview = reviews[activeIndex];

  return (
    <section className="w-full px-6 py-14 bg-white dark:bg-gray-955 transition-colors duration-300 border-t border-gray-50 dark:border-gray-900">
      <div className="max-w-3xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6D5DFD] mb-2">
            Testimonials
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            What Our Customers Say
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="bg-[#F8F9FF] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          
          {/* Top Quote Icon */}
          <div className="absolute top-6 right-6 text-[#6D5DFD]/10 dark:text-[#6D5DFD]/5">
            <Quote className="w-12 h-12 rotate-180 fill-current" />
          </div>

          <div className="h-[210px] sm:h-[160px] md:h-[130px] flex flex-col justify-between">
            <div className={`transition-all duration-300 ease-out transform ${isAnimating ? 'opacity-0 scale-98 translate-y-1' : 'opacity-100 scale-100 translate-y-0'}`}>
              
              {/* Star Rating */}
              <div className="flex gap-1 mb-4 text-amber-500">
                {[...Array(activeReview.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current stroke-current" />
                ))}
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base font-semibold leading-relaxed italic pr-8">
                "{activeReview.comment}"
              </p>

              {/* Author Meta */}
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6D5DFD]/10 text-[#6D5DFD] flex items-center justify-center font-bold text-sm border border-[#6D5DFD]/20">
                  {activeReview.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-white font-extrabold text-sm">
                    {activeReview.name}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                    {activeReview.role}, <span className="text-[#6D5DFD] font-bold">{activeReview.company}</span>
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between mt-6 pt-4">
            
            {/* Pagination Indicators */}
            <div className="flex gap-1.5">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (isAnimating) return;
                    setIsAnimating(true);
                    setActiveIndex(idx);
                  }}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    idx === activeIndex 
                      ? 'w-5 bg-[#6D5DFD]' 
                      : 'w-1.5 bg-gray-300 dark:bg-gray-750 hover:bg-[#6D5DFD]/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Left/Right Arrow Buttons */}
            <div className="flex gap-2">
              <button
                onClick={prevReview}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-[#6D5DFD] hover:text-white hover:border-[#6D5DFD] transition duration-300 shadow-sm active:scale-95 bg-white dark:bg-gray-900"
                aria-label="Previous Review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextReview}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-[#6D5DFD] hover:text-white hover:border-[#6D5DFD] transition duration-300 shadow-sm active:scale-95 bg-white dark:bg-gray-900"
                aria-label="Next Review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}