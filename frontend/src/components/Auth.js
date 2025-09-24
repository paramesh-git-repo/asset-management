import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Clear error when user starts typing
  const clearError = () => {
    if (error) {
      setError("");
    }
  };



  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any previous errors

    try {
      let result;
      
      if (isLogin) {
        result = await login(email, password);
        
        // Handle login result
        if (result && result.success) {
          // Clear form after successful login
          setEmail("");
          setPassword("");
          setError("");
          // User state is already set by the login function in AuthContext
          // Redirect to dashboard after successful login
          console.log('Login successful, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          const errorMessage = result?.error || "Login failed. Please check your credentials.";
          setError(errorMessage);
        }
      } else {
        const nameParts = name.split(' ');
        const userData = { 
          username: email, // Use email as username
          email, 
          password, 
          firstName: nameParts[0] || name,
          lastName: nameParts.slice(1).join(' ') || '',
          role: role
        };
        result = await register(userData);
        
        // Handle registration result
        if (result && result.success) {
          // Clear form after successful registration
          setName("");
          setEmail("");
          setPassword("");
          setError("");
          // User state is already set by the register function in AuthContext
          // Redirect to dashboard after successful registration
          console.log('Registration successful, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          const errorMessage = result?.error || "Registration failed. Please try again.";
          setError(errorMessage);
        }
      }
    } catch (err) {
      setError("Network error. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Signup"}
        </h2>


        {error && (
          <div
            className="error-alert"
            style={{
              backgroundColor: "#fef2f2",   // soft light red background
              color: "#b91c1c",            // deep red text
              padding: "12px 16px",
              borderRadius: "6px",
              border: "1px solid #fca5a5", // light red border
              marginBottom: "16px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {error}
          </div>
        )}
        

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              />
              
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : (isLogin ? "Login" : "Signup")}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setShowPassword(false);
            }}
            className="text-blue-600 font-medium hover:text-blue-800"
          >
            {isLogin ? "Signup" : "Login"}
          </button>
        </p>

      </div>
    </div>
  );
}
