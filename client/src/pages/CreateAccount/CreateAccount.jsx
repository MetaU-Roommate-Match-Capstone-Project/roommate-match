import React from 'react';
import { useState } from 'react';
import LoggedOutNavBar from '../../components/LoggedOutNavBar/LoggedOutNavBar';
import './CreateAccount.css';

const CreateAccount = ({ onSubmit }) => {
    const [email, setEmail] = useState('');
    const [password,  setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [internOrNewGrad, setInternOrNewGrad] = useState('');
    const [budgetMin, setBudgetMin] = useState('');
    const [budgetMax, setBudgetMax] = useState('');
    const [university, setUniversity] = useState('');
    const [company, setCompany] = useState('');
    const [groupId, setGroupId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit ({email, password, confirmPassword, name, dob, gender, internOrNewGrad, budgetMin, budgetMax, university, company, groupId});
    }

    return (
        <>
            <LoggedOutNavBar/>
            <div className="create-account-container">
                <div className="create-account-form">
                    <h2>Create Account</h2>
                    <div className="form-flex-container">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </>
    )
}

export default CreateAccount;
