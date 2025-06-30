import React from 'react';
import { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [submitError, setSubmitError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setUser } = useUser();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const loginUser = async (userData) => {
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to login user');
            }

            setUser(data);

            return data;
        } catch (error) {
            console.error('Error logging in user:', error);
            throw error;
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);

        try {
            const userData = {
                email: formData.email,
                password: formData.password
            }

            await loginUser(userData);

            navigate('/dashboard');

        } catch (error) {
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
        <div className="form-container">
                <div className="form-card">
                    <h2>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email</label>
                            <input
                                className="form-input"
                                type="text"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <input
                                className="form-input"
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {submitError && (
                            <div className="error-message">{submitError}</div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Login;
