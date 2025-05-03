const AboutPage = () => {
    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
            {/* Welcome Section */}
            <section className="w-full max-w-3xl bg-black rounded-lg shadow-xl p-8 space-y-8">
                {/* Introduction */}
                <div>
                    <h1 className="text-4xl font-extrabold text-pink-600">Welcome to The Corner Food Plaza</h1>
                    <p className="text-lg text-gray-400 mt-4">
                        The Corner Food Plaza is your go-to spot for the best merienda and dinner experience in town! Whether you're craving classic Filipino snacks or a hearty dinner, we've got you covered. From your favorite <strong className="text-yellow-400">lumpia</strong>, <strong className="text-yellow-400">kwek-kwek</strong>, and <strong className="text-yellow-400">halo-halo</strong>, to savory dishes like <strong className="text-yellow-400">sinigang</strong> and <strong className="text-yellow-400">lechon kawali</strong>, we’ve got something for everyone. 
                        Grab your friends and family and enjoy a fun-filled, casual dining experience perfect for merienda or dinner time.
                    </p>
                </div>

                {/* Features */}
                <div>
                    <h2 className="text-3xl font-semibold text-pink-600">Why Visit Us?</h2>
                    <ul className="list-disc list-inside text-gray-400 space-y-2 mt-4">
                        <li>Variety of food stalls offering Filipino favorites for merienda and dinner</li>
                        <li>Perfect spot to hang out with friends and family in a cozy, relaxed ambiance</li>
                        <li>Live band performances every weekend to set the mood for a fun-filled night</li>
                        <li>Plenty of tables for dine-in, whether you’re with a group or just enjoying a quiet snack</li>
                        <li>Affordable meals, so you can enjoy more without breaking the bank!</li>
                    </ul>
                </div>

                {/* Passion */}
                <div>
                    <h2 className="text-3xl font-semibold text-pink-600">Our Passion</h2>
                    <p className="text-lg text-gray-400 mt-4">
                        Our team is dedicated to bringing you the best Filipino comfort food, with a focus on quality and flavor. Every dish is prepared with love, and we strive to create a warm and inviting atmosphere where everyone can enjoy good food, good company, and good vibes. Whether it's a light snack or a hearty dinner, we make sure every bite feels like home.
                    </p>
                </div>

                {/* Contact / Version Info */}
                <div className="mt-8">
                    <h2 className="text-3xl font-semibold text-pink-600">Visit Us</h2>
                    <p className="text-lg text-gray-400 mt-4">
                        Hungry yet? We’re open every day to satisfy your merienda cravings and dinner hunger. Bring your loved ones, take a seat, and let’s enjoy a great meal together! For questions or inquiries, don’t hesitate to contact us at <a href="mailto:support@thecornerfoodplaza.com" className="text-yellow-400 hover:underline">support@thecornerfoodplaza.com</a>.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Version 1.0.0</p>
                </div>
            </section>
        </div>
    );
}

export default AboutPage;
