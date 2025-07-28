import React from "react";
import { useNavigate } from "react-router-dom";

const CreateProfilePopup = () => {
  const navigate = useNavigate();

  const handleCreateProfile = () => {
    navigate("/current-user-profile");
  };

  return (
    <div className="recommendation-popup-overlay">
      <div className="recommendation-popup">
        <h2>Missing Profile &#x2639;</h2>
        <p>
          Create a profile to receive personalized roommate recommendations!
        </p>
        <div className="recommendation-buttons">
          <button
            className="recommendation-button individual"
            onClick={handleCreateProfile}
          >
            Create a Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProfilePopup;
