import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4 text-blue-600 text-center">Welcome to Event Booking System</h1>
      <p className="text-center text-gray-600 mb-6 max-w-md">
        Browse upcoming events and reserve your spot with ease.
      </p>

      <div className="flex gap-4 mb-8">
        <Link
          to="/login"
          className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-2 rounded bg-gray-200 text-blue-600 hover:bg-gray-300"
        >
          Sign Up
        </Link>
      </div>
    </section>
  );
};

export default Home;
