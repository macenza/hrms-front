import {
  Users,
  Camera,
  Wallet,
  ClipboardCheck,
  Boxes,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    id: 1,
    title: "Employee Management",
    description:
      "Manage employee information, documents and lifecycle easily.",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 2,
    title: "Attendance Tracking",
    description:
      "Track clock-in/out, attendance, and working patterns.",
    icon: Camera,
    color: "bg-orange-100 text-orange-500",
  },
  {
    id: 3,
    title: "Payroll Management",
    description:
      "Automate payroll processing and generate payslips.",
    icon: Wallet,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 4,
    title: "Leave Management",
    description:
      "Easy leave requests, approvals and balance tracking.",
    icon: ClipboardCheck,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 5,
    title: "Asset Management",
    description:
      "Track company assets and assign to employees.",
    icon: Boxes,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    id: 6,
    title: "Projects & Tasks",
    description:
      "Manage projects, assign tasks and track team progress.",
    icon: FolderKanban,
    color: "bg-pink-100 text-pink-600",
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full bg-[#F8F9FF] py-20 px-6 md:px-12 lg:px-20">

      {/* Top Heading */}
      <div className="text-center mb-14">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">
          Powerful Features
        </p>
 

        <h2 className="text-3xl md:text-3xl font-bold text-gray-900">
          Everything You Need to{" "}
          <span className="text-[#6D5DFD] 
                     Regular">
            Manage Your HR
          </span>
        </h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">

        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.id}
              className="
              bg-white
              rounded-2xl
              border border-gray-100
              p-6
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-2
              transition-all
              duration-300
              "
            >
              
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.color}`}
              >
                <Icon size={22} />
              </div>

              {/* Title */}
              <h3 className="text-md font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}