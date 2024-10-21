// src/App.jsx
import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import SignUp from "./Signup";
import LogIn from "./Login";
import Dashboard from "./Dashboard"; // Import Dashboard
import { useAuthState } from "react-firebase-hooks/auth"; // Ensure this import is correct
import { auth } from "./firebaseConfig"; // Ensure this import is correct

const App = () => {
  const [user] = useAuthState(auth); // Check if user is logged in

  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <Link to="/" className="text-white mr-4 hover:underline">
          Sign Up
        </Link>
        <Link to="/login" className="text-white mr-4 hover:underline">
          Log In
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;
