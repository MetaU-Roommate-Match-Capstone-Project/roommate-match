import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

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
                                <button className="btn-nav font-medium" onClick={handleLogout}>Logout</button>
                            </>
                        )}
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default NavBar;
