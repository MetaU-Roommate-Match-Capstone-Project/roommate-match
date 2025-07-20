import React from "react";
// request button component for sending individual roommate or group requests
const RequestButton = ({ onClick, disabled = false, isGroup = false }) => {
  return (
    <button
      className="action-button accept"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="button-text">
        {isGroup ? "Send Group Request" : "Send Roommate Request"}
      </span>
    </button>
  );
};

// reject button component for rejecting recommendations
const RejectButton = ({ onClick, disabled = false, isGroup = false }) => {
  return (
    <button
      className="action-button reject"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="button-text">
        {isGroup ? "Reject Group" : "Reject Roommate"}
      </span>
    </button>
  );
};

// container to format match update buttons
const UpdateMatchButtons = ({
  onAccept,
  onReject,
  disabled = false,
  isGroup = false,
}) => {
  return (
    <div className="recommendation-actions">
      <RejectButton onClick={onReject} disabled={disabled} isGroup={isGroup} />
      <RequestButton onClick={onAccept} disabled={disabled} isGroup={isGroup} />
    </div>
  );
};

export default UpdateMatchButtons;
