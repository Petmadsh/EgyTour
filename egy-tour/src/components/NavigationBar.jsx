// NavigationBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'; // Import NavLink and useLocation
import logo from "../assets/Egyptian_Pyramids_with_Sphinx.png"; // Adjust path if needed
import styles from './NavigationBar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'; // Import the specific icon

const NavigationBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
    const navRef = useRef(null);
    const searchInputRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location

    useEffect(() => {
        const fetchCityAndPlaceNames = async () => {
            try {
                const response = await fetch('/data.json');
                if (!response.ok) {
                    console.error('Failed to fetch data.json');
                    return [];
                }
                const data = await response.json();
                const allNames = [];
                data.cities.forEach(city => {
                    allNames.push({ name: city.name, type: 'city' });
                    if (city.places) {
                        city.places.forEach(place => {
                            allNames.push({ name: place.name, type: 'place', cityName: city.name });
                        });
                    }
                });
                return allNames;
            } catch (error) {
                console.error('Error fetching data:', error);
                return [];
            }
        };

        fetchCityAndPlaceNames().then(names => {
            localStorage.setItem('allSearchableNames', JSON.stringify(names));
        });
    }, []);

    const handleSearchChange = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        setIsDropdownVisible(term.length > 0 && searchResults.length > 0);

        const storedNames = localStorage.getItem('allSearchableNames');
        if (storedNames) {
            const allNames = JSON.parse(storedNames);
            const results = allNames.filter(item =>
                item.name.toLowerCase().includes(term.toLowerCase())
            );
            setSearchResults(results.slice(0, 5)); // Limit to top 5 results
        } else {
            setSearchResults([]);
        }
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (searchResults.length > 0) {
            handleSearchResultClick(searchResults[0]);
        } else if (searchTerm) {
            console.log('Search submitted:', searchTerm);
            setSearchTerm('');
            setIsDropdownVisible(false);
            closeMobileMenu();
            // Optionally navigate to a search results page if needed
        }
    };

    const handleSearchResultClick = (result) => {
        setSearchTerm('');
        setSearchResults([]);
        setIsDropdownVisible(false);
        closeMobileMenu();
        if (result.type === 'city') {
            navigate(`/city/${result.name.replace(/ /g, '-')}`);
        } else if (result.type === 'place') {
            navigate(`/city/${result.cityName.replace(/ /g, '-')}/place/${result.name.replace(/ /g, '-')}`);
        }
    };

    const toggleMobileMenu = () => {
        setMobileMenuVisible((prev) => !prev);
    };

    const closeMobileMenu = () => {
        setMobileMenuVisible(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target) &&
                (!searchInputRef.current || !searchInputRef.current.contains(event.target))) {
                closeMobileMenu();
                setIsDropdownVisible(false);
            }
        };
        if (mobileMenuVisible || isDropdownVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileMenuVisible, isDropdownVisible]);

    return (
        <nav className={styles.navbar} ref={navRef}>
            {/* Logo */}
            <div className={styles.logoContainer}>
                <Link to="/welcome" className={styles.logoLink} onClick={closeMobileMenu}>
                    <img src={logo} alt="EgyTour Logo" className={styles.logo} />
                </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className={styles.desktopItems}>
                <ul className={styles.navLinks}>
                    <li>
                        <NavLink
                            to="/about"
                            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
                            onClick={closeMobileMenu}
                            end // Only active when the exact path matches
                        >
                            About Egypt
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/cities"
                            className={({ isActive }) => isActive || location.pathname.startsWith('/city') ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
                            onClick={closeMobileMenu}
                        >
                            Cities
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/tickets"
                            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
                            onClick={closeMobileMenu}
                            end // Only active when the exact path matches
                        >
                            My Tickets
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
                            onClick={closeMobileMenu}
                            end // Only active when the exact path matches
                        >
                            Profile
                        </NavLink>
                    </li>
                </ul>
            </div>

            {/* Spacer */}
            <div className={styles.spacer}></div>

            {/* Search Bar */}
            <div className={styles.searchBar} ref={searchInputRef}>
                <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Search cities or places..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                        onFocus={() => setIsDropdownVisible(searchTerm.length > 0 && searchResults.length > 0)}
                    />
                    <button type="submit" className={styles.searchButton}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchButtonIcon} />
                        <span className={styles.searchButtonText}>Search</span>
                    </button>
                </form>
                {isDropdownVisible && searchResults.length > 0 && (
                    <ul className={styles.searchResultsDropdown}>
                        {searchResults.map((result, index) => (
                            <li
                                key={index}
                                onClick={() => handleSearchResultClick(result)}
                                className={styles.searchResultItem}
                            >
                                {result.name}
                            </li>
                        ))}
                    </ul>
                )}
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
                <li>
                    <NavLink
                        to="/about"
                        className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
                        onClick={closeMobileMenu}
                        end // Only active when the exact path matches
                    >
                        About Egypt
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/cities"
                        className={({ isActive }) => isActive || location.pathname.startsWith('/city') ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
                        onClick={closeMobileMenu}
                    >
                        Cities
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/tickets"
                        className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
                        onClick={closeMobileMenu}
                        end // Only active when the exact path matches
                    >
                        My Tickets
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
                        onClick={closeMobileMenu}
                        end // Only active when the exact path matches
                    >
                        Profile
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default NavigationBar;