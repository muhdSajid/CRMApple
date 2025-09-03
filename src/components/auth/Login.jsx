import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Label, Button } from "flowbite-react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { toast } from "react-toastify";
import { loginUser, reset, clearError } from "../../store/authSlice";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, isAuthenticated, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated && user) {
      navigate("/");
      return;
    }

    if (isError) {
      toast.error(message);
      dispatch(clearError());
    }

    if (isSuccess && user) {
      toast.success("Login successful!");
      navigate("/");
      dispatch(reset());
    }
  }, [user, isError, isSuccess, isAuthenticated, message, navigate, dispatch]);

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!loginData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    dispatch(loginUser(loginData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="border-b-2 border-gray-200 pb-4 mb-6">
          <h3 className="text-2xl font-semibold text-center">Login</h3>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={loginData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={loginData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                tabIndex={-1}
                disabled={isLoading}
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-2" 
            disabled={isLoading}
            isProcessing={isLoading}
            processingSpinner={<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
