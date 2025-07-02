import React from "react";
import {
  cleanlinessMap,
  petsMap,
  roomTypesMap,
  sleepScheduleMap,
  noiseToleranceMap,
  socialnessMap,
} from "../../utils/enums.jsx";

const ProfileModal = ({ userProfile, onClose }) => {
  if (!userProfile) {
    return null;
  }

  let userCleanliness = cleanlinessMap[userProfile.cleanliness];
  let userPets = petsMap[userProfile.pets];
  let userRoomType = roomTypesMap[userProfile.room_type];
  let numRoommates = userProfile.num_roommates;
  let leaseDuration = userProfile.lease_duration;
  let moveInDate = new Date(userProfile.move_in_date).toLocaleDateString();
  let userSleepSchedule = sleepScheduleMap[userProfile.sleep_schedule];
  let userNoiseTolerance = noiseToleranceMap[userProfile.noise_tolerance];
  let userSocialness = socialnessMap[userProfile.socialness];
  let favoriteMusic = userProfile.favorite_music;
  let status = userProfile.user.intern_or_new_grad;
  let budget = userProfile.user.budget_max;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <span className="x-btn" onClick={onClose}>
            &times;
          </span>
          <div className="modal">
            <div className="profile-container">
              <div className="profile-card">
                <h2>{userProfile.user?.name}</h2>
                <div className="profile-details">
                  <p>
                    <strong>Location: </strong> {userProfile.city},{" "}
                    {userProfile.state}
                  </p>
                  <p>
                    <strong>Company: </strong> {userProfile.user?.company}
                  </p>
                  <p>
                    <strong>University: </strong> {userProfile.user?.university}
                  </p>
                  <p>
                    <strong>Status: </strong> {status}
                  </p>
                  <p>
                    <strong>Budget: </strong> ${budget}
                  </p>
                  <p>
                    <strong>Cleanliness: </strong> {userCleanliness}
                  </p>
                  <p>
                    <strong>Smokes: </strong>
                    {userProfile.smoke ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Pets: </strong> {userPets}
                  </p>
                  <p>
                    <strong>Room Type: </strong> {userRoomType}
                  </p>
                  <p>
                    <strong>Number of Roommates I am looking for: </strong>{" "}
                    {numRoommates}
                  </p>
                  <p>
                    <strong>Move In Date: </strong> {moveInDate}
                  </p>
                  <p>
                    <strong>Lease Duration: </strong>
                    {leaseDuration} months
                  </p>
                  <p>
                    <strong>Sleep Schedule: </strong> {userSleepSchedule}
                  </p>
                  <p>
                    <strong>Noise Tolerance: </strong> {userNoiseTolerance}
                  </p>
                  <p>
                    <strong>Socialness: </strong> {userSocialness}
                  </p>
                  <p>
                    <strong>Hobbies: </strong>
                    {userProfile.hobbies}
                  </p>
                  <p>
                    <strong>Favorite Music: </strong>
                    {favoriteMusic}
                  </p>
                  <p>
                    <strong>Bio: </strong>
                    {userProfile.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileModal;
