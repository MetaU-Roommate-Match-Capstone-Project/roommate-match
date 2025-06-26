import React from 'react';
import { useState } from 'react';
import LoggedOutNavBar from '../../components/LoggedOutNavBar/LoggedOutNavBar';
import { useNavigate } from 'react-router-dom';
import './CreateAccount.css';

const CreateAccount = () => {
    const navigate = useNavigate();

    const [formState, setFormState] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        dobMonth: '',
        dobDay: '',
        dobYear: '',
        gender: '',
        internOrNewGrad: '',
        budgetMin: '',
        budgetMax: '',
        university: '',
        company: '',
        groupId: ''
    });

    const [step, setStep] = useState(1);
    const [passwordError, setPasswordError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createUser = async (userData) => {
        try {
            const response = await fetch('/api/users/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create account');
            }

            return data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    const updateFormField = (field, value) => {
        setFormState(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFirstStepSubmit = (e) => {
        e.preventDefault();

        if (formState.password !== formState.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setPasswordError('');
        setStep(2);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setIsSubmitting(true);

        // error messages for buttons not being selected because no required attribute for buttons
        if (!formState.gender) {
            setSubmitError('Please select a gender');
            setIsSubmitting(false);
            return;
        }

        if (!formState.internOrNewGrad) {
            setSubmitError('Please select a status');
            setIsSubmitting(false);
            return;
        }

        // validate budget range
        if (parseInt(formState.budgetMin) > parseInt(formState.budgetMax)) {
            setSubmitError('Budget minimum cannot be greater than maximum');
            setIsSubmitting(false);
            return;
        }


        try {
            const dobDate = new Date(
                parseInt(formState.dobYear),
                parseInt(formState.dobMonth) - 1,
                parseInt(formState.dobDay)
            );
            const dob = dobDate.toISOString();

            const userData = {
                name: formState.name,
                email: formState.email,
                password: formState.password,
                dob,
                gender: formState.gender,
                intern_or_new_grad: formState.internOrNewGrad,
                budget_min: parseInt(formState.budgetMin),
                budget_max: parseInt(formState.budgetMax),
                university: formState.university,
                company: formState.company
            };

            await createUser(userData);

            navigate("/login");

        } catch (error) {
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <LoggedOutNavBar/>
            <div className="create-account-container">
                <div className="create-account-form">
                    <h2>Create Account</h2>
                    {step === 1 ? (
                        <form onSubmit={handleFirstStepSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formState.email}
                                    onChange={(e) => updateFormField('email', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={formState.password}
                                    onChange={(e) => updateFormField('password', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={formState.confirmPassword}
                                    onChange={(e) => updateFormField('confirmPassword', e.target.value)}
                                    required
                                />
                            </div>

                            {passwordError && (
                                <div className="error-message">{passwordError}</div>
                            )}
                            <button type="submit" className="submit-button">Continue</button>
                        </form>
                    ) : (
                        <form onSubmit={handleFinalSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formState.name}
                                    onChange={(e) => updateFormField('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Date of Birth</label>
                                <div className="dob-container">
                                    <input
                                        type="text"
                                        placeholder="MM"
                                        maxLength="2"
                                        value={formState.dobMonth}
                                        onChange={(e) => updateFormField('dobMonth', e.target.value)}
                                        className="dob-input"
                                        required
                                    />
                                    <span className="dob-slash">/</span>
                                    <input
                                        type="text"
                                        placeholder="DD"
                                        maxLength="2"
                                        value={formState.dobDay}
                                        onChange={(e) => updateFormField('dobDay', e.target.value)}
                                        className="dob-input"
                                        required
                                    />
                                    <span className="dob-slash">/</span>
                                    <input
                                        type="text"
                                        placeholder="YYYY"
                                        maxLength="4"
                                        value={formState.dobYear}
                                        onChange={(e) => updateFormField('dobYear', e.target.value)}
                                        className="dob-input-year"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Gender</label>
                                <div className="button-group">
                                    <button
                                        type="button"
                                        className={`option-button ${formState.gender === 'female' ? 'selected' : ''}`}
                                        onClick={() => updateFormField('gender', 'female')}
                                    >
                                        Female
                                    </button>
                                    <button
                                        type="button"
                                        className={`option-button ${formState.gender === 'male' ? 'selected' : ''}`}
                                        onClick={() => updateFormField('gender', 'male')}
                                    >
                                        Male
                                    </button>
                                    <button
                                        type="button"
                                        className={`option-button ${formState.gender === 'non-binary' ? 'selected' : ''}`}
                                        onClick={() => updateFormField('gender', 'non-binary')}
                                    >
                                        Non-Binary
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <div className="button-group">
                                    <button
                                        type="button"
                                        className={`option-button ${formState.internOrNewGrad === 'intern' ? 'selected' : ''}`}
                                        onClick={() => updateFormField('internOrNewGrad', 'intern')}
                                    >
                                        Intern
                                    </button>
                                    <button
                                        type="button"
                                        className={`option-button ${formState.internOrNewGrad === 'new grad' ? 'selected' : ''}`}
                                        onClick={() => updateFormField('internOrNewGrad', 'new grad')}
                                    >
                                        New Grad
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="university">University</label>
                                <input
                                    type="text"
                                    id="university"
                                    value={formState.university}
                                    onChange={(e) => updateFormField('university', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="company">Company</label>
                                <input
                                    type="text"
                                    id="company"
                                    value={formState.company}
                                    onChange={(e) => updateFormField('company', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group budget-group">
                                <label>Budget Range</label>
                                <div className="budget-container">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={formState.budgetMin}
                                        onChange={(e) => updateFormField('budgetMin', e.target.value)}
                                        className="budget-input"
                                        required
                                    />
                                    <span className="budget-dash">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={formState.budgetMax}
                                        onChange={(e) => updateFormField('budgetMax', e.target.value)}
                                        className="budget-input"
                                        required
                                    />
                                </div>
                            </div>

                            {submitError && (
                                <div className="error-message">{submitError}</div>
                            )}

                            <div className="button-group">
                                <button
                                    type="button"
                                    className="back-button"
                                    onClick={() => setStep(1)}
                                    disabled={isSubmitting}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}

export default CreateAccount;
