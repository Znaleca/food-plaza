import Link from "next/link";
import {
  FaSquarePlus,
  FaBullhorn,
  FaTags,
  FaBagShopping,
  FaChartLine,
  FaStore
} from "react-icons/fa6";
import Heading from "@/components/Heading";

const links = [
  { href: "/rooms/add", icon: <FaSquarePlus className="text-xl" />, label: "Add Food Stall" },
  { href: "/foodstall/add-promos", icon: <FaBullhorn className="text-xl" />, label: "Create Promos" },
  { href: "/foodstall/promos", icon: <FaTags className="text-xl" />, label: "Promotions" },
  { href: "/foodstall/order-status", icon: <FaBagShopping className="text-xl" />, label: "Orders" },
  { href: "/foodstall/sales", icon: <FaChartLine className="text-xl" />, label: "Sales" },
  { href: "/foodstall/approval", icon: <FaStore className="text-xl" />, label: "Stall Lease" },
  { href: "/rooms/my", icon: <FaStore className="text-xl" />, label: "My Food Stall" },
  { href: "/foodstall/tables", icon: <FaStore className="text-xl" />, label: "Tables" },
];

const FoodStallPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Heading title="Food Stall Dashboard" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
        {links.map(({ href, icon, label }, idx) => (
          <Link
            key={idx}
            href={href}
            className="flex items-center gap-3 p-4 rounded-xl shadow-md bg-white hover:bg-gray-50 transition duration-200"
          >
            <div className="text-blue-600">{icon}</div>
            <span className="text-gray-800 font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FoodStallPage;
