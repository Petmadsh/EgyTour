import React, { useState } from "react";
import { auth, googleProvider, db } from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import styles from "./LoginPage.module.css";
import logo from "./assets/Egyptian_Pyramids_with_Sphinx.png";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from 'react-toastify';

const LoginPage = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: "", password: "" });
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);

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
            await signInWithEmailAndPassword(auth, form.email, form.password);
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

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className={styles.container}>
            <div className={styles.logoContainer}>
                <img src={logo} alt="Your Logo" className={styles.logo} />
            </div>
            <h2 className={styles.loginTitle}>LOGIN</h2>
            <div className={styles.inputGroup}>
                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder=" " /* Empty placeholder initially */
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
                    placeholder=" " /* Empty placeholder initially */
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
                LOGIN
            </button>
            <button onClick={loginWithGoogle} className={styles.googleButton}>
                OR LOGIN WITH GOOGLE
            </button>
            <div className={styles.registerLink}>
                Don't have an account? <Link to="/register" className={styles.registerText}>Register</Link>
            </div>
        </div>
    );
};

export default LoginPage;