import Link from "next/link";
import {
  FaSquarePlus,
  FaBullhorn,
  FaTags,
  FaBagShopping,
  FaStore,
  FaTableColumns,
  FaHandHoldingDollar,
} from "react-icons/fa6";
import Heading from "@/components/Heading";

const links = [
  { href: "/rooms/add", icon: <FaSquarePlus className="text-3xl" />, label: "Add Food Stall" },
  { href: "/foodstall/add-promos", icon: <FaBullhorn className="text-3xl" />, label: "Create Promos" },
  { href: "/foodstall/promos", icon: <FaTags className="text-3xl" />, label: "Promotions" },
  { href: "/foodstall/order-status", icon: <FaBagShopping className="text-3xl" />, label: "Orders" },
  { href: "/foodstall/approval", icon: <FaHandHoldingDollar className="text-3xl" />, label: "Stall Lease" },
  { href: "/rooms/my", icon: <FaStore className="text-3xl" />, label: "My Food Stall" },
  { href: "/foodstall/tables", icon: <FaTableColumns className="text-3xl" />, label: "Tables" },
];


const FoodStallPage = () => {
  return (
<div className="min-h-screen bg-gray-100 p-6">
<Heading title="Food Stall Dashboard" />
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

export default FoodStallPage;
