import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-80">
        <h2 className="text-2xl font-bold text-center mb-6">
          MatApp Home Page
        </h2>
        <p className="text-center">You are logged in successfully!</p>
      </div>
    </div>
  );
};

export default Home;
