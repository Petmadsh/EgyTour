import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoicGV0bWFkc2g5OSIsImEiOiJjbTlnd2ZvMnUyNzE1Mm5zNHFkZzVxcHpzIn0.R08JPy3hFupbWo2pT68YQA';

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

    const imageWidth = '1000px';
    const imageHeight = '600px';
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
                    .setPopup(
                        new mapboxgl.Popup({ offset: 25 }).setText(
                            placeName.replace(/-/g, ' ')
                        )
                    )
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
                    <div ref={mapContainer} style={{ height: '300px', width: '100%', borderRadius: '8px' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <h3>Weather</h3>
                    <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                        {weatherLoading && <p>Loading weather...</p>}
                        {weatherError && <p style={{ color: 'red' }}>Error: {weatherError}</p>}
                        {weather && (
                            <div>
                                <p><strong>{weather.location.name}, {weather.location.country}</strong></p>
                                <p>{weather.current.condition.text}</p>
                                <img src={weather.current.condition.icon} alt={weather.current.condition.text} />
                                <p>Temperature: {weather.current.temp_c}°C</p>
                                <p>Feels like: {weather.current.feelslike_c}°C</p>
                                <p>Humidity: {weather.current.humidity}%</p>
                                <p>Wind: {weather.current.wind_kph} kph</p>
                            </div>
                        )}
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
