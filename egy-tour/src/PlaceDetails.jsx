import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Fix marker icon issue in Leaflet with Webpack/Vite
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
    shadowSize: [41, 41],
});


const PlaceDetails = () => {
    const { cityName, placeName } = useParams();
    const [placeDetails, setPlaceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);
    const [manualInteraction, setManualInteraction] = useState(false);
    const imageWidth = '1000px';
    const imageHeight = '600px';
    const autoScrollInterval = 3000;
    const autoScrollTimeout = useRef(null);
    const resumeDelay = 2000;

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

    if (loading) return <div>Loading place details...</div>;
    if (error) return <div>Error loading place details: {error.message}</div>;
    if (!placeDetails) return <div>No details found for {placeName.replace(/-/g, ' ')} in {cityName}.</div>;

    const latLng = getLatLng(placeDetails.location);

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
                    {latLng ? (
                        <MapContainer center={latLng} zoom={15} style={{ height: '300px', width: '100%', borderRadius: '8px' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={latLng} icon={customIcon}>
                                <Popup>{placeName.replace(/-/g, ' ')}</Popup>
                            </Marker>
                        </MapContainer>

                    ) : (
                        <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                            Location data not available
                        </div>
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <h3>Weather</h3>
                    <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                        <p>Weather information will be displayed here.</p>
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
