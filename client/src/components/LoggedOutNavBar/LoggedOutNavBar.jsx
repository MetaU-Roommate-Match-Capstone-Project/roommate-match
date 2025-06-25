import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoggedOutNavBar.css';

const LoggedOutNavBar = () => {
    const navigate = useNavigate();
    return (
        <>
            <nav className="nav-bar">
                <ul>
                    <li className="left-nav-bar-buttons">
                        <button onClick={() => navigate('/')}> App Logo</button>
                        <button onClick={() => navigate('/')}> App Title</button>
                    </li>
                </ul>
            </nav>
        </>
    )

}

export default LoggedOutNavBar;
