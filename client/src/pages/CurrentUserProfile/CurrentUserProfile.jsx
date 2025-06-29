import React from 'react';
import { useUser } from '../../contexts/UserContext';
import WithAuth from '../../components/WithAuth/WithAuth';

const CurrentUserProfile = () => {
    const { user } = useUser();

    return (
        <>
            <h1>Current User Profile</h1>
        </>
    )

}

export default WithAuth(CurrentUserProfile);
