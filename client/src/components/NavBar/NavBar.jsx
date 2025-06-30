import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const NavBar = () => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    return (
        <nav className="nav-container">
            <ul className="nav-list">
                <li className="nav-left">
                    <button className="btn-nav font-bold" onClick={() => navigate('/')}>App Logo</button>
                    <button className="btn-nav font-bold" onClick={() => navigate('/')}>Roomify</button>
                </li>
                {(
                    <li className="nav-right">
                        {!user ? (
                            <>
                                <button className="btn-nav font-medium" onClick={() => navigate('/login')}>Login</button>
                                <button className="btn-secondary font-medium" onClick={() => navigate('/create-account')}>Sign Up</button>
                            </>
                        ) : (
                            <>
                                <button className="btn-nav font-medium" onClick={() => navigate('/roommate-profile-form')}>Roomate Profile</button>
                                <button className="btn-nav font-medium" onClick={() => navigate('/current-user-profile')}>Profile</button>
                            </>
                        )}
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default NavBar;
