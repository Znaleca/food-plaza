'use client';

const VerifyPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Your account is pending approval</h2>
        <p className="mt-2 text-gray-600">
          Please wait for an admin to review and approve your account.
        </p>
      </div>
    </div>
  );
};

export default VerifyPage;
