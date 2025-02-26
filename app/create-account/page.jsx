'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import createSuperUser from "@/app/actions/createSuperUser";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const CreateAccountPage = () => {
  const [state, setState] = useState({ success: false, error: "" });
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  // Error states
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Registration successful!");
      router.push("/welcome");
    }
  }, [state, router]);

  // Validation functions
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value.length < 8 ? "Password must be at least 8 characters." : "");
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(value !== password ? "Passwords do not match." : "");
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setRole(value);
    setRoleError(!value ? "Please select a role." : "");
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword || !role) {
      return toast.error("Please fill in all fields.");
    }

    if (passwordError || confirmPasswordError || roleError) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirm-password", confirmPassword);
    formData.append("role", role);

    const response = await createSuperUser(null, formData);
    setState(response);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-200 via-green-200 to-teal-200">
      <div className="absolute inset-0 bg-black opacity-30"></div>

      <div className="relative z-10 bg-white bg-opacity-90 rounded-lg shadow-lg p-10 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Super Account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Nickname</label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="John"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="johndoe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          <div className="mb-4 relative">
            <label htmlFor="confirm-password" className="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirm-password"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </button>
            </div>
            {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="role" className="block text-gray-700 font-medium mb-2">Select Role</label>
            <select
              id="role"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={role}
              onChange={handleRoleChange}
              required
            >
              <option value="">Choose a Role</option>
              <option value="isAdmin">Admin</option>
              <option value="isOffice">Office</option>
              <option value="isAffiliate">Affiliate</option>
              <option value="isSuperAdmin">Super Admin</option>
            </select>
            {roleError && <p className="text-red-500 text-sm mt-1">{roleError}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 text-lg font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Register
          </button>

          <p className="text-center mt-4 text-sm text-gray-700">
            Already have an account?{" "}
            <Link href="/login" className="text-green-500 hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountPage;
