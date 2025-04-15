import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import QRCodeGenerator from 'qrcode';

const MyTicketsPage = () => {
    const [userTickets, setUserTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrCodes, setQrCodes] = useState({});

    useEffect(() => {
        const fetchUserTickets = async () => {
            setLoading(true); // Start loading
            setError(null);    // Clear any previous errors
            try {
                if (!auth.currentUser) {
                    // Not logged in.  Don't try to fetch, and set appropriate state.
                    setUserTickets([]); // Clear tickets
                    setQrCodes({});       // Clear QR codes
                    setLoading(false);
                    return;
                }
                const userId = auth.currentUser.uid;
                const q = query(collection(db, 'bookings'), where('userId', '==', userId));
                const querySnapshot = await getDocs(q);
                const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserTickets(tickets);

                // Generate QR codes
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
                    // Handle errors during QR code generation.  This is important!
                    setError("Failed to generate QR codes."); // Set an error message
                    setQrCodes({}); // Clear any partially generated QR codes.
                    console.error("QR Code Generation Error:", qrCodeError);
                }

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setUserTickets([]); // Clear tickets on error
                setQrCodes({});       // Clear QR codes on error
                setLoading(false);
            }
        };

        // Check for currentUser *before* calling fetchUserTickets
        if (auth.currentUser) {
            fetchUserTickets();
        } else {
            // If no user, set empty state and stop.  This prevents the
            // component from trying to fetch with no user, which could
            // cause a brief "no tickets" flicker.
            setUserTickets([]);
            setQrCodes({});
            setLoading(false); // Make sure loading is false
        }

        // Listen for auth changes.  This is CRUCIAL for re-fetching when the user
        // logs in or out *on* this page.  Without this, if a user logs in
        // and is already on MyTicketsPage, it won't update.
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUserTickets(); // Re-fetch when user logs in
            } else {
                // Clear state when user logs out
                setUserTickets([]);
                setQrCodes({});
                setLoading(false); // Ensure loading is set.
            }
        });

        // Cleanup the listener when the component unmounts.  This is best practice.
        return () => unsubscribe();

    }, []); //  Dependencies:  Empty array, so this runs *once* on mount, and
    //  again when the auth state changes.

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
