import React from "react";

const RoommateAttributes = ({ attribute, value }) => {
  return (
    <p>
      <strong>{attribute}: </strong> {value}
    </p>
  );
};

export default RoommateAttributes;
