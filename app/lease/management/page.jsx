import Link from "next/link";
import { FaNewspaper, FaClipboardList, FaCalendarAlt,} from "react-icons/fa";
import Heading from "@/components/Heading";

const links = [
  { href: "/lease/card", icon: <FaNewspaper className="text-3xl" />, label: "Lease Food Stall" },
  { href: "/bookings", icon: <FaClipboardList className="text-3xl" />, label: "Lease Status" },
  { href: "/calendarView", icon: <FaCalendarAlt className="text-3xl" />, label: "Calendar" },



  
];

const LeasePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <Heading title="Lease Management" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
        {links.map(({ href, icon, label }, idx) => (
          <Link
            key={idx}
            href={href}
            className="flex flex-col items-center justify-center gap-4 p-6 rounded-xl shadow-lg bg-white text-gray-800 hover:bg-yellow-400 hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
          >
            <div className="text-pink-600">{icon}</div>
            <span className="text-lg font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LeasePage;
