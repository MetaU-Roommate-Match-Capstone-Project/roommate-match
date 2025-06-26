import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import './NavBar.css';

const NavBar = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    return (
        <nav className="nav-bar">
            <ul>
                <li className="left-nav-bar-buttons">
                    <button onClick={() => navigate('/')}> App Logo</button>
                    <button onClick={() => navigate('/')}> App Title</button>
                </li>
                {(
                    <li className="right-nav-bar-buttons">
                        {!user ? (
                            <>
                                <button onClick={() => navigate('/login')}>Login</button>
                                <button id="create-account-button" onClick={() => navigate('/create-account')}>Sign Up</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => navigate('/profile')}>Profile</button>
                            </>
                        )}
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default NavBar;
