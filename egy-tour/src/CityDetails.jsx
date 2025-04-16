import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './styles.css'; // Import your CSS file

const CityDetails = () => {
    const { cityName } = useParams();
    const [cityDetails, setCityDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);
    const [manualInteraction, setManualInteraction] = useState(false);
    const autoScrollInterval = 3000;
    const autoScrollTimeout = useRef(null);
    const resumeDelay = 2000;

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
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % cityDetails.citydata.images.length);
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

    return (
        <div style={{ padding: '20px' }}> {/* Keep basic page padding if needed */}
            <h2>{cityDetails.name} Details</h2>

            {/* City Data Section with Image Carousel */}
            <div style={{ marginBottom: '30px' }}> {/* Keep for spacing */}
                <h3>Discover {cityDetails.name}</h3>
                {cityDetails.citydata && (
                    <>
                        <p>{cityDetails.citydata.description}</p>
                        {cityDetails.citydata.images && (
                            <div className="carousel-container">
                                <div
                                    className="carousel-images"
                                    style={{
                                        transform: `translateX(-${currentImageIndex * 100}%)`,
                                    }}
                                >
                                    {cityDetails.citydata.images.map((imagePath, index) => (
                                        <img
                                            key={index}
                                            src={imagePath}
                                            alt={`${cityDetails.name} ${index}`}
                                        />
                                    ))}
                                </div>
                                <button className="carousel-controls carousel-controls-left" onClick={goToPreviousImage}>
                                    <FaChevronLeft />
                                </button>
                                <button className="carousel-controls carousel-controls-right" onClick={goToNextImage}>
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
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Places Section */}
            <div>
                <h3>Must-See Spots in {cityDetails.name}</h3>
                {cityDetails.places && cityDetails.places.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}> {/* Basic flex layout */}
                        {cityDetails.places.map((place) => (
                            <div
                                key={place.name}
                                className="city-card"
                            >
                                <Link
                                    to={`/city/${cityName}/place/${place.name.replace(/ /g, '-')}`}
                                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                                >
                                    <h4>{place.name}</h4>
                                    <img
                                        src={place.image}
                                        alt={place.name}
                                    />
                                    <p>{place.description}</p>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No amazing spots listed for {cityDetails.name} yet!</p>
                )}
            </div>

            <Link to="/cities" style={{ display: 'block', marginTop: '20px' }}>
                ← Explore Other Cities
            </Link>
        </div>
    );
};

export default CityDetails;