import Link from "next/link";
import {

    Mail,
    Phone,
    MapPin,
} from "lucide-react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="w-full bg-[#0B1437] text-white px-6 md:px-12 lg:px-20 pt-16 pb-8">

            {/* Top Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 border-b border-white/10 pb-12">

                {/* Logo + Description */}
                <div className="lg:col-span-1">

                    {/* Logo */}
                    <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#6D5DFD] to-[#8B7BFF] bg-clip-text text-transparent mb-5">
                        MACENZA
                    </h2>

                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-6">
                        All-in-one HR management system to streamline your workforce operations.
                    </p>

                    {/* Social Icons */}
                    <div className="flex items-center gap-4">

                         <div
    className="
    w-9
    h-9
    rounded-full
    bg-white/10
    flex
    items-center
    justify-center
    footer-link
    hover:text-[#8B7BFF]
    cursor-pointer
    transition
    "
  >
    <FaFacebookF size={16} />
  </div>


                         <div
    className="
    w-9
    h-9
    rounded-full
    bg-white/10
    flex
    items-center
    justify-center
    footer-link
    hover:text-[#8B7BFF]
    cursor-pointer
    transition
    "
  >
    <FaTwitter size={16} />
  </div>


                        <div
    className="
    w-9
    h-9
    rounded-full
    bg-white/10
    flex
    items-center
    justify-center
    footer-link
    hover:text-[#8B7BFF]
    cursor-pointer
    transition
    "
  >
    <FaLinkedinIn size={16} />
  </div>


                        <div
    className="
    w-9
    h-9
    rounded-full
    bg-white/10
    flex
    items-center
    justify-center
    footer-link
    hover:text-[#8B7BFF]
    cursor-pointer
    transition
    "
  >
    <FaInstagram size={16} />
  </div>

                    </div>
                </div>

                {/* Product */}
                <div>
                    <h3 className="font-bold text-lg mb-5">
                        Product
                    </h3>

                    <div className="flex flex-col gap-3 text-gray-300 text-sm">

                        <Link href="/" className="footer-link hover:text-[#8B7BFF]">
                            Features
                        </Link>

                        <Link href="/" className="footer-link hover:text-[#8B7BFF]">
                            Modules
                        </Link>

                        <Link href="/" className="footer-link hover:text-[#8B7BFF]">
                            Pricing
                        </Link>

                        <Link href="/" className="footer-link hover:text-[#8B7BFF]">
                            Updates
                        </Link>

                    </div>
                </div>

                {/* Company */}
                <div>
                    <h3 className="font-bold text-lg mb-5">
                        Company
                    </h3>

                    <div className="flex flex-col gap-3 text-gray-300 text-sm">

                        <Link href="/" className="footer-link hover:text-[#8B7BFF]">
                            About Us
                        </Link>

                        <Link href="/" className="footer-link hover:text-[#8B7BFF]">
                            Careers
                        </Link>

                        <Link href="/" className="footer-link hover:text-[#8B7BFF]">
                            Blog
                        </Link>

                        <Link href="/" className="footer-link hover:text-[#8B7BFF]">
                            Contact Us
                        </Link>

                    </div>
                </div>

                {/* Resources */}
                <div>
                    <h3 className="font-bold text-lg mb-5">
                        Resources
                    </h3>

                    <div className="flex flex-col gap-3 text-gray-300 text-sm">

                        <Link href="/" className="footer-link hover:text-[#8B7BFF]">
                            Documentation
                        </Link>

                        <Link href="/" className="footer-link hover:text-[#8B7BFF]">
                            Help Center
                        </Link>

                        <Link href="/" className="footer-link hover:text-[#8B7BFF]">
                            Privacy Policy
                        </Link>

                        <Link href="/" className="footer-link hover:text-[#8B7BFF]">
                            Terms of Service
                        </Link>

                    </div>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="font-bold text-lg mb-5">
                        Contact
                    </h3>

                    <div className="flex flex-col gap-4 text-gray-300 text-sm">

                        <div className="flex items-start gap-3">
                            <Mail size={16} className="mt-1 shrink-0" />
                            <span>info@hrms.com</span>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone size={16} className="mt-1 shrink-0" />
                            <span>+91 98765 43210</span>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin size={16} className="mt-1 shrink-0" />
                            <span>
                                123 Business Park, Ahmedabad, India
                            </span>
                        </div>

                    </div>
                </div>

            </div>

            {/* Bottom */}
            <div className="pt-6 text-center text-sm text-gray-400">
                © 2026 MACENZA. All rights reserved.
            </div>

        </footer>
    );
}