import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import HomeNavBar from '../../components/HomeNavBar/HomeNavBar';

const Home = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="home-container">
                <HomeNavBar />
                <div className="welcome-banner">
                    <h1>Welcome to RoomMate!</h1>
                    <h2>Find your next roommate today!</h2>
                    <button className="hyperlink" onClick={() => navigate("/create-account")}>Click here to sign up and get started!</button>
                </div>
                <button className="hyperlink" onClick={() => navigate("/login")}>Login if you already have an account</button>
            </div>
        </>
    )
}

export default Home;
