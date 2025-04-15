import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import QRCodeGenerator from 'qrcode';
import styles from './MyTicketsPage.module.css'; // Create a CSS module for this page
import { toast } from 'react-toastify';

const MyTicketsPage = () => {
    const [userTickets, setUserTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrCodes, setQrCodes] = useState({});
    const [isDeleting, setIsDeleting] = useState(false);
    const activeToastId = useRef(null);

    const DeleteConfirmation = ({ ticketId, closeToast }) => {
        const confirmationRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (confirmationRef.current && !confirmationRef.current.contains(event.target)) {
                    closeToast();
                }
            };

            document.addEventListener('mousedown', handleClickOutside);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [closeToast]);

        const confirmDelete = async () => {
            closeToast();
            if (isDeleting) return;
            setIsDeleting(true);
            try {
                await deleteDoc(doc(db, 'bookings', ticketId));
                setUserTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketId));
                setQrCodes(prevQrCodes => {
                    const newQrCodes = { ...prevQrCodes };
                    delete newQrCodes[ticketId];
                    return newQrCodes;
                });
                toast.success('Ticket deleted successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            } catch (error) {
                console.error("Error deleting ticket:", error);
                toast.error('Failed to delete ticket. Please try again.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            } finally {
                setIsDeleting(false);
                activeToastId.current = null;
            }
        };

        return (
            <div className={styles.deleteConfirmation} ref={confirmationRef}>
                <p>Are you sure you want to delete this ticket?</p>
                <div className={styles.deleteButtons}>
                    <button onClick={confirmDelete} className={styles.deleteYesButton} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button onClick={closeToast} className={styles.deleteNoButton}>
                        No
                    </button>
                </div>
            </div>
        );
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

    const askToDeleteConfirmation = (ticketId) => {
        if (activeToastId.current) {
            toast.dismiss(activeToastId.current);
        }

        activeToastId.current = toast(<DeleteConfirmation ticketId={ticketId} closeToast={() => toast.dismiss(activeToastId.current)} />, {
            position: "top-center",
            closeOnClick: false,
            draggable: false,
            closeButton: false,
            autoClose: false,
            hideProgressBar: true,
            className: styles.deleteToast,
            onClose: () => {
                activeToastId.current = null;
            }
        });
    };

    if (loading) return <div>Loading your tickets...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.myTicketsContainer}>
            <h1>My Tickets</h1>
            {userTickets.length === 0 ? (
                <p>No tickets found.</p>
            ) : (
                <div className={styles.ticketsList}>
                    {userTickets.map((ticket) => (
                        <div key={ticket.id} className={styles.ticketItem}>
                            <div className={styles.ticketDetails}>
                                <p>Place: {ticket.placeName}</p>
                                <p>Date: {ticket.bookingDate}</p>
                                <p>Visitor Type: {ticket.visitorType}</p>
                                {qrCodes[ticket.id] ? (
                                    <img src={qrCodes[ticket.id]} alt={`QR Code for ${ticket.placeName}`} className={styles.qrCodeImage} />
                                ) : (
                                    <div>Generating QR Code...</div>
                                )}
                            </div>
                            <button
                                onClick={() => askToDeleteConfirmation(ticket.id)}
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