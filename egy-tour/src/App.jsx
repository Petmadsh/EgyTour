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
import MyTicketsPage from './MyTicketsPage'; 
import ProfilePage from './ProfilePage';

import Layout from './components/Layout';
import 'react-toastify/dist/ReactToastify.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ToastContainer } from 'react-toastify';
import './styles.css'; 


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
    
        <Route path="/" element={<LoginPage />} />

     
        <Route path="/login" element={<Navigate to="/" />} /> 
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        


        <Route path="/welcome" element={<Layout><Welcome /></Layout>} /> 
        <Route path="/about" element={<Layout><AboutEgyptPage /></Layout>} />
        <Route path="/cities" element={<Layout><CitiesPage /></Layout>} />
        <Route path="/city/:cityName" element={<Layout><CityDetails /></Layout>} />
        <Route path="/city/:cityName/place/:placeName" element={<Layout><PlaceDetails /></Layout>} />
        <Route path="/tickets" element={<Layout><MyTicketsPage /></Layout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />

       
      </Routes>
    </Router>
  );
}

export default App;