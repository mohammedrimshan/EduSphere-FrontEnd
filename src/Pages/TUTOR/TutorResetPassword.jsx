import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInterceptor from '@/axiosInstance';
import { toast, Toaster } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';  // Import Eye and EyeOff icons
import img from '@/assets/forget.webp'
const API_BASE_URL =  "https://edusphere-backend.rimshan.in/tutor";

const TutorResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [validToken, setValidToken] = useState(true);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    // Password validation regex and rules
    const passwordValidation = {
        required: true,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    };

    useEffect(() => {
        const verifyToken = async () => {
            try {
                await axiosInterceptor.get(`/tutor/verify-reset-token/${token}`);
                setValidToken(true);
            } catch (error) {
                setValidToken(false);
                toast.error('Invalid or expired reset token. Please request a new one.');
            }
        };

        verifyToken();
    }, [token]);

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);

        if (value.length < passwordValidation.minLength) {
            setPasswordError(`Password must be at least ${passwordValidation.minLength} characters.`);
        } else if (!new RegExp(passwordValidation.pattern).test(value)) {
            setPasswordError('Password must contain at least one uppercase letter, one number, and one special character.');
        } else {
            setPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);

        if (value !== newPassword) {
            setConfirmPasswordError('Passwords do not match.');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        if (passwordError || confirmPasswordError) {
            toast.error('Please fix the errors before submitting.');
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInterceptor.post(`/tutor/tutorreset-password`, { token, newPassword });
            toast.success(response.data.message);
            setTimeout(() => {
                navigate('/tutor/tutor-login');
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password reset failed.');
        } finally {
            setLoading(false);
        }
    };

    // Toggle password visibility
    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    if (!validToken) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-4 text-center">Invalid Token</h2>
                    <p className="text-gray-600 text-center">
                        The password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <button
                        onClick={() => navigate('/tutor/tutor-forgetpassword')}
                        className="mt-6 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
                    >
                        Request New Reset Link
                    </button>
                </div>
            </div>
        );
    }

    return (
     <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <Toaster position="top-left" richColors />
            <div className="flex w-full max-w-4xl mx-4 bg-white rounded-lg shadow-md overflow-hidden">
                {/* Left side image */}
                <div className="hidden md:block w-1/2 bg-green-50">
                    <img
                        src={img}
                        alt="Reset Password"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right side form */}
                <div className="w-full md:w-1/2 p-8 ">
                    <h2 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    id="new-password"
                                    value={newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={passwordValidation.minLength}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {passwordError && (
                                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                            )}
                        </div>

                        <div className="relative">
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirm-password"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    required
                                    minLength={passwordValidation.minLength}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {confirmPasswordError && (
                                <p className="text-sm text-red-500 mt-1">{confirmPasswordError}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || passwordError || confirmPasswordError}
                            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-green-300"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TutorResetPassword;
