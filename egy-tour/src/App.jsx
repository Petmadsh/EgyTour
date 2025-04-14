import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import Welcome from './Welcome';
import AboutEgyptPage from './AboutEgyptPage';
import CitiesPage from './CitiesPage';
import CityDetails from './CityDetails';
import PlaceDetails from './PlaceDetails';
import MyTicketsPage from './MyTicketsPage'; // Import the MyTicketsPage component
import ProfilePage from './ProfilePage';
import Layout from './components/Layout';
import 'react-toastify/dist/ReactToastify.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ToastContainer } from 'react-toastify';
import './styles.css'; // Import the global styles


function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
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
        {/* Add the new route for CityDetails */}
        <Route path="/city/:cityName" element={<Layout><CityDetails /></Layout>} />
        {/* Add the new route for PlaceDetails */}
        <Route path="/city/:cityName/place/:placeName" element={<Layout><PlaceDetails /></Layout>} />
        {/* Changed the route for categories to my-tickets */}
        <Route path="/tickets" element={<Layout><MyTicketsPage /></Layout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />

        {/* You can have other routes that don't use the layout */}
      </Routes>
    </Router>
  );
}

export default App;