import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './styles.css'; // Import global styles

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

    const displayedPlaceName = placeName.replace(/-/g, ' ');

    return (
        <div style={{ padding: '30px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '30px' }}>
                {displayedPlaceName} in {cityName}
            </h2>

            {/* Images Section */}
            {placeDetails.images && placeDetails.images.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '15px' }}>
                        📸 Explore {displayedPlaceName} in Pictures
                    </h3>
                    <div className="carousel-container">
                        <div
                            className="carousel-images"
                            style={{
                                transform: `translateX(-${currentImageIndex * 100}%)`,
                            }}
                        >
                            {placeDetails.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`${displayedPlaceName} ${index}`}
                                />
                            ))}
                        </div>

                        {placeDetails.images.length > 1 && (
                            <>
                                <button
                                    onClick={goToPreviousImage}
                                    className="carousel-controls carousel-controls-left"
                                >
                                    <FaChevronLeft />
                                </button>

                                <button
                                    onClick={goToNextImage}
                                    className="carousel-controls carousel-controls-right"
                                >
                                    <FaChevronRight />
                                </button>

                                <div className="carousel-dots">
                                    {placeDetails.images.map((_, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleDotClick(index)}
                                            className={`carousel-dot ${currentImageIndex === index ? 'active' : ''}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* About Section */}
            {placeDetails.placeDescription && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>About {displayedPlaceName}</h3>
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
                        height: '390px',
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
                                    {displayedPlaceName}, {cityName}
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

            {/* Google Maps Directions Link */}
            <div style={{ marginBottom: '20px' }}>
                <h3>➥ Directions</h3>
                {placeDetails.location && (
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeDetails.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-google-maps"
                    >
                        Open in Google Maps
                    </a>
                )}
                {!placeDetails.location && <p>Location details not available.</p>}
            </div>

            {placeDetails.openingHours && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>🕒 Opening Hours</h3>
                    <p>{placeDetails.openingHours}</p>
                </div>
            )}

            {placeDetails.ticketPrices && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>🎟️ Ticket Prices</h3>
                    <p>{placeDetails.ticketPrices}</p>
                </div>
            )}

            {/* Review Section - Integrated here */}
            <div className="reviews-section" style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <h2>Visitors Reviews</h2>

                <div className="previous-reviews">
                    <div className="review-card">
                        <div className="reviewer-info">
                            <div className="reviewer-name">John Doe</div>
                            <div className="review-date">March 10, 2025</div>
                        </div>
                        <div className="review-rating">
                            <span className="star">★</span>
                            <span className="star">★</span>
                            <span className="star">★</span>
                            <span className="star">★</span>
                            <span className="star-empty">☆</span>
                            <span className="rating-value">4.0</span>
                        </div>
                        <div className="review-text">
                            Excellent stay! The room was clean and comfortable, and the staff were very friendly. I would definitely recommend this place.
                        </div>
                    </div>

                    <div className="review-card">
                        <div className="reviewer-info">
                            <div className="reviewer-name">Jane Smith</div>
                            <div className="review-date">February 25, 2025</div>
                        </div>
                        <div className="review-rating">
                            <span className="star">★</span>
                            <span className="star">★</span>
                            <span className="star">★</span>
                            <span className="star">☆</span>
                            <span className="star">☆</span>
                            <span className="rating-value">3.0</span>
                        </div>
                        <div className="review-text">
                            The location was great, but the breakfast could have been better. Overall, a decent experience.
                        </div>
                    </div>

                    <div className="load-more-reviews">
                        <button>Show More Reviews</button>
                    </div>
                </div>

                <div className="leave-review-section">
                    <h3>Leave Your Review</h3>
                    <form id="review-form">
                        <div className="form-group">
                            <label htmlFor="rating">Rating:</label>
                            <div className="star-rating-input">
                                <span className="star-input" data-rating="1">☆</span>
                                <span className="star-input" data-rating="2">☆</span>
                                <span className="star-input" data-rating="3">☆</span>
                                <span className="star-input" data-rating="4">☆</span>
                                <span className="star-input" data-rating="5">☆</span>
                                <input type="hidden" id="rating" name="rating" value="0" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="comment">Your Review:</label>
                            <textarea id="comment" name="comment" rows="5" placeholder="Write your review here..."></textarea>
                        </div>
                        <button type="submit">Submit Review</button>
                    </form>
                </div>
            </div>

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