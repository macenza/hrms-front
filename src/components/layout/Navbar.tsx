"use client";
import Image from "next/image";
import Link from "next/link";
import { Menu, CircleX } from "lucide-react";
import React, { useState } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="w-full h-20 bg-white shadow-md border-b border-gray-200 px-6 md:px-12 flex items-center justify-between">

      {/* Left Side - Logo */}

      {/* <Image
        src="/logo.svg"
        alt="Logo"
        width={250}
        height={250}

      /> */}
      <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#6D5DFD] to-[#8B7BFF] bg-clip-text text-transparent">
        MACENZA
      </h1>

      {/* Middle - Navigation Links */}

      <div
        className={`md:flex md:items-center absolute md:static bg-white md:bg-transparent left-0 w-full md:w-auto transition-all duration-300 px-8 py-8 md:p-0 min-h-[60vh] md:min-h-fit ${open ? "top-[70px]" : "top-[-100%]"}`}
      >

        {/* <div className="hidden md:flex items-center gap-8  "> */}
        {/* <div className="flex md:flex-row flex-col md:items-center md:gap-[4vw] gap-8 md:ml-0 ml-4"> */}
        <div className="flex md:flex-row flex-col md:items-center md:gap-10 gap-8 md:mx-2">
          <Link
            href="/"
            className="text-gray-900 font-medium relative after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-[#6D5DFD] after:transition-all after:duration-300 hover:text-[#6D5DFD] hover:after:w-full"
          >
            Home
          </Link>

          <Link
            href="/features"
            className="text-gray-900 font-medium relative after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-[#6D5DFD] after:transition-all after:duration-300 hover:text-[#6D5DFD] hover:after:w-full"
          >
            Features
          </Link>

          <Link
            href="/pricing"
            className="text-gray-900 font-medium relative after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-[#6D5DFD] after:transition-all after:duration-300 hover:text-[#6D5DFD] hover:after:w-full"
          >
            Pricing
          </Link>

          <Link
            href="/about"
            className="text-gray-900 font-medium relative after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-[#6D5DFD] after:transition-all after:duration-300 hover:text-[#6D5DFD] hover:after:w-full"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-gray-900 font-medium relative after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-[#6D5DFD] after:transition-all after:duration-300 hover:text-[#6D5DFD] hover:after:w-full"
          >
            Contact
          </Link>




        </div>

        {/* Right Side - Buttons */}

        {/* <div className="flex md:flex-row flex-col gap-4 mt-8 md:mt-0 ml-4"> */}
       
       
        <div className="flex md:flex-row flex-col gap-4 mt-8 md:mt-0 md:ml-20">
          <ThemeToggle />
          <Link
            href="/login"
            className="bg-white border border-[#5B4DF0] text-[#111827] rounded-xl px-5 py-2 hover:scale-95 transition duration-300"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="bg-[#6D5DFD] text-white rounded-xl px-5 py-2 border  border-[#5B4DF0] hover:bg-[#5B4DF0] hover:scale-95 transition duration-300"
          >
            Get Started
          </Link>

        </div>

      </div>

      <div
        className="md:hidden cursor-pointer z-50 relative"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <CircleX
            size={32}
            className="text-gray-900 transition-all duration-300"
          />
        ) : (
          <Menu
            size={32}
            className="text-gray-900 transition-all duration-300"
          />
        )}

      </div>

    </nav >
  );
}