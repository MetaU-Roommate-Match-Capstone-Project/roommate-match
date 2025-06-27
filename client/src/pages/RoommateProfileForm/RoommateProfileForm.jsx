import React from 'react';
import { useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import WithAuth from '../../components/WithAuth/WithAuth';
import './RoommateProfileForm.css';
import { useUser } from '../../contexts/UserContext';


const RoommateProfileForm = () => {
    const { user } = useUser();

    if (!user) {
        console.log('No user found for roommate profile form');
        return;
    }

    if (user) {
        console.log(user.id);
    }
    //const navigate = useNavigate();
    const [formState, setFormState] = useState({
        id: user.id,
        city: '',
        state: '',
        cleanliness: '',
        smokes: '',
        pets: '',
        gender_preference: '',
        room_type: '',
        num_roommates: '',
        lease_duration: '',
        moveInMonth: '',
        moveInDay: '',
        moveInYear: '',
        sleep_schedule: '',
        noise_tolerance: '',
        socialness: '',
        hobbies: '',
        favorite_music: '',
        bio: ''
    });

    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createRoommateProfile = async (userData) => {
        try {
            const response = await fetch('/api/roommate-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    credentials: "include"
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save roommate profile preferences');
            }
            return data;
        } catch (error) {
            console.error('Error creating roommate profile');
            throw error;
        }
    }

    const updateFormField = (field, value) => {
        setFormState(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setIsSubmitting(true);

        // input validation error messages here

        try {
            const moveInDate = new Date(
                parseInt(formState.moveInYear),
                parseInt(formState.moveInMonth) - 1,
                parseInt(formState.moveInDay)
            );
            const moveIn = moveInDate.toISOString();
            console.log(moveIn);

            console.log('formstate', formState.id);
            const userData = {
                id: formState.id,
                city: formState.city,
                state: formState.state,
                cleanliness: formState.cleanliness,
                smokes: formState.smokes,
                pets: formState.pets,
                gender_preference: formState.gender_preference,
                room_type: formState.room_type,
                num_roommates: parseInt(formState.num_roommates),
                lease_duration: parseInt(formState.lease_duration),
                move_in_date: moveIn,
                sleep_schedule: formState.sleep_schedule,
                noise_tolerance: formState.noise_tolerance,
                socialness: formState.socialness,
                hobbies: formState.hobbies,
                favorite_music: formState.favorite_music,
                bio: formState.bio
            };

            await createRoommateProfile(userData);

        } catch (error) {
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <>
        <div className="roommate-profile-container">
            <div className="roommate-profile-form">
                <h2>Build your roommate profile</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="city">City where you are looking to lease:</label>
                            <input
                                type="city"
                                id="city"
                                value={formState.city}
                                onChange={(e) => updateFormField('city', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="state">State</label>
                            <input
                                type="state"
                                id="state"
                                value={formState.state}
                                onChange={(e) => updateFormField('state', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Cleanliness</label>
                            <div className="button-group">
                                <button
                                    type="button"
                                    className={`option-button ${formState.cleanliness === 'VERY_DIRTY' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('cleanliness', 'VERY_DIRTY')}
                                >
                                    Very Dirty
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.cleanliness === 'DIRTY' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('cleanliness', 'DIRTY')}
                                >
                                    Dirty
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.cleanliness === 'MEDIUM' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('cleanliness', 'MEDIUM')}
                                >
                                    Medium
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.cleanliness === 'CLEAN' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('cleanliness', 'CLEAN')}
                                >
                                    Clean
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.cleanliness === 'VERY_CLEAN' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('cleanliness', 'VERY_CLEAN')}
                                >
                                    Very Clean
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Smokes</label>
                            <div className="button-group">
                                <button
                                    type="button"
                                    className={`option-button ${formState.smokes === true ? 'selected' : true}`}
                                    onClick={() => updateFormField('smokes', true)}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.smokes === false ? 'selected' : false}`}
                                    onClick={() => updateFormField('smokes', false)}
                                >
                                    No
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>What pets are you comfortable with, if any?</label>
                            <div className="button-group">
                                <button
                                    type="button"
                                    className={`option-button ${formState.pets === 'NO_PETS' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('pets', 'NO_PETS')}
                                >
                                    No Pets
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.pets === 'CATS_ONLY' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('pets', 'CATS_ONLY')}
                                >
                                    Cats Only
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.pets === 'DOGS_ONLY' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('pets', 'DOGS_ONLY')}
                                >
                                    Dogs Only
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.pets === 'CATS_AND_DOGS' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('pets', 'CATS_AND_DOGS')}
                                >
                                    Cats and Dogs
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.pets === 'OKAY_WITH_ANY_PET' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('pets', 'OKAY_WITH_ANY_PET')}
                                >
                                    Okay with any pet
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>What is your gender preference for a roommate?</label>
                            <div className="button-group">
                                <button
                                    type="button"
                                    className={`option-button ${formState.gender_preference === 'NO_PREFERENCE' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('gender_preference', 'NO_PREFERENCE')}
                                >
                                    No Preference
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.gender_preference === 'MALE' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('gender_preference', 'MALE')}
                                >
                                    Male
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.gender_preference === 'FEMALE' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('gender_preference', 'FEMALE')}
                                >
                                    Female
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.gender_preference === 'NONBINARY' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('gender_preference', 'NONBINARY')}
                                >
                                    Non-binary
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>What type of lease are you looking for?</label>
                            <div className="button-group">
                                <button
                                    type="button"
                                    className={`option-button ${formState.room_type === 'PRIVATE_ROOM_IN_APARTMENT' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('room_type', 'PRIVATE_ROOM_IN_APARTMENT')}
                                >
                                    Private room in an apartment
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.room_type === 'SHARED_ROOM' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('room_type', 'SHARED_ROOM')}
                                >
                                    Shared room
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.room_type === 'PRIVATE_ROOM_IN_HOUSE' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('room_type', 'PRIVATE_ROOM_IN_HOUSE')}
                                >
                                    Private room in a house
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="num_roommates">How many roommates are you looking for?</label>
                            <input
                                type="text"
                                id="num_roommates"
                                value={formState.num_roommates}
                                onChange={(e) => updateFormField('num_roommates', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Move in Date</label>
                            <div className="move-in-date-container">
                                <input
                                    type="text"
                                    placeholder="MM"
                                    maxLength="2"
                                    value={formState.moveInMonth}
                                    onChange={(e) => updateFormField('moveInMonth', e.target.value)}
                                    className="move-in-input"
                                    required
                                />
                                <span className="move-in-slash">/</span>
                                <input
                                    type="text"
                                    placeholder="DD"
                                    maxLength="2"
                                    value={formState.moveInDay}
                                    onChange={(e) => updateFormField('moveInDay', e.target.value)}
                                    className="move-in-input"
                                    required
                                />
                                <span className="move-in-slash">/</span>
                                <input
                                    type="text"
                                    placeholder="YYYY"
                                    maxLength="4"
                                    value={formState.moveInYear}
                                    onChange={(e) => updateFormField('moveInYear', e.target.value)}
                                    className="move-in-input-year"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="lease_duration">How many months will you want to lease for?</label>
                            <input
                                type="text"
                                id="lease_duration"
                                value={formState.lease_duration}
                                onChange={(e) => updateFormField('lease_duration', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>What is your sleep schedule like?</label>
                            <div className="button-group">
                                <button
                                    type="button"
                                    className={`option-button ${formState.sleep_schedule === 'NO_PREFERENCE' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('sleep_schedule', 'NO_PREFERENCE')}
                                >
                                    No Preference
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.sleep_schedule === 'EARLY_RISER' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('sleep_schedule', 'EARLY_RISER')}
                                >
                                    Early riser
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.sleep_schedule === 'LATE_SLEEPER' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('sleep_schedule', 'LATE_SLEEPER')}
                                >
                                    Late sleeper
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>What is your noise tolerance?</label>
                            <div className="button-group">
                                <button
                                    type="button"
                                    className={`option-button ${formState.noise_tolerance === 'QUIET' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('noise_tolerance', 'QUIET')}
                                >
                                    Quiet
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.noise_tolerance === 'SOMEWHAT_QUIET' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('noise_tolerance', 'SOMEWHAT_QUIET')}
                                >
                                    Somewhat Quiet
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.noise_tolerance === 'SOMEWHAT_NOISY' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('noise_tolerance', 'SOMEWHAT_NOISY')}
                                >
                                    Somewhat Noisy
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.noise_tolerance === 'NOISY' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('noise_tolerance', 'NOISY')}
                                >
                                    Noisy
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>How social are you?</label>
                            <div className="button-group">
                                <button
                                    type="button"
                                    className={`option-button ${formState.socialness === 'LONER' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('socialness', 'LONER')}
                                >
                                    Loner
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.socialness === 'SOMEWHAT_SOCIAL' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('socialness', 'SOMEWHAT_SOCIAL')}
                                >
                                    Somewhat Social
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.socialness === 'SOCIAL' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('socialness', 'SOCIAL')}
                                >
                                    Social
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.socialness === 'VERY_SOCIAL' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('socialness', 'VERY_SOCIAL')}
                                >
                                    Very Social
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="hobbies">What are some of your hobbies?</label>
                            <input
                                type="text"
                                id="hobbies"
                                value={formState.hobbies}
                                onChange={(e) => updateFormField('hobbies', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="favorite_music">What is your favorite music genre?</label>
                            <input
                                type="text"
                                id="favorite_music"
                                value={formState.favorite_music}
                                onChange={(e) => updateFormField('favorite_music', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bio">Write a short bio about yourself:</label>
                            <input
                                type="text"
                                id="bio"
                                value={formState.bio}
                                onChange={(e) => updateFormField('bio', e.target.value)}
                                required
                            />
                        </div>


                        {submitError && (
                            <div className="error-message">{submitError}</div>
                        )}

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving roommate profile preferences' : 'Save roommate profile preferences'}
                        </button>
                    </form>
            </div>
        </div>
    </>

    )
}

export default WithAuth(RoommateProfileForm);
//export default RoommateProfileForm;
