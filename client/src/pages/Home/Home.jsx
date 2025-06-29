import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';


const Home = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="home-container">
                <div className="welcome-banner">
                    <h1>Welcome to Roomify!</h1>
                    <h2 className="mt-4">Find your next roommate today!</h2>
                    <button className="btn-secondary" onClick={() => navigate("/create-account")}>Click here to sign up and get started!</button>
                </div>
                <button className="btn-secondary mt-4" onClick={() => navigate("/login")}>Login if you already have an account</button>
            </div>
        </>
    )
}

export default Home;
