import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import { useUser } from './contexts/UserContext';
import './App.css'


const AppLayout = () => {
    return (
        <>
            <NavBar/>
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}

export default AppLayout;
