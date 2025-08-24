import { useState } from "react";
import { Label, Button } from "flowbite-react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { FaCheck, FaRegCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import PageWrapper from "../common/PageWrapper";
import { changePassword } from "../../service/apiService";

const ChangePassword = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Password strength validation
  const passwordChecks = {
    length: passwordData.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(passwordData.newPassword),
    lowercase: /[a-z]/.test(passwordData.newPassword),
    number: /\d/.test(passwordData.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword),
  };

  const isPasswordStrong = Object.values(passwordChecks).every(check => check);
  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword;

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.id]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isPasswordStrong) {
      toast.error("Please ensure your new password meets all security requirements");
      return;
    }

    if (!passwordsMatch) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the actual password change API
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="page-container p-6 mx-auto max-w-2xl">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="border-b-2 border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update your password to keep your account secure
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Current Password */}
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative mt-1">
                <input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  required
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPasswords.current ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative mt-1">
                <input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  required
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPasswords.new ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicators */}
              {passwordData.newPassword && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Password Requirements:
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {passwordChecks.length ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaRegCircle className="text-gray-400" />
                      )}
                      <p className={passwordChecks.length ? "text-green-600" : ""}>
                        At least 8 characters
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordChecks.uppercase ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaRegCircle className="text-gray-400" />
                      )}
                      <p className={passwordChecks.uppercase ? "text-green-600" : ""}>
                        Contains uppercase letter
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordChecks.lowercase ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaRegCircle className="text-gray-400" />
                      )}
                      <p className={passwordChecks.lowercase ? "text-green-600" : ""}>
                        Contains lowercase letter
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordChecks.number ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaRegCircle className="text-gray-400" />
                      )}
                      <p className={passwordChecks.number ? "text-green-600" : ""}>
                        Contains number
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordChecks.special ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaRegCircle className="text-gray-400" />
                      )}
                      <p className={passwordChecks.special ? "text-green-600" : ""}>
                        Contains special character
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Password Strength</span>
                      <span>
                        {isPasswordStrong ? 'Strong' : 'Weak'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isPasswordStrong 
                            ? 'bg-green-600 w-full' 
                            : 'bg-red-500 w-1/3'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your new password"
                  required
                  disabled={isLoading}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-gray-100 disabled:cursor-not-allowed pr-10 ${
                    passwordData.confirmPassword && !passwordsMatch
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPasswords.confirm ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
              {passwordData.confirmPassword && !passwordsMatch && (
                <p className="text-red-500 text-xs mt-1">
                  Passwords do not match
                </p>
              )}
              {passwordData.confirmPassword && passwordsMatch && passwordData.newPassword && (
                <p className="text-green-600 text-xs mt-1">
                  Passwords match ✓
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading || !isPasswordStrong || !passwordsMatch}
                isProcessing={isLoading}
                processingSpinner={<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              >
                {isLoading ? "Changing Password..." : "Change Password"}
              </Button>
              <Button 
                type="button" 
                color="gray"
                onClick={() => {
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
          </form>

          {/* Security Tips */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Password Security Tips:
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use a unique password that you don't use elsewhere</li>
              <li>• Consider using a password manager to generate and store passwords</li>
              <li>• Change your password regularly for better security</li>
              <li>• Never share your password with anyone</li>
            </ul>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ChangePassword;
