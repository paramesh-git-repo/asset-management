import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login, register } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;
      
      if (isLogin) {
        result = await login(email, password);
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
      }

      if (result.success) {
        onAuthSuccess(); // notify parent (App.js) that auth worked
      } else {
        setError(result.error || "Something went wrong");
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
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
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
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
          />

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
