import React, { useState, useEffect } from 'react';
import NavigationBar from './NavigationBar';
import styles from './Layout.module.css'; 
import { FaArrowCircleUp } from 'react-icons/fa'; 

const Layout = ({ children }) => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <div className={styles.container}>
            <NavigationBar />
            <main className={styles.mainContent}>
                {children}
            </main>
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className={styles.scrollTopButton}
                    aria-label="Go to top"
                >
                    <FaArrowCircleUp size={40} />
                </button>
            )}
            
        </div>
    );
};

export default Layout;