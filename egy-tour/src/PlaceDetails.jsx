import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoicGV0bWFkc2g5OSIsImEiOiJjbTlnd2ZvMnUyNzE1Mm5zNHFkZzVxcHpzIn0.R08JPy3hFupbWo2pT68YQA'; // replace with yours

const PlaceDetails = () => {
    const { cityName, placeName } = useParams();
    const [placeDetails, setPlaceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);
    const [manualInteraction, setManualInteraction] = useState(false);
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [weatherError, setWeatherError] = useState(null);

    const autoScrollInterval = 3000;
    const autoScrollTimeout = useRef(null);
    const resumeDelay = 2000;
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        const fetchPlaceData = async () => {
            try {
                const response = await fetch('/data.json');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const selectedCity = data.cities.find((city) => city.name === cityName);
                if (selectedCity && selectedCity.places) {
                    const selectedPlace = selectedCity.places.find(
                        (place) => place.name.replace(/ /g, '-') === placeName
                    );
                    if (selectedPlace && selectedPlace.details) {
                        setPlaceDetails(selectedPlace.details);
                    } else {
                        setError(`Details for ${placeName.replace(/-/g, ' ')} not found in ${cityName}.`);
                    }
                } else {
                    setError(`City ${cityName} or places not found.`);
                }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaceData();
    }, [cityName, placeName]);

    useEffect(() => {
        let intervalId;
        if (placeDetails?.images && isAutoScrolling && !manualInteraction && placeDetails.images.length > 1) {
            intervalId = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % placeDetails.images.length);
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

    const getLatLng = (locationString) => {
        if (!locationString) return null;
        const [lat, lng] = locationString.split(',').map(coord => parseFloat(coord.trim()));
        if (isNaN(lat) || isNaN(lng)) return null;
        return [lat, lng];
    };

    useEffect(() => {
        if (placeDetails?.location && mapContainer.current && !map.current) {
            const latLng = getLatLng(placeDetails.location);
            if (latLng) {
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [latLng[1], latLng[0]],
                    zoom: 15
                });

                new mapboxgl.Marker()
                    .setLngLat([latLng[1], latLng[0]])
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(placeName.replace(/-/g, ' ')))
                    .addTo(map.current);

                return () => {
                    if (map.current) {
                        map.current.remove();
                        map.current = null;
                    }
                };
            }
        }
    }, [placeDetails?.location, placeName]);

    useEffect(() => {
        const fetchWeather = async () => {
            if (!placeDetails?.location) return;
            const [lat, lng] = getLatLng(placeDetails.location);
            if (!lat || !lng) return;

            setWeatherLoading(true);
            setWeatherError(null);

            try {
                const response = await fetch(
                    `https://api.weatherapi.com/v1/current.json?key=b5d27ffd2d374fe692e172137242208&q=${lat},${lng}`
                );
                if (!response.ok) throw new Error('Failed to fetch weather data');
                const data = await response.json();
                setWeather(data);
            } catch (err) {
                setWeatherError(err.message);
            } finally {
                setWeatherLoading(false);
            }
        };

        fetchWeather();
    }, [placeDetails?.location]);

    if (loading) return <div>Loading place details...</div>;
    if (error) return <div>Error loading place details: {error.message}</div>;
    if (!placeDetails) return <div>No details found for {placeName.replace(/-/g, ' ')} in {cityName}.</div>;

    return (
        <div style={{ padding: '30px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '30px' }}>
                {placeName.replace(/-/g, ' ')} in {cityName}
            </h2>

            {/* Images Section */}
            {placeDetails.images && placeDetails.images.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '15px' }}>
                        📸 Explore {placeName.replace(/-/g, ' ')} in Pictures
                    </h3>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '1000px',
                        height: '600px',
                        margin: '0 auto',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                    }}>
                        <div
                            style={{
                                display: 'flex',
                                transform: `translateX(-${currentImageIndex * 100}%)`,
                                transition: 'transform 0.6s ease-in-out',
                                height: '100%',
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
                                    }}
                                />
                            ))}
                        </div>

                        {placeDetails.images.length > 1 && (
                            <>
                                <button
                                    onClick={goToPreviousImage}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '15px',
                                        transform: 'translateY(-50%)',
                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        padding: '10px',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                    }}
                                >
                                    <FaChevronLeft />
                                </button>

                                <button
                                    onClick={goToNextImage}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '15px',
                                        transform: 'translateY(-50%)',
                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        padding: '10px',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                    }}
                                >
                                    <FaChevronRight />
                                </button>

                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '15px',
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {placeDetails.images.map((_, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleDotClick(index)}
                                            style={{
                                                width: currentImageIndex === index ? '14px' : '10px',
                                                height: currentImageIndex === index ? '14px' : '10px',
                                                borderRadius: '50%',
                                                backgroundColor: currentImageIndex === index ? '#333' : '#bbb',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Description */}
            {placeDetails.placeDescription && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>Description</h3>
                    <p>{placeDetails.placeDescription}</p>
                </div>
            )}

            {/* Location & Weather */}
            <div style={{
                marginBottom: '40px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '30px',
                justifyContent: 'space-between',
            }}>
                <div style={{ flex: '1 1 48%' }}>
                    <h3>📍 Location</h3>
                    <div ref={mapContainer} style={{
                        height: '300px',
                        width: '100%',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                    }} />
                </div>

                <div style={{ flex: '1 1 48%' }}>
                    <h3>🌤️ Weather</h3>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                        padding: '20px'
                    }}>
                        {weatherLoading && <p>Loading weather...</p>}
                        {weatherError && <p style={{ color: 'red' }}>Error: {weatherError}</p>}
                        {weather && (
                            <div>
                                <p style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                                    {placeName.replace(/-/g, ' ')}, {cityName}
                                </p>
                                <p>{weather.current.condition.text}</p>
                                <img src={weather.current.condition.icon} alt={weather.current.condition.text} />
                                <p>🌡️ Temperature: {weather.current.temp_c}°C</p>
                                <p>🤗 Feels like: {weather.current.feelslike_c}°C</p>
                                <p>💧 Humidity: {weather.current.humidity}%</p>
                                <p>🌬️ Wind: {weather.current.wind_kph} kph</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Other Info */}
            {placeDetails.openingHours && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>🕒 Opening Hours</h3>
                    <p>{placeDetails.openingHours}</p>
                </div>
            )}

            {placeDetails.ticketPrices && (
                <div>
                    <h3>🎟️ Ticket Prices</h3>
                    <p>{placeDetails.ticketPrices}</p>
                </div>
            )}

            <Link to={`/city/${cityName}`} style={{
                display: 'inline-block',
                marginTop: '30px',
                color: '#007BFF',
                textDecoration: 'none'
            }}>
                ← Back to {cityName}
            </Link>
        </div>
    );
};

export default PlaceDetails;
