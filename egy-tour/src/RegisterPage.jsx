import React, { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import styles from "./RegisterPage.module.css"; 
import logo from "./assets/Egyptian_Pyramids_with_Sphinx.png";
import { toast } from 'react-toastify'; 

const RegisterPage = () => {
    const [form, setForm] = useState({ first: "", last: "", email: "", password: "", confirm: "" });
    const [errors, setErrors] = useState({ first: "", last: "", email: "", password: "", confirm: "" });
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        let valid = true;
        const newErrors = { first: "", last: "", email: "", password: "", confirm: "" };

        if (!form.first) {
            newErrors.first = "First name is required";
            valid = false;
        }

        if (!form.last) {
            newErrors.last = "Last name is required";
            valid = false;
        }

        if (!form.email) {
            newErrors.email = "Email is required";
            valid = false;
        }

        if (!form.password) {
            newErrors.password = "Password is required";
            valid = false;
        }

        if (form.password !== form.confirm) {
            newErrors.confirm = "Passwords do not match";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const register = async () => {
        if (!validate()) return;

        const { first, last, email, password } = form;
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const user = res.user;
            await setDoc(doc(db, "users", user.uid), {
                firstName: first,
                lastName: last,
                email,
            });

            await sendEmailVerification(user);
            toast.success("Verification email sent! Please check your inbox and verify your email address.", {
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
        } catch (err) {
            let errorMessage = "Registration failed.";
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Email address is already in use.';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Password should be at least 6 characters.';
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

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    return (
        <div className={styles.container}>
            <div className={styles.logoContainer}>
                <img src={logo} alt="Your Logo" className={styles.logo} />
            </div>
            <h2 className={styles.registerTitle}>Register</h2>
            <div className={styles.inputGroup}>
                <input
                    type="text"
                    name="first"
                    id="first"
                    placeholder=" "
                    value={form.first}
                    onChange={handleChange}
                    className={styles.input}
                />
                <label htmlFor="first" className={styles.label}>First Name</label>
                {errors.first && <p className={styles.error}>{errors.first}</p>}
            </div>
            <div className={styles.inputGroup}>
                <input
                    type="text"
                    name="last"
                    id="last"
                    placeholder=" "
                    value={form.last}
                    onChange={handleChange}
                    className={styles.input}
                />
                <label htmlFor="last" className={styles.label}>Last Name</label>
                {errors.last && <p className={styles.error}>{errors.last}</p>}
            </div>
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
            <div className={styles.inputGroup}>
                <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirm"
                    id="confirm"
                    placeholder=" "
                    value={form.confirm}
                    onChange={handleChange}
                    className={styles.input}
                />
                <label htmlFor="confirm" className={styles.label}>Confirm Password</label>
                <span className={styles.passwordToggle} onClick={toggleConfirmPasswordVisibility}>
                    {confirmPasswordVisible ? '👁️' : '👁️‍🗨️'}
                </span>
                {errors.confirm && <p className={styles.error}>{errors.confirm}</p>}
            </div>
            <button onClick={register} className={styles.registerButton}>
                Register
            </button>
            <div className={styles.loginLink}>
                Already have an account? <Link to="/login" className={styles.loginText}>Login</Link>
            </div>
        </div>
    );
};

export default RegisterPage;