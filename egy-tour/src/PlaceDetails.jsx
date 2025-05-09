import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './styles.css';
import { db, auth } from './firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from 'react-modal';
import modalStyles from './ModalStyles.module.css';

// Initialize modal
Modal.setAppElement('#root');

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const PlaceDetails = () => {
    const { cityName, placeName } = useParams();
    const navigate = useNavigate();
    const [placeDetails, setPlaceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);
    const [manualInteraction, setManualInteraction] = useState(false);
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [weatherError, setWeatherError] = useState(null);

    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState('Anonymous');
    const [userReview, setUserReview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');

    const [isBooking, setIsBooking] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [visitorType, setVisitorType] = useState('adult');

    // Modal states
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: '',
        message: '',
        onConfirm: null
    });

    const placeId = placeName;
    const autoScrollInterval = 3000;
    const autoScrollTimeout = useRef(null);
    const resumeDelay = 2000;
    const mapContainer = useRef(null);
    const map = useRef(null);

    // Helper function to show modals
    const showModal = (type, title, message, onConfirm = null) => {
        setModalContent({ title, message, onConfirm });
        switch (type) {
            case 'error':
                setShowErrorModal(true);
                break;
            case 'success':
                setShowSuccessModal(true);
                break;
            case 'warning':
                setShowWarningModal(true);
                break;
            case 'confirmation':
                setShowConfirmationModal(true);
                break;
            default:
                break;
        }
    };

    const closeModal = (type) => {
        switch (type) {
            case 'error':
                setShowErrorModal(false);
                break;
            case 'success':
                setShowSuccessModal(false);
                break;
            case 'warning':
                setShowWarningModal(false);
                break;
            case 'confirmation':
                setShowConfirmationModal(false);
                break;
            default:
                break;
        }
    };

 

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                setUser(authUser);
                // Fetch user data from Firestore to get the name
                const userDocRef = doc(db, 'users', authUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setUserName(`${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Anonymous');
                } else {
                    setUserName(authUser.displayName || 'Anonymous'); // Fallback
                }
                // Check if the user has an existing review
                fetchUserReview(authUser.uid);
            } else {
                setUser(null);
                setUserName('Anonymous');
                setUserReview(null);
                setIsEditing(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const q = query(collection(db, 'reviews'), where('placeId', '==', placeId));
                const querySnapshot = await getDocs(q);
                const fetchedReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReviews(fetchedReviews.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
            } catch (err) {
                console.error('Error fetching reviews:', err);
            }
        };
        fetchReviews();
    }, [placeId]);

    const fetchUserReview = async (userId) => {
        if (!userId) return;
        try {
            const q = query(
                collection(db, 'reviews'),
                where('placeId', '==', placeId),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const existingReview = querySnapshot.docs[0].data();
                setUserReview({ id: querySnapshot.docs[0].id, ...existingReview });
                setEditRating(existingReview.rating);
                setEditComment(existingReview.comment);
            } else {
                setUserReview(null);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error fetching user review:', error);
        }
    };

    const handleRatingChange = (rating) => setNewRating(rating);
    const handleCommentChange = (e) => setNewComment(e.target.value);
    const handleEditRatingChange = (rating) => setEditRating(rating);
    const handleEditCommentChange = (e) => setEditComment(e.target.value);
    const handleVisitorTypeChange = (e) => setVisitorType(e.target.value);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            showModal('error', 'Authentication Required', 'You must be logged in to leave a review.');
            return;
        }
        if (newRating === 0 || newComment.trim() === '') {
            showModal('warning', 'Incomplete Review', 'Please provide a rating and a comment.');
            return;
        }

        const newReview = {
            name: userName,
            rating: newRating,
            comment: newComment,
            placeId: placeId,
            userId: user.uid,
            timestamp: serverTimestamp(),
            date: new Date().toLocaleDateString(),
        };

        try {
            const docRef = await addDoc(collection(db, 'reviews'), newReview);
            setReviews(prev => [{ ...newReview, id: docRef.id }, ...prev]);
            setUserReview({ id: docRef.id, ...newReview });
            setNewRating(0);
            setNewComment('');
            showModal('success', 'Success', 'Review submitted successfully!');
        } catch (err) {
            console.error('Error adding review:', err);
            showModal('error', 'Error', 'Failed to submit review.');
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditRating(userReview.rating);
        setEditComment(userReview.comment);
    };

    const handleSaveEdit = async () => {
        if (!userReview?.id) return;
        if (editRating === 0 || editComment.trim() === '') {
            showModal('warning', 'Incomplete Review', 'Please provide a rating and a comment.');
            return;
        }
        try {
            const reviewDocRef = doc(db, 'reviews', userReview.id);
            await updateDoc(reviewDocRef, {
                rating: editRating,
                comment: editComment,
                timestamp: serverTimestamp(),
                date: new Date().toLocaleDateString(),
            });
            setUserReview({ ...userReview, rating: editRating, comment: editComment, date: new Date().toLocaleDateString() });
            setReviews(prevReviews =>
                prevReviews.map(review =>
                    review.id === userReview.id ? { ...review, rating: editRating, comment: editComment, date: new Date().toLocaleDateString() } : review
                ).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
            );
            setIsEditing(false);
            showModal('success', 'Success', 'Review updated successfully!');
        } catch (error) {
            console.error('Error updating review:', error);
            showModal('error', 'Error', 'Failed to update review.');
        }
    };

    const handleRemoveReview = async () => {
        if (!userReview?.id) return;
        showModal('confirmation',
            'Confirm Removal',
            'Are you sure you want to remove your review?',
            async () => {
                try {
                    const reviewDocRef = doc(db, 'reviews', userReview.id);
                    await deleteDoc(reviewDocRef);
                    setReviews(prevReviews => prevReviews.filter(review => review.id !== userReview.id));
                    setUserReview(null);
                    setIsEditing(false);
                    showModal('success', 'Success', 'Review removed successfully!');
                } catch (error) {
                    console.error('Error removing review:', error);
                    showModal('error', 'Error', 'Failed to remove review.');
                }
            }
        );
    };

    const handleBookingSubmit = async () => {
        if (!user) {
            showModal('error', 'Authentication Required', 'You must be logged in to book a ticket.');
            return;
        }
        if (!bookingDate) {
            showModal('warning', 'Missing Information', 'Please select a booking date.');
            return;
        }
        if (!visitorType) {
            showModal('warning', 'Missing Information', 'Please select a visitor type.');
            return;
        }

        const q = query(
            collection(db, 'bookings'),
            where('userId', '==', user.uid),
            where('placeName', '==', displayedPlaceName),
            where('bookingDate', '==', bookingDate)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            showModal('error', 'Booking Exists', 'You already have a booking for this place on this date.');
            return;
        }

        const newBooking = {
            userId: user.uid,
            userName: userName,
            placeName: displayedPlaceName,
            bookingDate: bookingDate,
            visitorType: visitorType,
        };

        try {
            await addDoc(collection(db, 'bookings'), newBooking);
            showModal('success',
                'Booking Successful',
                'Booking successful! You will be redirected to your tickets page.',
                () => {
                    setIsBooking(false);
                    setBookingDate('');
                    setVisitorType('adult');
                    navigate('/tickets');
                }
            );
        } catch (error) {
            console.error('Error adding booking:', error);
            showModal('error', 'Error', 'Failed to book ticket.');
        }
    };
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
                    `https://api.weatherapi.com/v1/current.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${lat},${lng}`
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
            {/* Error Modal */}
            <Modal
                isOpen={showErrorModal}
                onRequestClose={() => closeModal('error')}
                className={modalStyles.modalContent}
                overlayClassName={modalStyles.modalOverlay}
                contentLabel="Error Modal"
            >
                <h2 className={`${modalStyles.modalTitle} ${modalStyles.errorTitle}`}>{modalContent.title}</h2>
                <p className={modalStyles.modalMessage}>{modalContent.message}</p>
                <button
                    onClick={() => closeModal('error')}
                    className={`${modalStyles.modalButton} ${modalStyles.errorButton}`}
                >
                    OK
                </button>
            </Modal>

            {/* Success Modal */}
            <Modal
                isOpen={showSuccessModal}
                onRequestClose={() => closeModal('success')}
                className={modalStyles.modalContent}
                overlayClassName={modalStyles.modalOverlay}
                contentLabel="Success Modal"
            >
                <h2 className={`${modalStyles.modalTitle} ${modalStyles.successTitle}`}>{modalContent.title}</h2>
                <p className={modalStyles.modalMessage}>{modalContent.message}</p>
                <button
                    onClick={() => {
                        closeModal('success');
                        modalContent.onConfirm && modalContent.onConfirm();
                    }}
                    className={`${modalStyles.modalButton} ${modalStyles.successButton}`}
                >
                    OK
                </button>
            </Modal>

            {/* Warning Modal */}
            <Modal
                isOpen={showWarningModal}
                onRequestClose={() => closeModal('warning')}
                className={modalStyles.modalContent}
                overlayClassName={modalStyles.modalOverlay}
                contentLabel="Warning Modal"
            >
                <h2 className={`${modalStyles.modalTitle} ${modalStyles.warningTitle}`}>{modalContent.title}</h2>
                <p className={modalStyles.modalMessage}>{modalContent.message}</p>
                <button
                    onClick={() => closeModal('warning')}
                    className={`${modalStyles.modalButton} ${modalStyles.warningButton}`}
                >
                    OK
                </button>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmationModal}
                onRequestClose={() => closeModal('confirmation')}
                className={modalStyles.modalContent}
                overlayClassName={modalStyles.modalOverlay}
                contentLabel="Confirmation Modal"
            >
                <h2 className={modalStyles.modalTitle}>{modalContent.title}</h2>
                <p className={modalStyles.modalMessage}>{modalContent.message}</p>
                <div className={modalStyles.modalButtons}>
                    <button
                        onClick={() => {
                            modalContent.onConfirm && modalContent.onConfirm();
                            closeModal('confirmation');
                        }}
                        className={`${modalStyles.modalButton} ${modalStyles.cancelButton}`}
                    >
                        Confirm
                    </button>
                    <button
                        onClick={() => closeModal('confirmation')}
                        className={`${modalStyles.modalButton} ${modalStyles.confirmButton}`}
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
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
                        height: '400px',
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
                        href={`http://google.com/maps?q=${encodeURIComponent(placeDetails.location)}`}
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

            {/* Review Section */}
            <div className="reviews-section" style={{ marginTop: '40px' }}>
                <h2 className="review-section-title">Visitors Reviews</h2>

                <div className="previous-reviews">
                    {reviews.filter(review => review.userId !== user?.uid).length === 0 && !userReview && <p className="no-reviews-message">No other reviews yet.</p>}
                    {reviews.filter(review => review.userId !== user?.uid).map((review) => (
                        <div className="review-card" key={review.id}>
                            <div className="reviewer-info">
                                <div className="reviewer-name">{review.name}</div>
                                <div className="review-date">{review.date}</div>
                            </div>
                            <div className="review-rating">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < review.rating ? 'star' : 'star-empty'}>
                                        {i < review.rating ? '★' : '☆'}
                                    </span>
                                ))}
                                <span className="rating-value">{review.rating?.toFixed(1)}</span>
                            </div>
                            <div className="review-text">{review.comment}</div>
                        </div>
                    ))}
                </div>

                <div className="leave-review-section">
                    <h3 className="review-form-title">Your Review</h3>
                    {!user ? (
                        <p className="login-message">You must be <Link to="/login">logged in</Link> to leave a review.</p>
                    ) : userReview ? (
                        <div className="user-review-card">
                            <div className="review-rating">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < userReview.rating ? 'star' : 'star-empty'}>
                                        {i < userReview.rating ? '★' : '☆'}
                                    </span>
                                ))}
                                <span className="rating-value">{userReview.rating?.toFixed(1)}</span>
                            </div>
                            <div className="review-text">{userReview.comment}</div>
                            <div className="review-actions">
                                {!isEditing ? (
                                    <>
                                        <button type="button" onClick={handleEditClick} className="edit-button">
                                            <FaEdit /> Edit
                                        </button>
                                        <button type="button" onClick={handleRemoveReview} className="remove-button">
                                            <FaTrash /> Remove
                                        </button>
                                    </>
                                ) : (
                                    <div className="edit-form">
                                        <div className="form-group">
                                            <label htmlFor="edit-rating">Rating:</label>
                                            <div className="star-rating-input">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span
                                                        key={star}
                                                        className={`star-input ${editRating >= star ? 'filled' : ''}`}
                                                        onClick={() => handleEditRatingChange(star)}
                                                    >
                                                        {editRating >= star ? '★' : '☆'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="edit-comment">Your Review:</label>
                                            <textarea
                                                id="edit-comment"
                                                rows="5"
                                                value={editComment}
                                                onChange={handleEditCommentChange}
                                                className="styled-textarea" 
                                            />
                                        </div>
                                        <div className="edit-buttons">
                                            <button type="button" onClick={handleSaveEdit}>Save</button>
                                            <button type="button" onClick={handleCancelEdit}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleReviewSubmit} className="review-form">
                            <div className="form-group">
                                <label htmlFor="rating">Rating:</label>
                                <div className="star-rating-input">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span
                                            key={star}
                                            className={`star-input ${newRating >= star ? 'filled' : ''}`}
                                            onClick={() => handleRatingChange(star)}
                                        >
                                            {newRating >= star ? '★' : '☆'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="comment">Your Review:</label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    rows="5"
                                    placeholder="Write your review here..."
                                    value={newComment}
                                    onChange={handleCommentChange}
                                    className="styled-textarea" 

                                />
                            </div>
                            <button type="submit">Submit Review</button>
                        </form>
                    )}
                </div>
            </div>

            {/* Booking Section */}
            <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                <h3 className="booking-title">🎟️ Want to book a ticket?</h3>
                {!user ? (
                    <p className="login-message">You must be <Link to="/login">logged in</Link> to book a ticket.</p>
                ) : (
                    <>
                        {!isBooking ? (
                            <button onClick={() => setIsBooking(true)} className="button-book-ticket">
                                Book Now
                            </button>
                        ) : (
                            <div className="booking-form">
                                
                                        <div className="booking-date-wrapper">
                                            <label htmlFor="bookingDate" className="booking-label">Date:</label>

                                            <div className="datepicker-with-icon">
                                                <DatePicker
                                                    id="bookingDate"
                                                    selected={bookingDate ? new Date(bookingDate) : null}
                                                    onChange={(date) => setBookingDate(date ? date.toISOString().split('T')[0] : '')}
                                                    dateFormat="yyyy-MM-dd"
                                                    placeholderText="Please select a date"
                                                    minDate={new Date()}
                                                    className="booking-input no-caret"
                                                    onKeyDown={(e) => e.preventDefault()}
                                                />
                                                <span className="calendar-icon">📅</span> {/* You can replace with a better icon later */}
                                            </div>
                                        </div>

                                <div className="form-group">
                                    <label className="booking-label">Visitor Type:</label>
                                    <div className="radio-group">
                                        <input
                                            type="radio"
                                            id="adult"
                                            name="visitorType"
                                            value="adult"
                                            checked={visitorType === 'adult'}
                                            onChange={handleVisitorTypeChange}
                                            className="radio-input"
                                        />
                                        <label htmlFor="adult" className="radio-label">Adult</label>
                                    </div>
                                    <div className="radio-group">
                                        <input
                                            type="radio"
                                            id="student"
                                            name="visitorType"
                                            value="student"
                                            checked={visitorType === 'student'}
                                            onChange={handleVisitorTypeChange}
                                            className="radio-input"
                                        />
                                        <label htmlFor="student" className="radio-label">Student</label>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={handleBookingSubmit} className="submit-button booking-button">
                                        Confirm Booking
                                    </button>
                                    <button type="button" onClick={() => setIsBooking(false)} className="cancel-button booking-button">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Link to={`/city/${cityName}`} >
                ← Back to {cityName}
            </Link>
        </div>
    );
};

export default PlaceDetails;

