import React from "react";

const RoommateAttribute = ({ attribute, value }) => {
  return (
    <p>
      <strong>{attribute}: </strong> {value}
    </p>
  );
};

export default RoommateAttribute;
