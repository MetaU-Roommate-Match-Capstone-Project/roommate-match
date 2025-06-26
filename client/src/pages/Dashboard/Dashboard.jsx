import React from 'react';
import { useUser } from '../../contexts/UserContext';

const Dashboard = () => {
    const { user } = useUser();

    if (!user) {
        console.log('No user found');
        return;
    }

    return (
        console.log('User found', user)
    )
}

export default Dashboard;
