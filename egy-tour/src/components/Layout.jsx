import React from 'react';
import NavigationBar from './NavigationBar';
import styles from './Layout.module.css'; // You can create a CSS module for the layout if needed

const Layout = ({ children }) => {
    return (
        <div className={styles.container}>
            <NavigationBar />
            <main className={styles.mainContent}>
                {children} {/* This is where the content of each specific page will be rendered */}
            </main>
            {/* You could also add a common footer here if needed */}
        </div>
    );
};

export default Layout;