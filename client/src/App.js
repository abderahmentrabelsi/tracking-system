import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard/dashboard.jsx";
import Login from "./components/Login/login.jsx";
import SurveyComponent from "./components/Reporting/SurveyComponent.jsx";

const App=()=> {
  // Ignoring unused variable warning for setIsAuthenticated
  // eslint-disable-next-line
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Route to the Dashboard component */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/report-issue" element={<SurveyComponent />} />

        {/* Nested route for the Login component */}
        <Route path="/login" element={<Login />} />

        {/* Protected route for Dashboard, redirects to Login if not authenticated */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

