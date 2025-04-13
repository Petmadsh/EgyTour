import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const CityDetails = () => {
    const { cityName } = useParams();
    const [cityDetails, setCityDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const imageSize = '150px'; // Define a fixed size for images

    useEffect(() => {
        const fetchCityData = async () => {
            try {
                const response = await fetch('/data.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
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
        <div style={{ padding: '20px' }}>
            <h2>{cityDetails.name} Details</h2>

            {/* City Data Section */}
            <div style={{ marginBottom: '30px' }}>
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
                                        style={{
                                            width: imageSize,
                                            height: imageSize,
                                            objectFit: 'cover', // Maintain aspect ratio and cover the container
                                            borderRadius: '8px',
                                        }}
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        {cityDetails.places.map((place) => (
                            <div
                                key={place.name}
                                style={{
                                    border: '1px solid #eee',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    width: 'clamp(200px, 30%, 250px)', // Smaller card width
                                }}
                            >
                                <h4>{place.name}</h4>
                                <p style={{ fontSize: '0.9em', marginBottom: '5px' }}>Category: {place.category}</p>
                                <img
                                    src={place.image}
                                    alt={place.name}
                                    style={{
                                        width: '100%',
                                        height: '150px', // Fixed height for place images
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        marginBottom: '8px',
                                    }}
                                />
                                <p style={{ fontSize: '0.9em' }}>
                                    {place.description.length > 100 ? `${place.description.substring(0, 100)}...` : place.description}
                                </p>
                                {place.details && (
                                    <Link
                                        to={`/city/${cityName}/place/${place.name.replace(/ /g, '-')}`}
                                        style={{ display: 'block', marginTop: '8px', fontSize: '0.85em' }}
                                    >
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

            <Link to="/cities" style={{ display: 'block', marginTop: '20px' }}>
                Back to Cities
            </Link>
        </div>
    );
};

export default CityDetails;