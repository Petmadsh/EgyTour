import React, { useState, useEffect } from "react";
import { auth, googleProvider, db } from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import styles from "./LoginPage.module.css";
import modalStyles from "./ModalStyles.module.css"; 
import logo from "./assets/Egyptian_Pyramids_with_Sphinx.png";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Modal from 'react-modal'; 

Modal.setAppElement('#root'); 

const LoginPage = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: "", password: "" });
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); 
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showLoginFailedModal, setShowLoginFailedModal] = useState(false);
    const [loginFailedMessage, setLoginFailedMessage] = useState("");
    const [showGoogleLoginFailedModal, setShowGoogleLoginFailedModal] = useState(false);
    const [googleLoginFailedMessage, setGoogleLoginFailedMessage] = useState("");

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        let valid = true;
        const newErrors = { email: "", password: "" };

        if (!form.email) {
            newErrors.email = "Email is required";
            valid = false;
        }

        if (!form.password) {
            newErrors.password = "Password is required";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const login = async () => {
        if (!validate()) return;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;
            if (!user.emailVerified) {
                setShowVerificationModal(true);
                return;
            }
            navigate("/welcome");
        } catch (err) {
            let errorMessage = "Login failed.";
            if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            } else if (err.code === 'auth/user-not-found') {
                errorMessage = 'User not found.';
            } else if (err.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password.';
            } else if (err.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your internet connection.';
            }
            setLoginFailedMessage(errorMessage);
            setShowLoginFailedModal(true);
        }
    };

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider.setCustomParameters({ prompt: 'select_account' }));
            const user = result.user;

            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    const { displayName, email } = user;
                    const [firstName = '', ...lastNameParts] = displayName?.split(' ') || [];
                    const lastName = lastNameParts.join(' ');

                    await setDoc(userDocRef, {
                        firstName: firstName,
                        lastName: lastName,
                        email: email || '',
                    });
                    console.log('Google user data added to Firestore');
                }
                navigate("/welcome");
            }
        } catch (err) {
            let errorMessage = "Google login failed.";
            if (err.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Google login popup was closed by the user.';
            } else if (err.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (err.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'An account with the same email already exists with different credentials.';
            }
            setGoogleLoginFailedMessage(errorMessage);
            setShowGoogleLoginFailedModal(true);
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const closeModal = () => {
        setShowVerificationModal(false);
        setShowLoginFailedModal(false);
        setShowGoogleLoginFailedModal(false);
        setLoginFailedMessage("");
        setGoogleLoginFailedMessage("");
    };

    return (
        <div className={`${styles.container} ${isMobile ? styles.mobileContainer : ''}`}>
            <div className={styles.logoContainer}>
                <img src={logo} alt="Your Logo" className={styles.logo} />
            </div>
            <h2 className={styles.loginTitle}>Login</h2>
            <div className={styles.inputGroup}>
                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder=" "
                    value={form.email}
                    onChange={handleChange}
                    className={styles.input}
                />
                <label htmlFor="email" className={styles.label}>Email</label>
                {errors.email && <p className={styles.error}>{errors.email}</p>}
            </div>
            <div className={styles.inputGroup}>
                <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder=" "
                    value={form.password}
                    onChange={handleChange}
                    className={styles.input}
                />
                <label htmlFor="password" className={styles.label}>Password</label>
                <span className={styles.passwordToggle} onClick={togglePasswordVisibility}>
                    {passwordVisible ? '👁️' : '👁️‍🗨️'}
                </span>
                {errors.password && <p className={styles.error}>{errors.password}</p>}
            </div>
            <div className={styles.forgotPassword}>
                <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            <button onClick={login} className={styles.loginButton}>
                Login
            </button>
            <button onClick={loginWithGoogle} className={styles.googleButton}>
                Or Login With Google
                <img src="/assets/Google_Logo.png" alt="Google Logo" className={styles.googleIcon} />
            </button>
            <div className={styles.registerLink}>
                Don't have an account? <Link to="/register" className={styles.registerText}>Register</Link>
            </div>

            {/* Email Verification Modal */}
            <Modal
                isOpen={showVerificationModal}
                onRequestClose={closeModal}
                className={modalStyles.modalContent}
                overlayClassName={modalStyles.modalOverlay}
                contentLabel="Email Verification Required"
            >
                <h2 className={`${modalStyles.modalTitle} ${modalStyles.warningTitle}`}>Verify Your Email</h2>
                <p className={modalStyles.modalMessage}>Please verify your email address before logging in.</p>
                <button onClick={closeModal} className={modalStyles.confirmButton}>Okay</button>
            </Modal>

            {/* Login Failed Modal */}
            <Modal
                isOpen={showLoginFailedModal}
                onRequestClose={closeModal}
                className={modalStyles.modalContent}
                overlayClassName={modalStyles.modalOverlay}
                contentLabel="Login Failed"
            >
                <h2 className={`${modalStyles.modalTitle} ${modalStyles.errorTitle}`}>Login Failed</h2>
                <p className={modalStyles.modalMessage}>{loginFailedMessage}</p>
                <button onClick={closeModal} className={modalStyles.confirmButton}>Okay</button>
            </Modal>

            {/* Google Login Failed Modal */}
            <Modal
                isOpen={showGoogleLoginFailedModal}
                onRequestClose={closeModal}
                className={modalStyles.modalContent}
                overlayClassName={modalStyles.modalOverlay}
                contentLabel="Google Login Failed"
            >
                <h2 className={`${modalStyles.modalTitle} ${modalStyles.errorTitle}`}>Google Login Failed</h2>
                <p className={modalStyles.modalMessage}>{googleLoginFailedMessage}</p>
                <button onClick={closeModal} className={modalStyles.confirmButton}>Okay</button>
            </Modal>
        </div>
    );
};

export default LoginPage;