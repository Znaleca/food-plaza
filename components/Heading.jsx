const Heading = ({ title }) => {
  return (
    <section className="relative bg-gradient-to-r from-blue-500 to-blue-400 shadow-lg rounded-xl px-6 py-5 mb-6 animate-fadeIn">
      <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md">
        {title}
      </h1>
    </section>
  );
};

export default Heading;
