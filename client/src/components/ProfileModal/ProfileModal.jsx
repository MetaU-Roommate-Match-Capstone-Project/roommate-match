import React, { useState, useEffect } from "react";
import {
  getBasicUserInfo,
  getUserRoommatePreferencesInfo,
} from "../../utils/profileAttributes.js";
import RoommateAttributes from "../RoommateAttributes/RoommateAttributes.jsx";
import fallbackProfilePic from "../../assets/fallback-profile-picture.png";

const ProfileModal = ({ userProfile, onClose }) => {
  if (!userProfile) {
    return null;
  }

  const basicUserInfo = getBasicUserInfo(userProfile);
  const roommatePreferencesInfo = getUserRoommatePreferencesInfo(userProfile);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="x-btn" onClick={onClose}>
          &times;
        </span>
        <div className="modal">
          <div className="profile-header">
            <h1>{userProfile.user?.name}</h1>
          </div>

          <div className="profile-main">
            <div className="profile-col">
              <img
                className="profile-image"
                src={`/api/roommate-profile/profile-picture/${userProfile.user.id}`}
                alt="profile-picture"
                onError={(e) => {
                  e.target.src = fallbackProfilePic;
                }}
              />
              <div className="profile-details">
                {basicUserInfo.map((info, index) => (
                  <RoommateAttributes
                    key={index}
                    attribute={info.attribute}
                    value={info.value}
                  />
                ))}
              </div>
            </div>

            <div className="profile-col">
              <h3 className="title">Roommate Preferences</h3>
              <div className="profile-details">
                {roommatePreferencesInfo.map((preference, index) => (
                  <RoommateAttributes
                    key={index}
                    attribute={preference.attribute}
                    value={preference.value}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
