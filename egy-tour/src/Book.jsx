import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase'; // Adjust path as needed
import { collection, query, where, getDocs, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import './BookPage.css'; // Create this CSS file

const BookPage = () => {
    const { cityName, placeName } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [visitorType, setVisitorType] = useState('');
    const [visitorCategory, setVisitorCategory] = useState('');
    const [placeDetails, setPlaceDetails] = useState(null); // You might not need this now
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const visitorTypes = ['Adult', 'Child', 'Senior']; // Example options
    const visitorCategories = ['Local', 'Foreigner', 'Student']; // Example options
    const [placeId, setPlaceId] = useState(null); // To store the place ID

    useEffect(() => {
        // You might want to fetch the place ID based on cityName and placeName
        // For now, we'll assume you have a way to get it or pass it down.
        // If you were on a PlaceDetails page, you might have it in the state or URL.
        // For this example, I'll set a placeholder. **You need to replace this**
        const fetchedPlaceId = "WHkrK7PjKQ4ZXM3z82Ur";
        setPlaceId(fetchedPlaceId);
        setLoading(false);
    }, [cityName, placeName]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleVisitorTypeChange = (event) => {
        setVisitorType(event.target.value);
    };

    const handleVisitorCategoryChange = (event) => {
        setVisitorCategory(event.target.value);
    };

    const checkExistingBooking = async () => {
        const user = auth.currentUser;
        if (!user) {
            toast.error('You must be logged in to book a ticket.');
            return true; // Treat as existing to prevent booking
        }

        const formattedDateStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
        const formattedDateEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);

        const q = query(
            collection(db, 'bookings'),
            where('email', '==', user.email),
            where('placeId', '==', placeId),
            where('date', '>=', formattedDateStart),
            where('date', '<=', formattedDateEnd)
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    };

    const confirmBooking = async () => {
        console.log('Confirm booking button clicked'); // Debug log

        // 1. Data Validation
        if (!visitorType || !visitorCategory) {
            console.log('Visitor type or category not selected'); // Debug log
            toast.warn('Please select visitor type and category.');
            return;
        }

        // 2. User Authentication Check
        const user = auth.currentUser;
        if (!user) {
            console.log('User not logged in'); // Debug log
            toast.error('You must be logged in to book a ticket.');
            return;
        }

        // 3. Check if placeId is available
        if (!placeId) {
            console.error('Place ID is not available.');
            toast.error('Could not proceed with booking. Place information missing.');
            return;
        }

        // 4. Check for Existing Booking
        const existingBooking = await checkExistingBooking();
        if (existingBooking) {
            toast.error('You already have a booking for this place on this date.');
            return;
        }

        // 5. Creating Booking Data Object
        const bookingData = {
            date: Timestamp.fromDate(selectedDate), // Stored as Firebase Timestamp
            email: user.email,
            placeId: placeId,
            visitorCategory: visitorCategory,
            visitorType: visitorType,
            timestamp: serverTimestamp(), // Use serverTimestamp for consistency
            userId: user.uid, // Add user ID
            bookingDate: new Date().toLocaleDateString(), // Readable booking date
            placeName: placeName, // Keep placeName if needed for display
            cityName: cityName, // Keep cityName if needed for display
        };

        console.log('Booking data to be added:', bookingData); // Debug log

        // 6. Adding to Firestore with Error Handling
        try {
            console.log('Attempting to add booking to the "bookings" collection...'); // Debug log
            const docRef = await addDoc(collection(db, 'bookings'), bookingData);
            console.log('Booking added with ID:', docRef.id); // Debug log
            toast.success('Booking successful!');
            navigate('/tickets'); // Redirect to My Tickets page after booking
        } catch (error) {
            console.error('Error creating booking:', error);
            toast.error('Failed to create booking.');
        }
    };

    if (loading) {
        return <div>Loading booking options...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="book-page">
            <h2>Book Ticket for {placeName} in {cityName}</h2>
            <div className="booking-form">
                <div className="form-group">
                    <label htmlFor="date">Select Date:</label>
                    <DatePicker
                        id="date"
                        selected={selectedDate}
                        onChange={handleDateChange}
                        minDate={new Date()} // Prevent booking in the past
                        dateFormat="yyyy-MM-dd"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="visitorType">Visitor Type:</label>
                    <select id="visitorType" value={visitorType} onChange={handleVisitorTypeChange}>
                        <option value="">-- Select Type --</option>
                        {visitorTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="visitorCategory">Visitor Category:</label>
                    <select id="visitorCategory" value={visitorCategory} onChange={handleVisitorCategoryChange}>
                        <option value="">-- Select Category --</option>
                        {visitorCategories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <button className="confirm-booking-button" onClick={confirmBooking}>
                    Confirm Booking
                </button>
            </div>
        </div>
    );
};

export default BookPage;