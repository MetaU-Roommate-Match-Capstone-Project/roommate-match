import React from 'react';
import { Outlet } from 'react-router-dom';
import HomeNavBar from './components/HomeNavBar/HomeNavBar';
import Footer from './components/Footer/Footer';

const AppLayout = () => {
    return (
            <div>
                <HomeNavBar />
                <main>
                    <Outlet />
                </main>
                <Footer />
            </div>

    );
}

export default AppLayout;
