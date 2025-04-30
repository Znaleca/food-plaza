import RateCard from '@/components/RateCard';
import Heading from '@/components/Heading'; 

const ReviewsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Heading title="All Reviews by Foodstall" />
        <RateCard />
      </div>
    </div>
  );
};

export default ReviewsPage;
