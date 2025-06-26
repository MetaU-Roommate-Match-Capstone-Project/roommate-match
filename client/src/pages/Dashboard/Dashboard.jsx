import React from 'react';
import { useUser } from '../../contexts/UserContext';

const Dashboard = () => {
    const { user } = useUser();

    if (!user) {
        return;
    }

    return;
}

export default Dashboard;
