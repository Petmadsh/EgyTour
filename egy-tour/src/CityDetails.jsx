import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import arrow icons
import './styles.css'; // Ensure you import the CSS file

const CityDetails = () => {
    const { cityName } = useParams();
    const [cityDetails, setCityDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);
    const [manualInteraction, setManualInteraction] = useState(false);
    const autoScrollInterval = 3000; // Time in milliseconds for auto-scroll
    const autoScrollTimeout = useRef(null); // Ref to hold the timeout
    const resumeDelay = 2000; // Reduced delay to 2 seconds

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
        let intervalId;
        if (cityDetails?.citydata?.images && isAutoScrolling && !manualInteraction && cityDetails.citydata.images.length > 1) {
            intervalId = setInterval(() => {
                setCurrentImageIndex((prevIndex) =>
                    (prevIndex + 1) % cityDetails.citydata.images.length
                );
            }, autoScrollInterval);
        }
        return () => clearInterval(intervalId);
    }, [cityDetails?.citydata?.images, isAutoScrolling, manualInteraction, autoScrollInterval]);

    const handleManualNavigation = () => {
        setManualInteraction(true);
        clearTimeout(autoScrollTimeout.current);
        autoScrollTimeout.current = setTimeout(() => setManualInteraction(false), resumeDelay);
    };

    const goToPreviousImage = () => {
        handleManualNavigation();
        if (cityDetails?.citydata?.images) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? cityDetails.citydata.images.length - 1 : prevIndex - 1
            );
        }
    };

    const goToNextImage = () => {
        handleManualNavigation();
        if (cityDetails?.citydata?.images) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % cityDetails.citydata.images.length);
        }
    };

    const handleDotClick = (index) => {
        handleManualNavigation();
        setCurrentImageIndex(index);
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

    const cityNameForDisplay = cityName.replace(/-/g, ' ');

    return (
        <div style={{ padding: '30px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '30px' }}>
                {cityNameForDisplay}
            </h2>

            {/* Images Section */}
            {cityDetails.citydata?.images && cityDetails.citydata.images.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '15px' }}>
                        📸 Explore {cityNameForDisplay} in Pictures
                    </h3>
                    <div className="carousel-container">
                        <div className="carousel-images" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                            {cityDetails.citydata.images.map((imagePath, index) => (
                                <img
                                    key={index}
                                    src={imagePath}
                                    alt={`${cityNameForDisplay} ${index}`}
                                    className="carousel-image"
                                />
                            ))}
                        </div>

                        {cityDetails.citydata.images.length > 1 && (
                            <>
                                <button
                                    className="carousel-controls carousel-controls-left"
                                    onClick={goToPreviousImage}
                                >
                                    <FaChevronLeft />
                                </button>
                                <button
                                    className="carousel-controls carousel-controls-right"
                                    onClick={goToNextImage}
                                >
                                    <FaChevronRight />
                                </button>
                                <div className="carousel-dots">
                                    {cityDetails.citydata.images.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`carousel-dot ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => handleDotClick(index)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* City Data Section (Description) */}
            {cityDetails.citydata?.description && (
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>About {cityNameForDisplay}</h3>
                    <p>{cityDetails.citydata.description}</p>
                </div>
            )}

            {/* Places Section */}
            <div>
                <h3>Places to Visit in {cityNameForDisplay}</h3>
                {cityDetails.places && cityDetails.places.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {cityDetails.places.map((place) => (
                            <div
                                key={place.name}
                                style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    width: '250px',
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
                                <Link
                                    to={`/city/${cityName}/place/${place.name.replace(/ /g, '-')}`}
                                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                                >
                                    <h4>{place.name}</h4>
                                    <img
                                        src={place.image}
                                        alt={place.name}
                                        style={{
                                            width: '100%',
                                            height: '180px',
                                            objectFit: 'cover',
                                            borderRadius: '4px',
                                            marginBottom: '10px',
                                        }}
                                    />
                                    <p style={{ fontSize: '0.9em' }}>
                                        {place.description.length > 100 ? `${place.description.substring(0, 100)}...` : place.description}
                                    </p>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No places to visit listed for {cityNameForDisplay}.</p>
                )}
            </div>

            <Link to="/cities" style={{ display: 'block', marginTop: '20px' }}>
                Back to Cities
            </Link>
        </div>
    );
};

export default CityDetails;