import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import the Link component

const CitiesPage = () => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCitiesData = async () => {
            try {
                const response = await fetch('/data.json'); // Assuming your JSON file is named 'data.json' in the public folder
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCities(data.cities);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchCitiesData();
    }, []);

    if (loading) {
        return <div>Loading cities data...</div>;
    }

    if (error) {
        return <div>Error loading cities data: {error.message}</div>;
    }

    return (
        <div>
            <h1>Cities</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {cities.map((city) => (
                    <div
                        key={city.name}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '15px',
                            width: '250px', // Decreased card width
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 16px 0 rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 8px 0 rgba(0,0,0,0.1)';
                        }}
                    >
                        {/* Wrap the city card content with a Link */}
                        <Link to={`/city/${city.name}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <h3>{city.name}</h3>
                            <img
                                src={city.image}
                                alt={city.name}
                                style={{ width: '100%', height: '180px', borderRadius: '4px', marginBottom: '10px', objectFit: 'cover' }} // Increased height, added object-fit
                            />
                            <p style={{ fontSize: '0.9em' }}>{city.description}</p> {/* Decreased font size */}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CitiesPage;