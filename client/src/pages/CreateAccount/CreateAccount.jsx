import React from 'react';
import { useState } from 'react';
import LoggedOutNavBar from '../../components/LoggedOutNavBar/LoggedOutNavBar';
import { useNavigate } from 'react-router-dom';
import './CreateAccount.css';

const CreateAccount = ({ onSubmit }) => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [dobMonth, setDobMonth] = useState('');
    const [dobDay, setDobDay] = useState('');
    const [dobYear, setDobYear] = useState('');
    const [gender, setGender] = useState('');
    const [internOrNewGrad, setInternOrNewGrad] = useState('');
    const [budgetMin, setBudgetMin] = useState('');
    const [budgetMax, setBudgetMax] = useState('');
    const [university, setUniversity] = useState('');
    const [company, setCompany] = useState('');
    const [groupId] = useState('');
    const [step, setStep] = useState(1);
    const [passwordError, setPasswordError] = useState('');

    const handleFirstStepSubmit = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setPasswordError('');
        setStep(2);
    };

    const handleFinalSubmit = (e) => {
        e.preventDefault();
        const dob = `${dobMonth}/${dobDay}/${dobYear}`;
        onSubmit({
            email, password, confirmPassword, name, dob, gender,
            internOrNewGrad, budgetMin, budgetMax, university, company, groupId
        });
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
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
                                        value={dobMonth}
                                        onChange={(e) => setDobMonth(e.target.value)}
                                        className="dob-input"
                                        required
                                    />
                                    <span className="dob-slash">/</span>
                                    <input
                                        type="text"
                                        placeholder="DD"
                                        maxLength="2"
                                        value={dobDay}
                                        onChange={(e) => setDobDay(e.target.value)}
                                        className="dob-input"
                                        required
                                    />
                                    <span className="dob-slash">/</span>
                                    <input
                                        type="text"
                                        placeholder="YYYY"
                                        maxLength="4"
                                        value={dobYear}
                                        onChange={(e) => setDobYear(e.target.value)}
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
                                        className={`option-button ${gender === 'female' ? 'selected' : ''}`}
                                        onClick={() => setGender('female')}
                                    >
                                        Female
                                    </button>
                                    <button
                                        type="button"
                                        className={`option-button ${gender === 'male' ? 'selected' : ''}`}
                                        onClick={() => setGender('male')}
                                    >
                                        Male
                                    </button>
                                    <button
                                        type="button"
                                        className={`option-button ${gender === 'non-binary' ? 'selected' : ''}`}
                                        onClick={() => setGender('non-binary')}
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
                                        className={`option-button ${internOrNewGrad === 'intern' ? 'selected' : ''}`}
                                        onClick={() => setInternOrNewGrad('intern')}
                                    >
                                        Intern
                                    </button>
                                    <button
                                        type="button"
                                        className={`option-button ${internOrNewGrad === 'new grad' ? 'selected' : ''}`}
                                        onClick={() => setInternOrNewGrad('new grad')}
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
                                    value={university}
                                    onChange={(e) => setUniversity(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="company">Company</label>
                                <input
                                    type="text"
                                    id="company"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group budget-group">
                                <label>Budget Range</label>
                                <div className="budget-container">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={budgetMin}
                                        onChange={(e) => setBudgetMin(e.target.value)}
                                        className="budget-input"
                                        required
                                    />
                                    <span className="budget-dash">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={budgetMax}
                                        onChange={(e) => setBudgetMax(e.target.value)}
                                        className="budget-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="button-group">
                                <button
                                    type="button"
                                    className="back-button"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>
                                <button type="submit" className="submit-button" onClick={() => navigate("/login")}>Create Account</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}

export default CreateAccount;
