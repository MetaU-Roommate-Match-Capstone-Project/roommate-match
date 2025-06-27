import React from 'react';
import { useState } from 'react';
import WithAuth from '../../components/WithAuth/WithAuth';
import './RoommateProfileForm.css';
import { useUser } from '../../contexts/UserContext';


const RoommateProfileForm = () => {
    const { user } = useUser();

    const [formState, setFormState] = useState({
        id: user.id,
        city: '',
        state: '',
        cleanliness: '',
        smokes: '',
        pets: '',
        genderPreference: '',
        roomType: '',
        numRoommates: '',
        leaseDuration: '',
        moveInMonth: '',
        moveInDay: '',
        moveInYear: '',
        sleepSchedule: '',
        noiseTolerance: '',
        socialness: '',
        hobbies: '',
        favoriteMusic: '',
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

            const userData = {
                id: formState.id,
                city: formState.city,
                state: formState.state,
                cleanliness: formState.cleanliness,
                smokes: formState.smokes,
                pets: formState.pets,
                genderPreference: formState.genderPreference,
                roomType: formState.roomType,
                numRoommates: parseInt(formState.numRoommates),
                leaseDuration: parseInt(formState.leaseDuration),
                moveInDate: moveIn,
                sleepSchedule: formState.sleepSchedule,
                noiseTolerance: formState.noiseTolerance,
                socialness: formState.socialness,
                hobbies: formState.hobbies,
                favoriteMusic: formState.favoriteMusic,
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
                                    className={`option-button ${formState.genderPreference === 'NO_PREFERENCE' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('genderPreference', 'NO_PREFERENCE')}
                                >
                                    No Preference
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.genderPreference === 'MALE' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('genderPreference', 'MALE')}
                                >
                                    Male
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.genderPreference === 'FEMALE' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('genderPreference', 'FEMALE')}
                                >
                                    Female
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.genderPreference === 'NONBINARY' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('genderPreference', 'NONBINARY')}
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
                                    className={`option-button ${formState.roomType === 'PRIVATE_ROOM_IN_APARTMENT' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('roomType', 'PRIVATE_ROOM_IN_APARTMENT')}
                                >
                                    Private room in an apartment
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.roomType === 'SHARED_ROOM' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('roomType', 'SHARED_ROOM')}
                                >
                                    Shared room
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.roomType === 'PRIVATE_ROOM_IN_HOUSE' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('roomType', 'PRIVATE_ROOM_IN_HOUSE')}
                                >
                                    Private room in a house
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="numRoommates">How many roommates are you looking for?</label>
                            <input
                                type="text"
                                id="numRoommates"
                                value={formState.numRoommates}
                                onChange={(e) => updateFormField('numRoommates', e.target.value)}
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
                            <label htmlFor="leaseDuration">How many months will you want to lease for?</label>
                            <input
                                type="text"
                                id="leaseDuration"
                                value={formState.leaseDuration}
                                onChange={(e) => updateFormField('leaseDuration', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>What is your sleep schedule like?</label>
                            <div className="button-group">
                                <button
                                    type="button"
                                    className={`option-button ${formState.sleepSchedule === 'NO_PREFERENCE' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('sleepSchedule', 'NO_PREFERENCE')}
                                >
                                    No Preference
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.sleepSchedule === 'EARLY_RISER' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('sleepSchedule', 'EARLY_RISER')}
                                >
                                    Early riser
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.sleepSchedule === 'LATE_SLEEPER' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('sleepSchedule', 'LATE_SLEEPER')}
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
                                    className={`option-button ${formState.noiseTolerance === 'QUIET' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('noiseTolerance', 'QUIET')}
                                >
                                    Quiet
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.noiseTolerance === 'SOMEWHAT_QUIET' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('noiseTolerance', 'SOMEWHAT_QUIET')}
                                >
                                    Somewhat Quiet
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.noiseTolerance === 'SOMEWHAT_NOISY' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('noiseTolerance', 'SOMEWHAT_NOISY')}
                                >
                                    Somewhat Noisy
                                </button>
                                <button
                                    type="button"
                                    className={`option-button ${formState.noiseTolerance === 'NOISY' ? 'selected' : ''}`}
                                    onClick={() => updateFormField('noiseTolerance', 'NOISY')}
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
                            <label htmlFor="favoriteMusic">What is your favorite music genre?</label>
                            <input
                                type="text"
                                id="favoriteMusic"
                                value={formState.favoriteMusic}
                                onChange={(e) => updateFormField('favoriteMusic', e.target.value)}
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
