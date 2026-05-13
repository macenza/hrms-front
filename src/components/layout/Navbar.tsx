"use client";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full h-18 bg-white shadow-md border-b border-gray-200 px-6 md:px-12 flex items-center justify-between">

      {/* Left Side - Logo */}

      <Image
        src="/logo.svg"
        alt="Logo"
        width={250}
        height={250}

      />

      {/* Middle - Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link
          href="/"
          className="text-gray-900 font-medium hover:text-blue-600 transition"
        >
          Home
        </Link>

        <Link
          href="/features"
          className="text-gray-900 font-medium hover:text-blue-600 transition"
        >
          Features
        </Link>

        <Link
          href="/pricing"
          className="text-gray-700 font-medium hover:text-blue-600 transition"
        >
          Pricing
        </Link>

        <Link
          href="/about"
          className="text-gray-700 font-medium hover:text-blue-600 transition"
        >
          About
        </Link>

        <Link
          href="/contact"
          className="text-gray-700 font-medium hover:text-blue-600 transition"
        >
          Contact
        </Link>
      </div>

      {/* Right Side - Buttons */}
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="bg-white border border-[#D1D5DB] text-[#111827] rounded-xl px-5 py-2"
        >
          Login
        </Link>

        <Link
          href="/signup"
          className="bg-[#6D5DFD] text-white rounded-xl px-5 py-2 border border-[#5B4DF0] hover:bg-[#5B4DF0] hover:scale-95 transition duration-300"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}