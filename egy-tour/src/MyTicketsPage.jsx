import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'; // Import orderBy
import QRCodeGenerator from 'qrcode';

const MyTicketsPage = () => {
    const [userTickets, setUserTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrCodes, setQrCodes] = useState({});

    useEffect(() => {
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
                // Add orderBy here:
                const q = query(
                    collection(db, 'bookings'),
                    where('userId', '==', userId),
                    orderBy('bookingDate', 'asc') // Sort by bookingDate in ascending order
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

    if (loading) return <div>Loading your tickets...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>My Tickets</h1>
            {userTickets.length === 0 ? (
                <p>No tickets found.</p>
            ) : (
                <div>
                    {userTickets.map((ticket) => (
                        <div key={ticket.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
                            <p>Place: {ticket.placeName}</p>
                            <p>Date: {ticket.bookingDate}</p>
                            <p>Visitor Type: {ticket.visitorType}</p>
                            {qrCodes[ticket.id] ? (
                                <img src={qrCodes[ticket.id]} alt={`QR Code for ${ticket.placeName}`} />
                            ) : (
                                <div>Generating QR Code...</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTicketsPage;
