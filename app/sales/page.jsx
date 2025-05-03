import SalesCard from '@/components/SalesCard';  // Adjust the import path as needed
import Heading from '@/components/Heading';  // If you have a Heading component, you can import it like this

const SalesPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Heading title="Sales Overview by Foodstall" />  {/* Optional, for page title */}
        <SalesCard />  {/* Your SalesCard component */}
      </div>
    </div>
  );
};

export default SalesPage;
