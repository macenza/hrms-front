import {
  ShieldCheck,
  Boxes,
  Network,
  Hexagon,
  Orbit,
  Workflow,
} from "lucide-react";

export default function TrustedCompanies() {
  return (
    <section className="w-full h-auto bg-white py-8 border-t border-gray-100">
      
      {/* Heading */}
      <div className="text-center mb-4">
        <p className="text-sm font-bold tracking-wide text-gray-500 uppercase">
          Trusted by 500+ Companies
        </p>
      </div>

      {/* Companies */}
      <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 px-6">

        {/* Company 1 */}
        <div className="flex items-center gap-2 text-gray-500 hover:text-[#6D5DFD] transition">
          <ShieldCheck size={22} />
          <span className="font-semibold">techwave</span>
        </div>

        {/* Company 2 */}
        <div className="flex items-center gap-2 text-gray-500 hover:text-[#6D5DFD] transition">
          <Boxes size={22} />
          <span className="font-semibold">digitalsync</span>
        </div>

        {/* Company 3 */}
        <div className="flex items-center gap-2 text-gray-500 hover:text-[#6D5DFD] transition">
          <Network size={22} />
          <span className="font-semibold">innovatech</span>
        </div>

        {/* Company 4 */}
        <div className="flex items-center gap-2 text-gray-500 hover:text-[#6D5DFD] transition">
          <Hexagon size={22} />
          <span className="font-semibold">softgrid</span>
        </div>

        {/* Company 5 */}
        <div className="flex items-center gap-2 text-gray-500 hover:text-[#6D5DFD] transition">
          <Orbit size={22} />
          <span className="font-semibold">hexaware</span>
        </div>

        {/* Company 6 */}
        <div className="flex items-center gap-2 text-gray-500 hover:text-[#6D5DFD] transition">
          <Workflow size={22} />
          <span className="font-semibold">webstem</span>
        </div>

      </div>
    </section>
  );
}