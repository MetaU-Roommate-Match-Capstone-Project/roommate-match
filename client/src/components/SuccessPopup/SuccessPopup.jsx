import React from "react";

const SuccessPopup = ({ onSelect }) => {
  return (
    <div className="success-popup-overlay">
      <div className="success-popup">
        <h2>Account successfully created!</h2>
        <div className="checkmark-bubble">
          <div className="checkmark-position">&#x2713;</div>
        </div>
        <p>
          Log in to your account to get started with your personalized roommate
          matching experience.
        </p>
        <div className="continue-button">
          <button className="btn-primary" onClick={() => onSelect(true)}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;
