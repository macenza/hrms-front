import Link from "next/link";
import {
  ShieldCheck,
  BarChart3,
  Users,Play,
} from "lucide-react";

export default function HeroSection() {
    return (
        <section
            className="w-full h-auto flex flex-col lg:flex-row lg:items-center justify-between px-6 py-20 md:px-12 lg:px-20
  bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: "url('/bg.png')",
            }}
        >
            <div className="w-full lg:w-1/2 flex flex-col items-start justify-start pt-0">
                <div className="px-4 py-0  rounded-full bg-[#EEEAFE] text-[#6D5DFD] text-sm font-semibold mb-6 ">
                    All-in-One HR Management System
                </div>
                <h1 className="text-3xl md:text-3xl font-bold leading-tight text-gray-900">
                    Manage Your Workforce <br />
                    <span className="text-[#6D5DFD] Regular">
                        Smarter
                    </span>
                </h1>
                <p className="mt-6 text-gray-600 text-lg leading-relaxed max-w-lg">
                    Streamline HR operations, automate workflows and empower your employees with a modern HRMS platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Link
                        href="/register-company"
                        className="bg-[#6D5DFD] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#5B4DF0] transition text-center"
                    >
                        Get Started Free
                    </Link>
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 border border-[#D1D5DB] bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition text-center"
                    >
                        Login
                    </Link>
                </div>
               <div className="flex flex-wrap gap-4 mt-10">

  {/* Secure */}
  <div
    className="
    flex
    items-center
    gap-1
    px-2
    py-3
    bg-white
    rounded-xl
    shadow-sm
    border
    border-gray-200
    text-sm
    font-medium
    text-gray-700
    "
  >
    <ShieldCheck
      size={18}
      className="text-[#6D5DFD]"
    />

    <span>Secure & Reliable</span>
  </div>

  {/* Analytics */}
  <div
    className="
    flex
    items-center
    gap-1
    px-2
    py-3
    bg-white
    rounded-xl
    shadow-sm
    border
    border-gray-200
    text-sm
    font-medium
    text-gray-700
    "
  >
    <BarChart3
      size={18}
      className="text-[#6D5DFD]"
    />

    <span>Real-time Analytics</span>
  </div>

  {/* Users */}
  <div
    className="
    flex
    items-center
    gap-1
    px-2
    py-3
    bg-white
    rounded-xl
    shadow-sm
    border
    border-gray-200
    text-sm
    font-medium
    text-gray-700
    "
  >
    <Users
      size={18}
      className="text-[#6D5DFD]"
    />

    <span>Role Based Access</span>
  </div>

</div>
            </div>
            <div className="w-full lg:w-1/2 mt-14 lg:mt-0 flex justify-center">
  <img
    src="/1.png"
    alt="Dashboard Preview"
    className="w-full max-w-2xl object-contain  max-w-4xl
            rounded-3xl
            shadow-2xl
            border
            border-gray-200"
  />
</div>
            
            
        </section>
    );
}