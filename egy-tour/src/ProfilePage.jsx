// ProfilePage.js
import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendEmailVerification, updateEmail, updatePassword, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
    const [userData, setUserData] = useState({ email: '', firstName: '', lastName: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ email: '', firstName: '', lastName: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmNewPassword: '' });
    const [passwordErrors, setPasswordErrors] = useState({ newPassword: '', confirmNewPassword: '' });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = auth.currentUser;
    const activeToastId = useRef(null);

    const ConfirmationToast = ({ message, onConfirm, closeToast }) => {
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
            <div className={styles.confirmationToast} ref={confirmationRef}>
                <p>{message}</p>
                <div className={styles.confirmationButtons}>
                    <button onClick={() => { onConfirm(); closeToast(); }} className={styles.confirmButton}>
                        Yes
                    </button>
                    <button onClick={closeToast} className={styles.cancelButton}>
                        No
                    </button>
                </div>
            </div>
        );
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                try {
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                        setEditForm(docSnap.data());
                    } else {
                        toast.error('Could not retrieve profile data.', { position: 'top-right' });
                    }
                } catch (error) {
                    toast.error('Error fetching profile data.', { position: 'top-right' });
                } finally {
                    setLoading(false);
                }
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleEditClick = () => setIsEditing(true);

    const handleInputChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!user) {
            toast.error('No user logged in.', { position: 'top-right' });
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const updates = {};

        if (editForm.firstName !== userData.firstName) updates.firstName = editForm.firstName;
        if (editForm.lastName !== userData.lastName) updates.lastName = editForm.lastName;

        if (editForm.email !== userData.email) {
            if (activeToastId.current) toast.dismiss(activeToastId.current);

            activeToastId.current = toast(
                <ConfirmationToast
                    message="Are you sure you want to change your email? You will need to verify the new email address and will be logged out."
                    onConfirm={async () => {
                        try {
                            await updateEmail(user, editForm.email);
                            await sendEmailVerification(user);
                            toast.success(
                                'Email updated! Please verify your new email address and log in again.',
                                { position: 'top-right', onClose: () => navigate('/login') }
                            );
                        } catch (error) {
                            let errorMessage = 'Failed to update email.';
                            if (error.code === 'auth/invalid-email') {
                                errorMessage = 'Invalid email address.';
                            } else if (error.code === 'auth/email-already-in-use') {
                                errorMessage = 'This email address is already in use.';
                            } else if (error.code === 'auth/requires-recent-login') {
                                errorMessage = 'For security reasons, you need to log in again before changing your email.';
                                toast.error(errorMessage, { position: 'top-right', onClose: () => navigate('/login') });
                                return;
                            }
                            toast.error(errorMessage, { position: 'top-right' });
                        } finally {
                            activeToastId.current = null;
                        }
                    }}
                    closeToast={() => toast.dismiss(activeToastId.current)}
                />,
                {
                    position: 'top-center',
                    closeOnClick: false,
                    draggable: false,
                    closeButton: false,
                    autoClose: false,
                    hideProgressBar: true,
                    className: styles.confirmationToastContainer,
                    onClose: () => { activeToastId.current = null; }
                }
            );
            return;
        }

        if (Object.keys(updates).length > 0) {
            try {
                await updateDoc(userDocRef, updates);
                setUserData({ ...userData, ...updates });
                setEditForm({ ...editForm, ...updates });
                setIsEditing(false);
                toast.success('Profile updated successfully!', { position: 'top-right' });
            } catch (error) {
                toast.error('Failed to update profile.', { position: 'top-right' });
            }
        } else {
            setIsEditing(false);
        }
    };

    const handlePasswordChangeClick = () => setIsChangingPassword(true);

    const handlePasswordInputChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const validatePasswordChange = () => {
        let isValid = true;
        const newErrors = { newPassword: '', confirmNewPassword: '' };

        if (!passwordForm.newPassword) {
            newErrors.newPassword = 'New password is required.';
            isValid = false;
        } else if (passwordForm.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters long.';
            isValid = false;
        }

        if (!passwordForm.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Confirm new password is required.';
            isValid = false;
        } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Passwords do not match.';
            isValid = false;
        }

        setPasswordErrors(newErrors);
        return isValid;
    };

    const performPasswordUpdate = async () => {
        if (!user) {
            toast.error('No user logged in.', { position: 'top-right' });
            return;
        }

        try {
            await updatePassword(user, passwordForm.newPassword);
            toast.success(
                'Password updated! Please log in again.',
                {
                    position: 'top-right',
                    onClose: () => navigate('/login')
                }
            );
            setIsChangingPassword(false);
            setPasswordForm({ newPassword: '', confirmNewPassword: '' });
            setPasswordErrors({ newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            let errorMessage = 'Failed to update password.';
            if (error.code === 'auth/weak-password') {
                errorMessage = 'Password should be at least 6 characters.';
            } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'For security reasons, you need to log in again before changing your password.';
                toast.error(errorMessage, { position: 'top-right', onClose: () => navigate('/login') });
                return;
            }
            toast.error(errorMessage, { position: 'top-right' });
        }
    };


    const handlePasswordSubmit = () => {
        if (!validatePasswordChange()) return;

        if (activeToastId.current) toast.dismiss(activeToastId.current);

        activeToastId.current = toast(
            <ConfirmationToast
                message="Are you sure you want to change your password?"
                onConfirm={performPasswordUpdate}
                closeToast={() => toast.dismiss(activeToastId.current)}
            />,
            {
                position: 'top-center',
                closeOnClick: false,
                draggable: false,
                closeButton: false,
                autoClose: false,
                hideProgressBar: true,
                className: styles.confirmationToastContainer,
                onClose: () => { activeToastId.current = null; }
            }
        );
    };

    if (loading) return <div className={styles.loading}>Loading profile data...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Your Profile</h1>
            {isEditing ? (
                <div className={styles.formContainer}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="firstName" className={styles.label}>First Name:</label>
                        <input type="text" id="firstName" name="firstName" value={editForm.firstName} onChange={handleInputChange} className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="lastName" className={styles.label}>Last Name:</label>
                        <input type="text" id="lastName" name="lastName" value={editForm.lastName} onChange={handleInputChange} className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email:</label>
                        <input type="email" id="email" name="email" value={editForm.email} onChange={handleInputChange} className={styles.input} />
                    </div>
                    <div className={styles.buttonGroup}>
                        <button onClick={handleSubmit} className={styles.submitButton}>Save Changes</button>
                        <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>Cancel</button>
                    </div>
                </div>
            ) : isChangingPassword ? (
                <div className={styles.formContainer}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="newPassword" className={styles.label}>New Password:</label>
                        <input type="password" id="newPassword" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordInputChange} className={styles.input} />
                        {passwordErrors.newPassword && <p className={styles.error}>{passwordErrors.newPassword}</p>}
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmNewPassword" className={styles.label}>Confirm New Password:</label>
                        <input type="password" id="confirmNewPassword" name="confirmNewPassword" value={passwordForm.confirmNewPassword} onChange={handlePasswordInputChange} className={styles.input} />
                        {passwordErrors.confirmNewPassword && <p className={styles.error}>{passwordErrors.confirmNewPassword}</p>}
                    </div>
                    <div className={styles.buttonGroup}>
                        <button onClick={handlePasswordSubmit} className={styles.submitButton}>Change Password</button>
                        <button onClick={() => setIsChangingPassword(false)} className={styles.cancelButton}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className={styles.profileInfo}>
                    <p><strong className={styles.infoLabel}>Email:</strong> {userData.email}</p>
                    <p><strong className={styles.infoLabel}>First Name:</strong> {userData.firstName}</p>
                    <p><strong className={styles.infoLabel}>Last Name:</strong> {userData.lastName}</p>
                    <div className={styles.buttonGroup}>
                        <button onClick={handleEditClick} className={styles.editButton}>Edit Profile</button>
                        <button onClick={handlePasswordChangeClick} className={styles.changePasswordButton}>Change Password</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
