import Heading from '@/components/Heading';
import MySpaceCard from '@/components/MySpaceCard';
import getMySpaces from '@/app/actions/getMySpaces';

const MySpacePage = async () => {
  const rooms = await getMySpaces();

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

export default MySpacePage;