import Link from "next/link";
import { FaChartBar, FaStar, FaUser, FaUsers} from "react-icons/fa";
import Heading from "@/components/Heading";
import { FaBagShopping } from "react-icons/fa6";

const links = [
  
  { href: "/admin/all-orders", icon: <FaBagShopping className="text-3xl" />, label: "Orders" },
  { href: "/foodstall/sales", icon: <FaChartBar className="text-3xl" />, label: "Sales" },
  { href: "/reviews", icon: <FaStar className="text-3xl" />, label: "Reviews" }, 
  { href: "/admin/create-account", icon: <FaUser className="text-3xl" />, label: "Create Stall Account" }, 
  { href: "/admin/accounts", icon: <FaUsers className="text-3xl" />, label: "All Accounts" }, 


  
];

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <Heading title="Admin Dashboard" />
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

export default AdminPage;
