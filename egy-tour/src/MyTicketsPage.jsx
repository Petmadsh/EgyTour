import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import QRCodeGenerator from 'qrcode';
import styles from './MyTicketsPage.module.css';
import modalStyles from './ModalStyles.module.css'; // Import modal styles
import Modal from 'react-modal';

Modal.setAppElement('#root');

const MyTicketsPage = () => {
    const [userTickets, setUserTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrCodes, setQrCodes] = useState({});
    const [isDeleting, setIsDeleting] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const getGridColumns = () => {
        if (screenWidth >= 1200) {
            return 'repeat(3, 1fr)';
        } else if (screenWidth >= 768) {
            return 'repeat(2, 1fr)';
        } else {
            return 'repeat(1, 1fr)';
        }
    };

    const fetchUserTickets = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!auth.currentUser) {
                setUserTickets([]);
                setQrCodes({});
                setLoading(false);
                return;
            }
            const userId = auth.currentUser.uid;
            const q = query(
                collection(db, 'bookings'),
                where('userId', '==', userId),
                orderBy('bookingDate', 'asc')
            );
            const querySnapshot = await getDocs(q);
            const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserTickets(tickets);

            const qrCodePromises = tickets.map(ticket => {
                return new Promise((resolve, reject) => {
                    QRCodeGenerator.toDataURL(JSON.stringify(ticket), (err, url) => {
                        if (err) {
                            console.error("QR Code Error:", err);
                            reject(err);
                        } else {
                            resolve({ ticketId: ticket.id, qrCodeURL: url });
                        }
                    });
                });
            });

            try {
                const results = await Promise.all(qrCodePromises);
                const qrCodeMap = {};
                results.forEach(result => {
                    qrCodeMap[result.ticketId] = result.qrCodeURL;
                });
                setQrCodes(qrCodeMap);
            } catch (qrCodeError) {
                setError("Failed to generate QR codes.");
                setQrCodes({});
                console.error("QR Code Generation Error:", qrCodeError);
            }

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setUserTickets([]);
            setQrCodes({});
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth.currentUser) {
            fetchUserTickets();
        } else {
            setUserTickets([]);
            setQrCodes({});
            setLoading(false);
        }

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUserTickets();
            } else {
                setUserTickets([]);
                setQrCodes({});
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const initiateDelete = (ticketId) => {
        setTicketToDelete(ticketId);
        setShowConfirmationModal(true);
    };

    const closeConfirmationModal = () => {
        setShowConfirmationModal(false);
        setTicketToDelete(null);
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const confirmDeleteTicket = async () => {
        if (!ticketToDelete || isDeleting) return;
        setIsDeleting(true);
        setShowConfirmationModal(false);
        try {
            await deleteDoc(doc(db, 'bookings', ticketToDelete));
            setUserTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketToDelete));
            setQrCodes(prevQrCodes => {
                const newQrCodes = { ...prevQrCodes };
                delete newQrCodes[ticketToDelete];
                return newQrCodes;
            });
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error deleting ticket:", error);
            alert('Failed to delete ticket. Please try again.');
        } finally {
            setIsDeleting(false);
            setTicketToDelete(null);
        }
    };

    if (loading) return (
        <div className={styles.loadingContainer}>
            <p className={styles.loadingText}>Loading your tickets...</p>
        </div>
    );
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.myTicketsContainer}>
            <h1>My Tickets</h1>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmationModal}
                onRequestClose={closeConfirmationModal}
                className={modalStyles.modalContent}
                overlayClassName={modalStyles.modalOverlay}
                contentLabel="Confirm Delete Ticket"
            >
                <h2 className={`${modalStyles.modalTitle} ${modalStyles.modalTitle}`}>Confirm Delete</h2>
                <p className={modalStyles.modalMessage}>Are you sure you want to delete this ticket?</p>
                <div className={modalStyles.modalButtons}>
                    <button onClick={confirmDeleteTicket} disabled={isDeleting} className={modalStyles.cancelButton}>
                        Yes, Delete
                    </button>
                    <button onClick={closeConfirmationModal} className={modalStyles.confirmButton}>
                        Cancel
                    </button>
                </div>
            </Modal>

            {/* Success Modal */}
            <Modal
                isOpen={showSuccessModal}
                onRequestClose={closeSuccessModal}
                className={modalStyles.modalContent}
                overlayClassName={modalStyles.modalOverlay}
                contentLabel="Ticket Deleted Successfully"
            >
                <h2 className={`${modalStyles.modalTitle} ${modalStyles.successTitle}`}>Success!</h2>
                <p className={modalStyles.modalMessage}>The ticket has been deleted successfully.</p>
                <button onClick={closeSuccessModal} className={`${modalStyles.confirmButton} ${modalStyles.successButton}`}>
                    Okay
                </button>
            </Modal>

            {userTickets.length === 0 ? (
                <p style={{ fontSize: '1.3rem' }}>You don't have any tickets yet</p>
            ) : (
                <div className={styles.ticketsList} style={{ gridTemplateColumns: getGridColumns() }}>
                    {userTickets.map((ticket) => (
                        <div key={ticket.id} className={styles.ticketCard}>
                            <div className={styles.ticketDetails}>
                                <p className={`${styles.detailItem} ${styles.placeName}`}>{ticket.placeName}</p>
                                <p className={styles.detailItem}>{ticket.bookingDate}</p>
                                {qrCodes[ticket.id] && (
                                    <img src={qrCodes[ticket.id]} alt={`QR Code for ${ticket.placeName}`} className={styles.qrCodeImage} />
                                )}
                            </div>
                            <button
                                onClick={() => initiateDelete(ticket.id)}
                                className={styles.deleteButton}
                                disabled={isDeleting}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTicketsPage;