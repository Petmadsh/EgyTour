import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const CityDetails = () => {
    const { cityName } = useParams();
    const [cityDetails, setCityDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCityData = async () => {
            try {
                const response = await fetch('/data.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // Find the details for the specific city
                const selectedCity = data.cities.find((city) => city.name === cityName);

                if (selectedCity) {
                    setCityDetails(selectedCity);
                    setLoading(false);
                } else {
                    setError(`Details for ${cityName} not found.`);
                    setLoading(false);
                }
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchCityData();
    }, [cityName]);

    if (loading) {
        return <div>Loading city details...</div>;
    }

    if (error) {
        return <div>Error loading city details: {error.message}</div>;
    }

    if (!cityDetails) {
        return <div>No details found for {cityName}.</div>;
    }

    return (
        <div>
            <h2>{cityDetails.name} Details</h2>

            {/* City Data Section */}
            <div>
                <h3>About {cityDetails.name}</h3>
                {cityDetails.citydata && (
                    <>
                        <p>{cityDetails.citydata.description}</p>
                        {cityDetails.citydata.images && (
                            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px' }}>
                                {cityDetails.citydata.images.map((imagePath, index) => (
                                    <img
                                        key={index}
                                        src={imagePath}
                                        alt={`${cityDetails.name} ${index}`}
                                        style={{ width: '200px', height: 'auto', borderRadius: '4px' }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Places Section */}
            <div>
                <h3>Places to Visit in {cityDetails.name}</h3>
                {cityDetails.places && cityDetails.places.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {cityDetails.places.map((place) => (
                            <div key={place.name} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', width: '300px' }}>
                                <h4>{place.name}</h4>
                                <p>Category: {place.category}</p>
                                <img
                                    src={place.image}
                                    alt={place.name}
                                    style={{ width: '100%', height: 'auto', borderRadius: '4px', marginBottom: '10px' }}
                                />
                                <p>{place.description}</p>
                                {place.details && (
                                    <Link to={`/city/${cityName}/place/${place.name.replace(/ /g, '-')}`}>
                                        View Details
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No places to visit listed for {cityDetails.name}.</p>
                )}
            </div>

            <Link to="/cities">Back to Cities</Link>
        </div>
    );
};

export default CityDetails;