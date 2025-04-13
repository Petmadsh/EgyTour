import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import arrow icons

const CityDetails = () => {
    const { cityName } = useParams();
    const [cityDetails, setCityDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);
    const imageSize = '300px'; // Increased size for better visibility

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

    useEffect(() => {
        if (cityDetails?.citydata?.images && isAutoScrolling) {
            const intervalId = setInterval(() => {
                setCurrentImageIndex((prevIndex) =>
                    (prevIndex + 1) % cityDetails.citydata.images.length
                );
            }, 3000); // Change image every 3 seconds
            return () => clearInterval(intervalId); // Cleanup on unmount
        }
    }, [cityDetails?.citydata?.images, isAutoScrolling]);

    const goToPreviousImage = () => {
        setIsAutoScrolling(false); // Stop auto-scrolling on manual interaction
        if (cityDetails?.citydata?.images) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? cityDetails.citydata.images.length - 1 : prevIndex - 1
            );
        }
    };

    const goToNextImage = () => {
        setIsAutoScrolling(false); // Stop auto-scrolling on manual interaction
        if (cityDetails?.citydata?.images) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % cityDetails.citydata.images.length);
        }
    };

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

            {/* City Data Section with Image Carousel */}
            <div style={{ marginBottom: '30px' }}>
                <h3>About {cityDetails.name}</h3>
                {cityDetails.citydata && (
                    <>
                        <p>{cityDetails.citydata.description}</p>
                        {cityDetails.citydata.images && (
                            <div style={{ position: 'relative' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        overflowX: 'hidden',
                                        width: imageSize,
                                        height: imageSize,
                                        borderRadius: '8px',
                                        margin: '10px auto',
                                    }}
                                >
                                    {cityDetails.citydata.images.map((imagePath, index) => (
                                        <img
                                            key={index}
                                            src={imagePath}
                                            alt={`${cityDetails.name} ${index}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                flexShrink: 0,
                                                transform: `translateX(-${currentImageIndex * 100}%)`,
                                                transition: 'transform 0.5s ease-in-out',
                                            }}
                                        />
                                    ))}
                                </div>
                                {cityDetails.citydata.images.length > 1 && (
                                    <>
                                        <button
                                            style={{
                                                position: 'absolute',
                                                left: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '1.5em',
                                                cursor: 'pointer',
                                                opacity: 0.7,
                                            }}
                                            onClick={goToPreviousImage}
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '1.5em',
                                                cursor: 'pointer',
                                                opacity: 0.7,
                                            }}
                                            onClick={goToNextImage}
                                        >
                                            <FaChevronRight />
                                        </button>
                                        <div
                                            style={{
                                                position: 'absolute',
                                                bottom: '10px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                display: 'flex',
                                                gap: '5px',
                                            }}
                                        >
                                            {cityDetails.citydata.images.map((_, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        backgroundColor: index === currentImageIndex ? '#333' : '#ccc',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => {
                                                        setIsAutoScrolling(false);
                                                        setCurrentImageIndex(index);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
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
                                    width: 'clamp(200px, 30%, 250px)',
                                }}
                            >
                                <h4>{place.name}</h4>
                                <p style={{ fontSize: '0.9em', marginBottom: '5px' }}>Category: {place.category}</p>
                                <img
                                    src={place.image}
                                    alt={place.name}
                                    style={{
                                        width: '100%',
                                        height: '150px',
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