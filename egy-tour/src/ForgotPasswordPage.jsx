import React, { useState } from "react";
import { auth } from "./firebase";
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import styles from "./ForgotPasswordPage.module.css"; 
import logo from "./assets/Egyptian_Pyramids_with_Sphinx.png";
import { toast } from 'react-toastify';


const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setEmail(e.target.value);
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
                toast.error("There is no account associated with this email address.", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                return;
            }

            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset email sent! Please check your inbox.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                onClose: () => {
                    navigate("/login");
                }
            });
            setEmail(""); 
        } catch (err) {
            let errorMessage = "Failed to send password reset email.";
            if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            } else if (err.code === 'auth/user-not-found') {
                errorMessage = 'There is no account associated with this email address.';
            } else if (err.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your internet connection.';
            }
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };

    return (
        <div className={styles.container}>
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
                <label htmlFor="email" className={styles.label}>Email </label>
                {error && <p className={styles.error}>{error}</p>}
            </div>
            <button onClick={resetPassword} className={styles.resetButton}>
                Reset Password
            </button>
            <div className={styles.loginLink}>
                <Link to="/login">Back to Login</Link>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;