import React from "react";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin h-12 w-12 border-t-4 border-b-4 rounded-full border-yellow-500"></div>
    </div>
  );
};

export default Spinner;
