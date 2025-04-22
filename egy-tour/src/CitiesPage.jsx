import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CitiesPage = () => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCitiesData = async () => {
            try {
                const response = await fetch('/data.json');
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
        <div style={{ marginLeft: '20px' }}> 
            <h2 style={{ marginTop: '30px' }}>Discover vibrant cities and plan your next escape</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {cities.map((city) => (
                    <div key={city.name} className="city-card">
                        <Link to={`/city/${city.name}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <h3>{city.name}</h3>
                            <img src={city.image} alt={city.name} />
                            <p>{city.description}</p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CitiesPage;