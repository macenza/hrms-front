// app/components/CTASection.tsx

export default function CTASection() {
  return (
    <section className="w-full px-20 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-600 rounded-2xl px-6 py-8 md:px-10 md:py-10 shadow-lg">
          
          {/* Main Container */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Left Content */}
            <div className="text-center lg:text-left max-w-2xl ">
              <h2 className="text-white text-md sm:text-2xl md:text-2xl font-bold leading-snug">
                Ready to Transform Your HR Operations?
              </h2>

              <p className="text-indigo-100 mt-3 text-sm sm:text-base md:text-md">
                Join hundreds of companies using HRMS to simplify payroll,
                attendance, and employee management.
              </p>
            </div>

            {/* Right Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              
              {/* Primary Button */}
              <button className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition duration-300 w-full sm:w-auto">
                Start Free Trial
              </button>

              {/* Secondary Button */}
              <button className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-indigo-700 transition duration-300 w-full sm:w-auto">
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}