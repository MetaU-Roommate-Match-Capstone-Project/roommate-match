import React from "react";
import UserProfileDisplay from "../UserProfileDisplay/UserProfileDisplay.jsx";

const ProfileModal = ({ userProfile, onClose, showPosts = true }) => {
  if (!userProfile) {
    return null;
  }

  return (
    <UserProfileDisplay
      userProfile={userProfile}
      isModal={true}
      onClose={onClose}
      showPosts={showPosts}
    />
  );
};

export default ProfileModal;
