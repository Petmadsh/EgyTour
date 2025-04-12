import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";

const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const register = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Registration successful!");
        } catch (error) {
            alert(error.message);
        }
    };

    const login = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login successful!");
        } catch (error) {
            alert(error.message);
        }
    };

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            alert("Logged in with Google!");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="card">
            <h2>Login / Register</h2>
            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            /><br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            /><br />
            <button onClick={login}>Login</button>
            <button onClick={register}>Register</button>
            <hr />
            <button onClick={loginWithGoogle}>Sign in with Google</button>
        </div>
    );
};

export default Auth;
