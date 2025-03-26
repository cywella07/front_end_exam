import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
  
    // Validate fields
    if (!email || !password) {
      setError('Both fields are required.');
      return;
    }
  
    try {
      // Step 1: Get CSRF cookie
      await axios.get('/sanctum/csrf-cookie');
  
      // Step 2: Send login request
      const response = await axios.post('/login', { email, password });
  
      const user = response.data.user;
  
      if (!user) {
        setError('User data missing from response.');
        return;
      }
  
      // Step 3: Store user info in localStorage for later use
      localStorage.setItem('user', JSON.stringify(user));
  
      // Step 4: Redirect based on role
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/user';
      }
    } catch (err) {
      console.error('Login error:', err.response || err.message);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };
  
  

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Login to Your Account</h2>

        {error && (
          <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? {''}
          <Link to="/register" className="text-blue-600 hover:underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
