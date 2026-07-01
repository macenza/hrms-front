import Image from "next/image";
import { Shield, Users, User, Check } from "lucide-react";

export default function RolesCard() {

  const roles = [
    {
      id: 1,
      title: "Admin",
      image: "/RoleModel1.webp",
      icon: Shield,
      badgeColor: "bg-purple-100 text-purple-600",
      titleColor: "text-purple-600",
      points: [
        "Full system access",
        "Manage all employees",
        "Access analytics",
        "Manage company settings",
      ],
    },

    {
      id: 2,
      title: "HR Executive",
      image: "/RoleModel1.webp",
      icon: Users,
      badgeColor: "bg-blue-100 text-blue-600",
      titleColor: "text-blue-600",
      points: [
        "Manage attendance",
        "Handle payroll",
        "Approve leave requests",
        "Track employee records",
      ],
    },

    {
      id: 3,
      title: "Employee",
      image: "/RoleModel3.webp",
      icon: User,
      badgeColor: "bg-green-100 text-green-600",
      titleColor: "text-green-600",
      points: [
        "View dashboard",
        "Apply for leave",
        "Track attendance",
        "Update profile",
      ],
    },
  ];

  return (

    <section className="w-full bg-white py-20 px-4 md:px-12 lg:px-20">

      {/* Heading */}
      <div className="text-center mb-16">

        <p className="uppercase tracking-widest text-sm font-bold text-gray-500 mb-4">
          Role Based Access Control
        </p>

        {/* <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Different Roles. Different Capabilities.
        </h2> */}
        <h1 className="text-3xl md:text-3xl font-bold leading-tight text-gray-900">
            Different Roles. Different <span className="text-[#6D5DFD] Regular">
              Capabilities.
            </span>
           
          </h1>

      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">

        {roles.map((role) => {

          const Icon = role.icon;

          return (

            <div
              key={role.id}
              className="
              relative
              bg-white
              border
              border-gray-200
              rounded-2xl
              shadow-md
              hover:shadow-2xl
              transition-all
              duration-300
              overflow-hidden
              "
            >

              {/* Badge */}
              <div
                className={`
                absolute
                top-4
                left-4
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                shadow-md
                z-10
                ${role.badgeColor}
                `}
              >
                <Icon size={18} />
              </div>

              {/* Main Flex Section */}
              <div className="flex items-center h-auto">

                {/* Left Image */}
                <div
                  className="
                  relative
                  w-[45%]
                  h-[300px]
                  bg-gray-50
                  flex
                  items-center
                  justify-center
                  "
                >

                  <Image
                    src={role.image}
                    alt={role.title}
                    fill
                    sizes="45vw"
                    className="object-contain "
                  />

                </div>

                {/* Right Content */}
                <div className="w-[75%] p-2">

                  {/* Title */}
                  <h3
                    className={`
                    text-xl
                    font-bold
                    mb-3
                    ${role.titleColor}
                    `}
                  >
                    {role.title}
                  </h3>

                  {/* Bullet Points */}
                  <div className="space-y-2">

                    {role.points.map((point, index) => (

                      <div
                        key={index}
                        className="flex items-start gap-3"
                      >

                        {/* Tick */}
                        <div
                          className={`
                          min-w-5
                          h-5
                          rounded-full
                          flex
                          items-center
                          justify-center
                          ${role.badgeColor}
                          `}
                        >
                          <Check size={10} />
                        </div>

                        {/* Text */}
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {point}
                        </p>

                      </div>

                    ))}

                  </div>

                </div>

              </div>

            </div>

          );
        })}

      </div>

    </section>

  );
}