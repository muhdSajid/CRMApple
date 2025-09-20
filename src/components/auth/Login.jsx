import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Label, Button } from "flowbite-react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { toast } from "react-toastify";
import { loginUser, reset, clearError, fetchUserRoleAndPrivileges } from "../../store/authSlice";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [privilegesFetched, setPrivilegesFetched] = useState(false);

  const { user, isLoading, isError, isSuccess, isAuthenticated, message, isRoleLoading } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Debug logging for all auth states
    console.log('=== LOGIN USEEFFECT DEBUG ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('isSuccess:', isSuccess);
    console.log('isError:', isError);
    console.log('privilegesFetched:', privilegesFetched);
    console.log('isRoleLoading:', isRoleLoading);
    
    if (isError) {
      console.log('Login error detected:', message);
      toast.error(message);
      dispatch(clearError());
      return;
    }

    // Only process login success once
    if (isSuccess && user && !privilegesFetched && !isRoleLoading) {
      console.log('=== LOGIN SUCCESS DETECTED ===');
      console.log('Login success detected, user data:', user);
      
      // Mark that we're about to fetch privileges to prevent multiple calls
      setPrivilegesFetched(true);
      
      // Extract user ID and token directly from the user object (login response)
      const userId = user.id || user.userId || user.user_id || user.sub;
      const token = user.token || user.accessToken || user.access_token;
      
      console.log('=== USERID AND TOKEN EXTRACTION ===');
      console.log('Extracted userId:', userId);
      console.log('Extracted token:', token ? 'Token available' : 'No token');
      
      if (userId && token) {
        console.log('✅ User ID and token found, calling fetchUserRoleAndPrivileges');
        
        dispatch(fetchUserRoleAndPrivileges({ userId, token }))
          .unwrap()
          .then((roleData) => {
            console.log('✅ Role and privileges fetched successfully:', roleData);
            navigate("/");
            dispatch(reset());
            setPrivilegesFetched(false); // Reset for future logins
          })
          .catch((error) => {
            console.error("❌ Failed to fetch role and privileges:", error);
            toast.error("Warning: Failed to load user permissions. Some features may not be available.");
            navigate("/");
            dispatch(reset());
            setPrivilegesFetched(false); // Reset for future logins
          });
      } else {
        console.error("❌ Unable to get user ID or token for role fetching. User data:", user);
        toast.error("Warning: Unable to load user permissions. Some features may not be available.");
        navigate("/");
        dispatch(reset());
        setPrivilegesFetched(false); // Reset for future logins
      }
    }
    
    // If already authenticated, redirect to dashboard (but don't interfere with login flow)
    if (isAuthenticated && user && !isSuccess && !isLoading) {
      console.log('User already authenticated, redirecting...');
      navigate("/");
      return;
    }
  }, [user, isError, isSuccess, isAuthenticated, message, navigate, dispatch, isLoading, isRoleLoading, privilegesFetched]);

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
              disabled={isLoading || isRoleLoading}
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
                disabled={isLoading || isRoleLoading}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                tabIndex={-1}
                disabled={isLoading || isRoleLoading}
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-2" 
            disabled={isLoading || isRoleLoading}
            isProcessing={isLoading || isRoleLoading}
            processingSpinner={<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          >
            {isLoading ? "Signing In..." : isRoleLoading ? "Loading permissions..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
