import React from 'react';
import { useUser } from '../../contexts/UserContext';
import WithAuth from '../../components/WithAuth/WithAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cleanlinessMap, petsMap, roomTypesMap, sleepScheduleMap, noiseToleranceMap, socialnessMap } from '../../utils/enums.jsx';

const CurrentUserProfile = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [roommateProfile, setRoommateProfile] = useState(null);
    const [error, setError] = useState('');

    // fetch user profile data from backend
    const fetchCurrentUserProfile = async () => {
        try {
            setError('');
            const response = await fetch('/api/roommate-profile/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            // if user has not created a profile yet, redirect to /roommate-profile-form after 10 seconds
            if (response.status === 404) {
                setError('No profile created yet, please create one in the roommate profile tab to view your profile!');
                setTimeout(() => {
                    navigate('/roommate-profile-form');
                }, 10000);
                return;
            }

            if (!response.ok) {
                const errorInfo = await response.json();
                throw new Error(errorInfo.error || 'Failed to fetch user profile');
            }

            const currentUserProfile = await response.json();
            setRoommateProfile(currentUserProfile);

        } catch (error) {
            console.error('Error fetching currently signed in user profile: ', error);
            setError(error.message);
        }
    }

    useEffect(() => {
        if (!user) {
            return;
        }
        fetchCurrentUserProfile();
    }, [user])

    // render error message if user has not created a profile yet
    if (error) {
        return (
            <div className="profile-container">
                <div className="profile-card">
                    <h2>Your Profile</h2>
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    // loading message while user profile is being fetched
    if (!roommateProfile) {
        return (
            <div className="profile-container">
                <div className="profile-card">
                    <h2>Loading your profile...</h2>
                </div>
            </div>
        );
    }

    let userCleanliness = cleanlinessMap[roommateProfile.cleanliness];
    let userPets = petsMap[roommateProfile.pets];
    let userRoomType = roomTypesMap[roommateProfile.room_type];
    let numRoommates = roommateProfile.num_roommates;
    let leaseDuration = roommateProfile.lease_duration;
    let moveInDate = new Date(roommateProfile.move_in_date).toLocaleDateString();
    let userSleepSchedule = sleepScheduleMap[roommateProfile.sleep_schedule];
    let userNoiseTolerance = noiseToleranceMap[roommateProfile.noise_tolerance];
    let userSocialness = socialnessMap[roommateProfile.socialness];
    let favoriteMusic = roommateProfile.favorite_music;

    // render user profile if user already logged in + created one in /roommate-profile-form
    return (
        <>
            <div className="profile-container">
                <div className="profile-card">
                    <h2>{roommateProfile.user.name}'s Profile</h2>
                        <div className="profile-details">
                            <p><strong>Location: </strong> {roommateProfile.city}, {roommateProfile.state}</p>
                            <p><strong>Cleanliness: </strong> {userCleanliness}</p>
                            <p><strong>Smokes: </strong>{roommateProfile.smoke ? 'Yes' : 'No'}</p>
                            <p><strong>Pets: </strong> {userPets}</p>
                            <p><strong>Room Type: </strong> {userRoomType}</p>
                            <p><strong>Number of Roommates I am looking for: </strong> {numRoommates}</p>
                            <p><strong>Move In Date: </strong> {moveInDate}</p>
                            <p><strong>Lease Duration: </strong>{leaseDuration}</p>
                            <p><strong>Sleep Schedule: </strong> {userSleepSchedule}</p>
                            <p><strong>Noise Tolerance: </strong> {userNoiseTolerance}</p>
                            <p><strong>Socialness: </strong> {userSocialness}</p>
                            <p><strong>Hobbies: </strong>{roommateProfile.hobbies}</p>
                            <p><strong>Favorite Music: </strong>{favoriteMusic}</p>
                            <p><strong>Bio: </strong>{roommateProfile.bio}</p>
                        </div>
                </div>
            </div>
        </>
    )
}

export default WithAuth(CurrentUserProfile);
