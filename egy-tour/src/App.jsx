import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import Welcome from './Welcome';
import AboutEgyptPage from './AboutEgyptPage';
import CitiesPage from './CitiesPage';
import CategoriesPage from './CategoriesPage';
import ProfilePage from './ProfilePage';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for the initial login page */}
        <Route path="/" element={<LoginPage />} />

        {/* Other authentication routes */}
        <Route path="/login" element={<Navigate to="/" />} /> {/* Redirect /login to / */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes that use the Layout */}
        <Route path="/welcome" element={<Layout><Welcome /></Layout>} /> {/* Renamed to /welcome */}
        <Route path="/about" element={<Layout><AboutEgyptPage /></Layout>} />
        <Route path="/cities" element={<Layout><CitiesPage /></Layout>} />
        <Route path="/categories" element={<Layout><CategoriesPage /></Layout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />

        {/* You can have other routes that don't use the layout */}
      </Routes>
    </Router>
  );
}

export default App;