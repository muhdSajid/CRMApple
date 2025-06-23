import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { validateSignup } from "../../utils/validate";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const passwordChecks = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateSignup(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      console.log("Form data submitted:", formData);
      // proceed with API call
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="border-b-2 border-gray-200 pb-4 mb-6">
          <h3 className="text-2xl font-semibold text-center">Sign Up</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-sm mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${
                  errors.firstName
                    ? "border-red-500"
                    : "border-gray-300 focus:ring-1 focus:ring-blue-500"
                }`}
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div className="w-1/2">
              <label className="block text-sm mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${
                  errors.lastName
                    ? "border-red-500"
                    : "border-gray-300 focus:ring-1 focus:ring-blue-500"
                }`}
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300 focus:ring-1 focus:ring-blue-500"
              }`}
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-300 focus:ring-1 focus:ring-blue-500"
                } pr-10`}
                value={formData.password}
                onChange={handleChange}
              />
              <div
                className="absolute top-2.5 right-3 text-gray-500 cursor-pointer"
                onClick={togglePassword}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Password Requirements */}
          <div className="text-xs text-gray-600 space-y-1 mt-2">
            <div className="flex items-center gap-2">
              {passwordChecks.length ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaRegCircle className="text-gray-400" />
              )}
              <p className={passwordChecks.length ? "text-green-600" : ""}>
                At least 8 characters
              </p>
            </div>
            <div className="flex items-center gap-2">
              {passwordChecks.upper ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaRegCircle className="text-gray-400" />
              )}
              <p className={passwordChecks.upper ? "text-green-600" : ""}>
                Contains uppercase letter
              </p>
            </div>
            <div className="flex items-center gap-2">
              {passwordChecks.number ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaRegCircle className="text-gray-400" />
              )}
              <p className={passwordChecks.number ? "text-green-600" : ""}>
                Contains number
              </p>
            </div>
            <div className="flex items-center gap-2">
              {passwordChecks.special ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaRegCircle className="text-gray-400" />
              )}
              <p className={passwordChecks.special ? "text-green-600" : ""}>
                Contains special character
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition duration-200"
          >
            Sign Up
          </button>

          <p className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
