import React from 'react';
import { useParams } from 'react-router-dom';

const BookPage = () => {
    const { cityName, placeName } = useParams();

    return (
        <div>
            <h2>Book a Ticket</h2>
            <p>You are trying to book a ticket for: {placeName} in {cityName}</p>
            {/* Add your booking form or logic here */}
        </div>
    );
};

export default BookPage;