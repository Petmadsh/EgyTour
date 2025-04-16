import React from 'react';
import './AboutEgyptPage.css';

const funFacts = [
    {
        icon: "👥",
        title: "103 million",
        text: "the population of Egypt with youth representing around 60%",
        color: "bg-1"
    },
    {
        icon: "☀️",
        title: "3,800+",
        text: "hours of sun/year",
        color: "bg-2"
    },
    {
        icon: "🏙️",
        title: "21 million+",
        text: "the population of Cairo, one of the world’s largest cities",
        color: "bg-3"
    },
    {
        icon: "⛰️",
        title: "2,629 m",
        text: "the height of Mount Catherine in Sinai, the highest point in Egypt",
        color: "bg-4"
    },
    {
        icon: "🌊",
        title: "3,800 sq km",
        text: "of coral reefs in Egypt’s Red Sea",
        color: "bg-4"
    },
    {
        icon: "🛡️",
        title: "7,000 sq km",
        text: "of marine protected areas",
        color: "bg-1"
    },
    {
        icon: "🌅",
        title: "2,900 km",
        text: "of coastline",
        color: "bg-2"
    },
    {
        icon: "🌲",
        title: "525 ha",
        text: "of mangrove forests",
        color: "bg-3"
    },
    {
        icon: "⭐",
        title: "750+",
        text: "species of fish in Egypt’s waters",
        color: "bg-3"
    },
    {
        icon: "🕊️",
        title: "490+",
        text: "species of birds in Egypt",
        color: "bg-2"
    },
    {
        icon: "🦅",
        title: "300 - 350",
        text: "species of migrating birds throughout the year",
        color: "bg-4"
    },
    {
        icon: "🏜️",
        title: "93%",
        text: "of the total land area of Egypt is desert",
        color: "bg-1"
    }
];

const AboutEgyptPage = () => {
    return (
        <div className="about-page">
            <h1>About Egypt</h1>
            <section>
                <h2>Discover the Warmth of Egypt & Make Lifelong Memories</h2>
                <p>
                    A life well-travelled cannot be considered complete without at least one visit to Egypt!
                    Egypt isn’t just home to the oldest and best-preserved historical sites on earth,
                    the country offers diverse holiday experiences catered to your travel preferences.
                    You can enjoy an immersive urban experience in Cairo and Alexandria, discover some of
                    the best snorkeling and scuba diving sites in the world in the Red Sea, get a taste
                    of life on the Nile on personalized Nile cruises, or curate your own desert adventure.
                    The energy, hospitality, and good humor of the Egyptian people are at the heart of
                    any visit to Egypt, with sunny smiles etched onto the faces of nearly every person
                    you will encounter. Expect multiple offers for homecooked meals, invites to weddings
                    and parties, and a chance to make new friends as warm as the golden Egyptian sun.
                </p>
            </section>

            <section className="fun-facts">
                <h2>Fun Facts</h2>
                <div className="facts-grid">
                    {funFacts.map((fact, index) => (
                        <div key={index} className={`fact-box ${fact.color}`}>
                            <div className="icon">{fact.icon}</div>
                            <h3>{fact.title}</h3>
                            <p>{fact.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AboutEgyptPage;