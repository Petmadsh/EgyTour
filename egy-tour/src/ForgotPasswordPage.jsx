import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import styles from "./ForgotPasswordPage.module.css";
import modalStyles from "./ModalStyles.module.css";
import logo from "./assets/Egyptian_Pyramids_with_Sphinx.png";
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [modal, setModal] = useState({ show: false, message: "", title: "", type: "", onClose: null });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
        setEmail(e.target.value);
    };

    const showModal = (title, message, type, onClose = null) => {
        setModal({ show: true, title, message, type, onClose });
    };

    const closeModal = () => {
        setModal({ ...modal, show: false });
        if (modal.onClose) {
            modal.onClose();
        }
    };

    const resetPassword = async () => {
        if (!email) {
            setError("Please enter your email address.");
            return;
        }
        setError("");

        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (methods.length === 0) {
                showModal(
                    "Error",
                    "There is no account associated with this email address.",
                    "error"
                );
                return;
            }

            await sendPasswordResetEmail(auth, email);
            showModal(
                "Success",
                "Password reset email sent! Please check your inbox.",
                "success",
                () => {
                    navigate("/login");
                }
            );
            setEmail("");
        } catch (err) {
            let errorMessage = "Failed to send password reset email.";
            if (err.code === "auth/invalid-email") {
                errorMessage = "Invalid email address.";
            } else if (err.code === "auth/user-not-found") {
                errorMessage = "There is no account associated with this email address.";
            } else if (err.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your internet connection.";
            }
            showModal("Error", errorMessage, "error");
        }
    };

    return (
        <div className={`${styles.container} ${isMobile ? styles.mobileContainer : ''}`}>
            <div className={styles.logoContainer}>
                <img src={logo} alt="Your Logo" className={styles.logo} />
            </div>
            <h2 className={styles.title}>Reset Password</h2>
            <div className={styles.inputGroup}>
                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder=" "
                    value={email}
                    onChange={handleChange}
                    className={styles.input}
                />
                <label htmlFor="email" className={styles.label}>
                    Email{" "}
                </label>
                {error && <p className={styles.error}>{error}</p>}
            </div>
            <button onClick={resetPassword} className={styles.resetButton}>
                Reset Password
            </button>
            <div className={styles.loginLink}>
                <Link to="/login">Back to Login</Link>
            </div>

            <Modal
                isOpen={modal.show}
                onRequestClose={closeModal}
                className={`${modalStyles.modalContent}`}
                overlayClassName={modalStyles.modalOverlay}
                contentLabel={modal.title}
            >
                {modal.type === "success" && (
                    <h2 className={`${modalStyles.modalTitle} ${modalStyles.successTitle}`}>
                        {modal.title}
                    </h2>
                )}
                {modal.type === "error" && (
                    <h2 className={`${modalStyles.modalTitle} ${modalStyles.errorTitle}`}>
                        {modal.title}
                    </h2>
                )}
                
                {modal.type !== "success" &&
                    modal.type !== "error" &&
                     (
                        <h2 className={modalStyles.modalTitle}>{modal.title}</h2>
                    )}

                <p className={modalStyles.modalMessage}>{modal.message}</p>

                <div className={modalStyles.modalButtons}>
                    {modal.type === "success" && (
                        <button
                            className={`${modalStyles.confirmButton} ${modalStyles.successButton}`}
                            onClick={closeModal}
                        >
                            Okay
                        </button>
                    )}
                    {modal.type === "error" && (
                        <button
                            className={`${modalStyles.errorButton} ${modalStyles.confirmButton}`}
                            onClick={closeModal}
                        >
                            Okay
                        </button>
                    )}
                    
                    {modal.type !== "success" &&
                        modal.type !== "error" &&
                        (
                            <>
                                <button
                                    className={`${modalStyles.confirmButton}`}
                                    onClick={closeModal}
                                >
                                    Yes
                                </button>
                                <button
                                    className={modalStyles.cancelButton}
                                    onClick={closeModal}
                                >
                                    No
                                </button>
                            </>
                        )}
                </div>
            </Modal>
        </div>
    );
};

export default ForgotPasswordPage;