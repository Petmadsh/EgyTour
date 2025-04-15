import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import QRCodeGenerator from 'qrcode'; // Renamed to avoid conflict

const MyTicketsPage = () => {
    const [userTickets, setUserTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrCodes, setQrCodes] = useState({}); // Store generated QR code URLs

    useEffect(() => {
        const fetchUserTickets = async () => {
            try {
                if (!auth.currentUser) {
                    setLoading(false);
                    return;
                }
                const userId = auth.currentUser.uid;
                const q = query(collection(db, 'bookings'), where('userId', '==', userId));
                const querySnapshot = await getDocs(q);
                const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserTickets(tickets);

                // Generate QR codes for each ticket
                const qrCodePromises = tickets.map(ticket => {
                    return new Promise((resolve, reject) => {
                        QRCodeGenerator.toDataURL(JSON.stringify(ticket), (err, url) => {
                            if (err) {
                                console.error("QR Code Error:", err);
                                reject(err); // Reject the promise on error
                            } else {
                                resolve({ ticketId: ticket.id, qrCodeURL: url }); // Resolve with an object
                            }
                        });
                    });
                });

                // Wait for all QR codes to be generated
                const results = await Promise.all(qrCodePromises);

                // Store the results in the qrCodes state, keyed by ticket ID.
                const qrCodeMap = {};
                results.forEach(result => {
                    qrCodeMap[result.ticketId] = result.qrCodeURL;
                });
                setQrCodes(qrCodeMap);

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchUserTickets();
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
                                <div>Generating QR Code...</div> // Or some other placeholder
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTicketsPage;