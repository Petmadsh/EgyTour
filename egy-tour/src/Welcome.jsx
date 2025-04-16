import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Welcome.module.css';
import pyramidsSphinxImage from './images/pyramids_sphinx.jpg';
import khanElKhaliliImage from './images/Khan-El-Khalili-Bazaar.jpg';
import mosqueMuhammadAliImage from './images/mosque_muhammad_ali.webp';
import nileFeluccaImage from './images/nile_felucca.jpg';

const Welcome = () => {
    return (
        <div className={styles.welcomeContainer}>
            <header className={styles.header}>
                <h1>Welcome to the Land of the Pharaohs</h1>
                <p>Embark on a journey through millennia of history and a vibrant tapestry of culture in Egypt.</p>
            </header>

            <section className={styles.egyptInfo}>
                <h2>A Glimpse into Egypt</h2>

                <div className={styles.infoSection}>
                    <h3>Ancient History</h3>
                    <p>
                        Egypt boasts one of the oldest and most influential civilizations in the world. From the majestic pyramids of Giza and the imposing Sphinx to the intricate temples of Karnak and Luxor, the remnants of the pharaohs' reign continue to awe visitors. Explore the Valley of the Kings, where royal tombs hold secrets of a bygone era, and discover the fascinating hieroglyphic writing that tells the stories of their lives and beliefs.
                    </p>
                    <img
                        src={pyramidsSphinxImage}
                        alt="Great Sphinx of Giza"
                        loading="lazy"
                        className={styles.infoImage}
                    />
                </div>

                <div className={styles.infoSection}>
                    <h3>Rich Culture</h3>
                    <p>
                        Egyptian culture is a captivating blend of ancient traditions and modern influences. Experience the warmth and hospitality of the Egyptian people, whose customs are deeply rooted in family and community. Wander through bustling souks (markets) filled with aromatic spices, intricate handicrafts, and vibrant textiles. Listen to the enchanting sounds of traditional music and witness captivating performances of folk dances that tell stories of the land.
                    </p>
                    <img
                        src={khanElKhaliliImage}
                        alt="Khan el-Khalili Bazaar"
                        loading="lazy"
                        className={styles.infoImage}
                    />
                </div>

                <div className={styles.infoSection}>
                    <h3>Art and Architecture</h3>
                    <p>
                        From the colossal scale of ancient monuments to the delicate artistry of Islamic architecture, Egypt's artistic heritage is breathtaking. Marvel at the detailed carvings in ancient temples, the intricate patterns of mosques, and the vibrant colors of Coptic art. The fusion of different eras and styles creates a unique visual landscape that reflects the country's diverse history.
                    </p>
                    <img
                        src={mosqueMuhammadAliImage}
                        alt="Mosque of Muhammad Ali Interior"
                        loading="lazy"
                        className={styles.infoImage}
                    />
                </div>

                <div className={styles.infoSection}>
                    <h3>The Nile River</h3>
                    <p>
                        The lifeblood of Egypt, the Nile River has shaped its history and culture for millennia. Take a felucca ride along its tranquil waters, witness the fertile landscapes along its banks, and understand its vital role in agriculture and transportation. The Nile offers a unique perspective on Egypt's beauty and its enduring connection to nature.
                    </p>
                    <img
                        src={nileFeluccaImage}
                        alt="Felucca on the Nile"
                        loading="lazy"
                        className={styles.infoImage}
                    />
                </div>
            </section>

            <section className={styles.callToAction}>
                <h2>Ready to Explore Egypt?</h2>
                <p>Discover the wonders that await you. Browse our cities and plan your unforgettable Egyptian adventure!</p>
                <Link to="/cities" className={styles.exploreButton}>Explore All Cities</Link>
            </section>
        </div>
    );
};

export default Welcome;