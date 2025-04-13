import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/Egyptian_Pyramids_with_Sphinx.png"; // Adjust path if needed
import styles from './NavigationBar.module.css';
// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'; // Import the specific icon

const NavigationBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
    const navRef = useRef(null);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        console.log('Search submitted:', searchTerm);
        setSearchTerm('');
        closeMobileMenu();
    };

    const toggleMobileMenu = () => {
        setMobileMenuVisible((prev) => !prev);
    };

    const closeMobileMenu = () => {
        setMobileMenuVisible(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                const burgerButton = navRef.current.querySelector(`.${styles.burgerMenuIcon}`);
                if (!burgerButton || !burgerButton.contains(event.target)) {
                    closeMobileMenu();
                }
            }
        };
        if (mobileMenuVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileMenuVisible]);

    return (
        <nav className={styles.navbar} ref={navRef}>
            {/* Logo */}
            <div className={styles.logoContainer}>
                <Link to="/welcome" className={styles.logoLink} onClick={closeMobileMenu}>
                    <img src={logo} alt="EgyTour Logo" className={styles.logo} />
                </Link>
            </div>

            {/* Spacer */}
            <div className={styles.spacer}></div>

            {/* Desktop Nav Links */}
            <div className={styles.desktopItems}>
                <ul className={styles.navLinks}>
                    <li><Link to="/about" className={styles.navLink}>About Egypt</Link></li>
                    <li><Link to="/cities" className={styles.navLink}>Cities</Link></li>
                    <li><Link to="/categories" className={styles.navLink}>Categories</Link></li>
                    <li><Link to="/profile" className={styles.navLink}>Profile</Link></li>
                </ul>
            </div>

            {/* Search Bar */}
            <div className={styles.searchBar}>
                <form onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                    {/* Updated Button with Font Awesome Icon */}
                    <button type="submit" className={styles.searchButton}>
                       <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchButtonIcon} />
                       <span className={styles.searchButtonText}>Search</span>
                    </button>
                </form>
            </div>

            {/* Mobile Icons */}
            <div className={styles.mobileIcons}>
                <button onClick={toggleMobileMenu} className={styles.burgerMenuIcon}>
                    {mobileMenuVisible ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Menu */}
            <ul className={`${styles.mobileMenu} ${mobileMenuVisible ? styles.visible : ''}`}>
                 {/* Links */}
                 <li><Link to="/about" className={styles.navLink} onClick={closeMobileMenu}>About Egypt</Link></li>
                 <li><Link to="/cities" className={styles.navLink} onClick={closeMobileMenu}>Cities</Link></li>
                 <li><Link to="/categories" className={styles.navLink} onClick={closeMobileMenu}>Categories</Link></li>
                 <li><Link to="/profile" className={styles.navLink} onClick={closeMobileMenu}>Profile</Link></li>
            </ul>
        </nav>
    );
};

export default NavigationBar;