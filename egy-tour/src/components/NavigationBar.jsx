import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/Egyptian_Pyramids_with_Sphinx.png"; 
import styles from './NavigationBar.module.css';
import { useState } from 'react';

const NavigationBar = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        // You would typically implement the search functionality here
        console.log('Search term:', event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        // Implement your search submission logic here
        console.log('Search submitted:', searchTerm);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.logoContainer}>
                <Link to="/welcome" className={styles.logoLink}> {/* Link to the home page */}
                    <img src={logo} alt="EgyTour Logo" className={styles.logo} />
                </Link>
            </div>
            <ul className={styles.navLinks}>
                <li><Link to="/about" className={styles.navLink}>About Egypt</Link></li>
                <li><Link to="/cities" className={styles.navLink}>Cities</Link></li>
                <li><Link to="/categories" className={styles.navLink}>Categories</Link></li>
                <li><Link to="/profile" className={styles.navLink}>Profile</Link></li>
            </ul>
            <div className={styles.searchBar}>
                <form onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>Search</button>
                </form>
            </div>
        </nav>
    );
};

export default NavigationBar;