import Heading from "@/components/Heading"; // Assuming you have this Heading component

const PolicyPrivacyPage = () => {
  return (
    <div className="p-6 bg-white text-gray-800">
      <Heading title="Privacy Policy" />

      <p className="mb-4">
        Welcome to <strong>The Corner Food Plaza</strong>. We value your privacy and are committed to protecting any personal information you share with us. This Privacy Policy explains how we collect, use, and safeguard your data when you visit or interact with our website.
      </p>

      <Heading title="1. Information We Collect" />
      <p className="mb-4">
        We may collect personal information such as your name, email address, and feedback when you contact us directly at{" "}
        <a href="mailto:support@thecornerfoodplaza.com" className="text-blue-600 underline">
          support@thecornerfoodplaza.com
        </a>
        . We also gather non-personal information like browser type and device information to improve the website experience.
      </p>

      <Heading title="2. How We Use Your Information" />
      <ul className="list-disc list-inside mb-4">
        <li>To respond to your inquiries or feedback</li>
        <li>To improve the performance and content of our website</li>
        <li>To send updates about our services or promotions (only if you’ve opted in)</li>
      </ul>

      <Heading title="3. Data Sharing" />
      <p className="mb-4">
        We do not sell, trade, or share your personal information with third parties except as required by law or to protect our legal rights.
      </p>

      <Heading title="4. Cookies" />
      <p className="mb-4">
        Our website may use cookies to enhance your browsing experience. You can choose to disable cookies in your browser settings at any time.
      </p>

      <Heading title="5. Your Rights" />
      <p className="mb-4">
        You have the right to request access to or deletion of your personal data that we hold. To do so, please email us at{" "}
        <a href="mailto:support@thecornerfoodplaza.com" className="text-blue-600 underline">
          support@thecornerfoodplaza.com
        </a>
        .
      </p>

      <Heading title="6. Changes to This Policy" />
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Any changes will be posted on this page with a new version number and date.
      </p>

      <p className="mt-6 text-sm text-gray-500">Version 1.0.0 – Last updated May 10, 2025</p>
    </div>
  );
};

export default PolicyPrivacyPage;
