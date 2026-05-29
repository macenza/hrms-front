import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

const analyticsPoints = [
  "Employee & Attendance Overview",
  "Leave & Payroll Analytics",
  "Productivity & Performance Metrics",
];

export default function AnalyticsSection() {
  return (
    <section
      className="
      w-full
      py-12
      px-6
      md:px-12
      lg:px-20
      bg-cover
      bg-center
      bg-no-repeat
      "
      style={{
        backgroundImage: "url('/bg.png')",
      }}
    >

      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 ">

        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/3">

          {/* Small Label */}

          <div className="px-4 py-0  rounded-full bg-[#EEEAFE] text-[#6D5DFD] text-sm font-semibold mb-6 w-40 ">
            Real-Time Insights
          </div>

          {/* Heading */}

          <h1 className="text-3xl md:text-3xl font-bold leading-tight text-gray-900">
            Powerful Dashboard & <br />
            <span className="text-[#6D5DFD] Regular">
              Analytics
            </span>
          </h1>


          {/* Description */}
          <p className="mt-6 mb-3 text-gray-600 text-lg leading-relaxed max-w-lg">
            Get instant insights into your organization with beautiful charts and reports.
          </p>
          {/* <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Get instant insights into your organization with beautiful charts and reports.
          </p> */}

          {/* Analytics Points */}
          <div className="space-y-4">

            {analyticsPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-3"
              >
                <CheckCircle2
                  size={20}
                  className="text-[#6D5DFD]"
                />

                <span className="text-gray-700 font-medium">
                  {point}
                </span>
              </div>
            ))}

          </div>
          {/* <Link
    href="/login"
    className="
    
    bg-[#6D5DFD]
    text-white
    px-6
    py-3
    rounded-xl
    font-semibold
    hover:bg-[#5B4DF0]
    transition
    text-center
    "
  >
    View Dashboard
  </Link> */}

          {/* Button */}
          {/* <Link
            href="/login"
            className="inline-block mt-10 bg-[#6D5DFD] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#5B4DF0] transition"
          >
            View Dashboard
          </Link> */}

        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-2/3 flex justify-center">

          <Image
            src="/1.png"
            alt="Analytics Dashboard"
            width={900}
            height={600}
            className="
            w-full
            max-w-4xl
            rounded-3xl
            shadow-2xl
            border
            border-gray-200
            "
            priority
          />

        </div>

      </div>
    </section>
  );
}