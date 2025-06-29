import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import './App.css'

const AppLayout = () => {
    return (
        <div className="app-layout">
            <NavBar/>
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default AppLayout;
