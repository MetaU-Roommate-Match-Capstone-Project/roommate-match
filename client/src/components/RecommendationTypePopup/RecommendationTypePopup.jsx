import React from "react";

const RecommendationTypePopup = ({ onSelect }) => {
  return (
    <div className="recommendation-popup-overlay">
      <div className="recommendation-popup">
        <h2>Choose Your Recommendation Type</h2>
        <p>
          Would you like to receive individual roommate recommendations or group
          recommendations?
        </p>
        <div className="recommendation-buttons">
          <button
            className="recommendation-button individual"
            onClick={() => onSelect("individual")}
          >
            Individual Recommendations
          </button>
          <button
            className="recommendation-button group"
            onClick={() => onSelect("group")}
          >
            Group Recommendations
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationTypePopup;
