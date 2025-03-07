const AboutPage = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
            <header className="text-3xl font-bold text-gray-800 mb-4">About UniSpaces</header>
            <section className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6 space-y-6">
                {/* Introduction */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Our Mission</h2>
                    <p className="text-gray-600">
                        UniSpaces is designed to make booking and managing spaces simple and efficient. Our mission is to help organizations and individuals find, reserve, and manage their ideal spaces with ease.
                    </p>
                </div>

                {/* Features */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Key Features</h2>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>Easy space booking and management</li>
                        <li>User-friendly interface</li>
                        <li>Customizable notifications and reminders</li>
                        <li>Support for both individual and organizational accounts</li>
                        <li>Robust security for account protection</li>
                    </ul>
                </div>

                {/* Team */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Meet the Team</h2>
                    <p className="text-gray-600">
                        Our team consists of passionate developers, designers, and project managers who believe in simplifying space management. With a focus on user experience and security, we are dedicated to providing a reliable platform that meets your needs.
                    </p>
                </div>

                {/* Version or Contact Info */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Contact Us</h2>
                    <p className="text-gray-600">
                        Have questions or feedback? Reach out to us at <a href="mailto:support@unispaces.com" className="text-blue-500 hover:underline">support@unispaces.com</a>.
                    </p>
                    <p className="text-gray-600 mt-2">Version 1.0.0</p>
                </div>
            </section>
        </div>
    );
}
 
export default AboutPage;