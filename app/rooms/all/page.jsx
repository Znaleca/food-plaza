import Heading from '@/components/Heading';
import MySpaceCard from '@/components/MySpaceCard';
import getAllSpaces from '@/app/actions/getAllSpaces';

const AllSpacePage = async () => {
  const rooms = await getAllSpaces();

  return (
    <>
      <Heading title='My Spaces' />
      {rooms.length > 0 ? (
        rooms.map((room) => <MySpaceCard key={room.$id} room={room} />)
      ) : (
        <p>You have no Spaces listings</p>
      )}
    </>
  );
};

export default AllSpacePage;