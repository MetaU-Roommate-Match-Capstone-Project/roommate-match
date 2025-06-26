import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import './NavBar.css';

const NavBar = () => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    // this logout functionality is for testing purposes only
    // it will be replaced with a real logout functionality when I have my profile page and the user will have a proper logout button within the profile page
    const handleLogout = async () => {
        try {
            const response = await fetch(`/api/users/logout/${user.id}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                setUser(null);
                navigate('/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

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
                                <button onClick={handleLogout}>Logout</button>
                            </>
                        )}
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default NavBar;
