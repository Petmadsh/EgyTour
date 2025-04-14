// NavigationBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import logo from "../assets/Egyptian_Pyramids_with_Sphinx.png";
import styles from './NavigationBar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';

const NavigationBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const navRef = useRef(null);
    const searchInputRef = useRef(null);
    const profileIconRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const activeToastId = useRef(null);

    const SignOutConfirmation = ({ closeToast }) => {
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

        return (
            <div className={styles.signOutConfirmation} ref={confirmationRef}>
                <p>Are you sure you want to sign out?</p>
                <div className={styles.signOutButtons}>
                    <button
                        onClick={async () => {
                            try {
                                await signOut(auth);
                                navigate('/login');
                                toast.success('Successfully signed out!', {
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
                                toast.error('Error signing out. Please try again.', {
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
                                closeProfileMenu();
                                closeMobileMenu();
                                closeToast();
                                activeToastId.current = null;
                            }
                        }}
                        className={styles.signOutYesButton}
                    >
                        Yes, Sign Out
                    </button>
                    <button onClick={closeToast} className={styles.signOutNoButton}>
                        No
                    </button>
                </div>
            </div>
        );
    };

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

        const storedNames = localStorage.getItem('allSearchableNames');
        if (storedNames) {
            const allNames = JSON.parse(storedNames);
            const results = allNames.filter(item =>
                item.name.toLowerCase().includes(term.toLowerCase())
            );
            setSearchResults(results.slice(0, 5));
            setIsDropdownVisible(term.length > 0);
        } else {
            setSearchResults([]);
            setIsDropdownVisible(term.length > 0);
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

    const toggleProfileMenu = () => {
        setProfileMenuVisible((prev) => !prev);
    };

    const closeProfileMenu = () => {
        setProfileMenuVisible(false);
    };

    const handleProfileOptionClick = (path) => {
        closeProfileMenu();
        navigate(path);
    };

    const handleSignOut = () => {
        if (activeToastId.current) {
            toast.dismiss(activeToastId.current);
        }

        activeToastId.current = toast(<SignOutConfirmation closeToast={() => toast.dismiss(activeToastId.current)} />, {
            position: "top-center",
            closeOnClick: false, // Prevent default close on click outside
            draggable: false,
            closeButton: false,
            autoClose: false,
            hideProgressBar: true,
            className: styles.signOutToast,
            onClose: () => {
                activeToastId.current = null;
            }
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target) &&
                (!searchInputRef.current || !searchInputRef.current.contains(event.target)) &&
                (!profileIconRef.current || !profileIconRef.current.contains(event.target))) {
                closeMobileMenu();
                setIsDropdownVisible(false);
                closeProfileMenu();
            }
        };
        if (mobileMenuVisible || isDropdownVisible || profileMenuVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileMenuVisible, isDropdownVisible, profileMenuVisible]);

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
                            end
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
                            end
                        >
                            My Tickets
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
                        onFocus={() => setIsDropdownVisible(searchTerm.length > 0)}
                    />
                    <button type="submit" className={styles.searchButton}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchButtonIcon} />
                        <span className={styles.searchButtonText}>Search</span>
                    </button>
                </form>
                {isDropdownVisible && (
                    <ul className={styles.searchResultsDropdown}>
                        {searchResults.length > 0 ? (
                            searchResults.map((result, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSearchResultClick(result)}
                                    className={styles.searchResultItem}
                                >
                                    {result.name}
                                </li>
                            ))
                        ) : searchTerm.length > 0 ? (
                            <li className={styles.searchResultItem}>No results found!</li>
                        ) : null}
                    </ul>
                )}
            </div>

            {/* Profile Icon */}
            <div className={styles.profileIconContainer} ref={profileIconRef}>
                <FontAwesomeIcon
                    icon={faUserCircle}
                    className={styles.profileIcon}
                    onClick={toggleProfileMenu}
                />
                {profileMenuVisible && (
                    <ul className={styles.profileDropdown}>
                        <li onClick={() => handleProfileOptionClick('/profile')}>My Profile</li>
                        <li onClick={handleSignOut}>
                            <FontAwesomeIcon icon={faSignOutAlt} className={styles.signOutIcon} /> Sign Out
                        </li>
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
                        end
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
                        end
                    >
                        My Tickets
                    </NavLink>
                </li>
                {/* Profile options in mobile menu */}
                <li>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
                        onClick={closeMobileMenu}
                        end
                    >
                        Profile
                    </NavLink>
                </li>
                <li>
                    <button onClick={handleSignOut} className={styles.navLink}>
                        <FontAwesomeIcon icon={faSignOutAlt} className={styles.signOutIcon} /> Sign Out
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default NavigationBar;