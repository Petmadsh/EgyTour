import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import arrow icons

const PlaceDetails = () => {
    const { cityName, placeName } = useParams();
    const [placeDetails, setPlaceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);
    const [manualInteraction, setManualInteraction] = useState(false);
    const imageWidth = '1000px'; // Increased width
    const imageHeight = '600px'; // Decreased height
    const autoScrollInterval = 3000; // Time in milliseconds for auto-scroll
    const autoScrollTimeout = useRef(null); // Ref to hold the timeout
    const resumeDelay = 2000; // Reduced delay to 2 seconds

    useEffect(() => {
        const fetchPlaceData = async () => {
            try {
                const response = await fetch('/data.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const selectedCity = data.cities.find((city) => city.name === cityName);
                if (selectedCity && selectedCity.places) {
                    const selectedPlace = selectedCity.places.find(
                        (place) => place.name.replace(/ /g, '-') === placeName
                    );
                    if (selectedPlace && selectedPlace.details) {
                        setPlaceDetails(selectedPlace.details);
                        setLoading(false);
                    } else {
                        setError(`Details for ${placeName.replace(/-/g, ' ')} not found in ${cityName}.`);
                        setLoading(false);
                    }
                } else {
                    setError(`City ${cityName} or places not found.`);
                    setLoading(false);
                }
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchPlaceData();
    }, [cityName, placeName]);

    useEffect(() => {
        let intervalId;
        if (placeDetails?.images && isAutoScrolling && !manualInteraction && placeDetails.images.length > 1) {
            intervalId = setInterval(() => {
                setCurrentImageIndex((prevIndex) =>
                    (prevIndex + 1) % placeDetails.images.length
                );
            }, autoScrollInterval);
        }
        return () => clearInterval(intervalId);
    }, [placeDetails?.images, isAutoScrolling, manualInteraction, autoScrollInterval]);

    const handleManualNavigation = () => {
        setManualInteraction(true);
        clearTimeout(autoScrollTimeout.current);
        autoScrollTimeout.current = setTimeout(() => setManualInteraction(false), resumeDelay);
    };

    const goToPreviousImage = () => {
        handleManualNavigation();
        if (placeDetails?.images) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? placeDetails.images.length - 1 : prevIndex - 1
            );
        }
    };

    const goToNextImage = () => {
        handleManualNavigation();
        if (placeDetails?.images) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % placeDetails.images.length);
        }
    };

    const handleDotClick = (index) => {
        handleManualNavigation();
        setCurrentImageIndex(index);
    };

    if (loading) {
        return <div>Loading place details...</div>;
    }

    if (error) {
        return <div>Error loading place details: {error.message}</div>;
    }

    if (!placeDetails) {
        return <div>No details found for {placeName.replace(/-/g, ' ')} in {cityName}.</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>{placeName.replace(/-/g, ' ')} Details in {cityName}</h2>

            {placeDetails.images && placeDetails.images.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>Images</h3>
                    <div style={{ position: 'relative', width: 'fit-content', margin: '10px auto' }}>
                        <div
                            style={{
                                display: 'flex',
                                overflowX: 'hidden',
                                width: imageWidth,
                                height: imageHeight,
                                borderRadius: '8px',
                            }}
                        >
                            {placeDetails.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`${placeName.replace(/-/g, ' ')} ${index}`}
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
                        {placeDetails.images.length > 1 && (
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
                                    {placeDetails.images.map((_, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: index === currentImageIndex ? '#333' : '#ccc',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleDotClick(index)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {placeDetails.placeDescription && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>Description</h3>
                    <p>{placeDetails.placeDescription}</p>
                </div>
            )}

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, marginRight: '20px' }}>
                    <h3>Location</h3>
                    {/* Placeholder for Google Maps API */}
                    <div style={{ width: '100%', height: '200px', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px' }}>
                        {placeDetails.location ? <p>Location: {placeDetails.location}</p> : <p>Map will be loaded here</p>}
                    </div>
                    {placeDetails.location && <p style={{ marginTop: '5px', fontSize: '0.9em', color: '#555' }}>{placeDetails.location}</p>}
                </div>
                <div style={{ flex: 1 }}>
                    <h3>Weather</h3>
                    <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                        <p>Weather information will be displayed here.</p>
                        {/* You can add more specific placeholders like temperature, conditions, etc. */}
                    </div>
                </div>
            </div>

            {placeDetails.openingHours && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>Opening Hours</h3>
                    <p>{placeDetails.openingHours}</p>
                </div>
            )}

            {placeDetails.ticketPrices && (
                <div>
                    <h3>Ticket Prices</h3>
                    <p>{placeDetails.ticketPrices}</p>
                </div>
            )}

            <Link to={`/city/${cityName}`} style={{ display: 'block', marginTop: '20px' }}>
                Back to {cityName}
            </Link>
        </div>
    );
};

export default PlaceDetails;