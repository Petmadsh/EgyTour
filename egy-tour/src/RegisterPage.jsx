import { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import styles from "./RegisterPage.module.css"; // Import CSS module
import logo from "./assets/Egyptian_Pyramids_with_Sphinx.png";
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
            await setDoc(doc(db, "users", res.user.uid), {
                firstName: first,
                lastName: last,
                email
            });
            alert("Registered! You can now log in.");
            navigate("/login");
        } catch (err) {
            alert(err.message);
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
                    placeholder="First Name"
                    value={form.first}
                    onChange={handleChange}
                    className={styles.input}
                />
                {errors.first && <p className={styles.error}>{errors.first}</p>}
            </div>
            <div className={styles.inputGroup}>
                <input
                    type="text"
                    name="last"
                    placeholder="Last Name"
                    value={form.last}
                    onChange={handleChange}
                    className={styles.input}
                />
                {errors.last && <p className={styles.error}>{errors.last}</p>}
            </div>
            <div className={styles.inputGroup}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className={styles.input}
                />
                {errors.email && <p className={styles.error}>{errors.email}</p>}
            </div>
            <div className={styles.inputGroup}>
                <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className={styles.input}
                />
                <span className={styles.passwordToggle} onClick={togglePasswordVisibility}>
                    {passwordVisible ? '👁️' : '👁️‍🗨️'}
                </span>
                {errors.password && <p className={styles.error}>{errors.password}</p>}
            </div>
            <div className={styles.inputGroup}>
                <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirm"
                    placeholder="Confirm Password"
                    value={form.confirm}
                    onChange={handleChange}
                    className={styles.input}
                />
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