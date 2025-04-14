import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';

const Welcome = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is logged in. If not, redirect to login.
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (!user) {
                navigate('/login');
            }
        });

        // Clean up the subscription
        return () => unsubscribe();
    }, [navigate]);

    return (
        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px', backgroundColor: '#f7f7f7' }}>
            <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <h1>Welcome to EgyTour!</h1>
                <p>You have successfully logged in.</p>
                {/* Logout functionality is now in the NavigationBar */}
            </div>
        </div>
    );
};

export default Welcome;