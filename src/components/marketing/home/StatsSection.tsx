import {
  Users,
  Building2,
  BadgeCheck,
  Clock3,
  ShieldCheck,
} from "lucide-react";

export default function StatsSection() {

  const stats = [
    {
      id: 1,
      icon: Users,
      value: "5000+",
      label: "Employees Managed",
    },

    {
      id: 2,
      icon: Building2,
      value: "120+",
      label: "Companies",
    },

    {
      id: 3,
      icon: BadgeCheck,
      value: "99.9%",
      label: "Payroll Accuracy",
    },

    {
      id: 4,
      icon: Clock3,
      value: "24/7",
      label: "System Uptime",
    },

    {
      id: 5,
      icon: ShieldCheck,
      value: "50+",
      label: "Modules & Features",
    },
  ];

  return (

    <section className="w-full bg-white px-4 sm:px-6 md:px-12 lg:px-20 py-2 sm:py-10">

      {/* Main Container */}
      <div
        className="
        max-w-7xl
        mx-auto
        rounded-2xl
        bg-gradient-to-r
        from-[#1F2557]
        to-[#232B67]
        overflow-hidden
        py-4
        "
      >

        {/* Stats Grid */}
        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-5
          "
        >

          {stats.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={item.id}
                className={`
                flex
                items-center
                justify-center
                gap-3

                px-4
                sm:px-5
                md:px-6

                py-5
                sm:py-6

                ${
                  index !== stats.length - 1
                    ? `
                      border-b
                      sm:border-b
                      lg:border-b-0
                      lg:border-r
                      border-white/10
                    `
                    : ""
                }
                `}
              >

                {/* Icon */}
                <div
                  className="
                  min-w-10
                  h-10
                  sm:min-w-11
                  sm:h-11
                  rounded-full
                  bg-white/10
                  flex
                  items-center
                  justify-center
                  "
                >
                  <Icon
                    size={18}
                    className="text-[#A78BFA]"
                  />
                </div>

                {/* Text */}
                <div>

                  <h3
                    className="
                    text-white
                    text-lg
                    sm:text-xl
                    font-bold
                    leading-none
                    "
                  >
                    {item.value}
                  </h3>

                  <p
                    className="
                    text-gray-300
                    text-xs
                    sm:text-sm
                    mt-1
                    whitespace-nowrap
                    "
                  >
                    {item.label}
                  </p>

                </div>

              </div>

            );
          })}

        </div>

      </div>

    </section>

  );
}