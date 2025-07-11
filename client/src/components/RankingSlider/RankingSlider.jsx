import React from "react";
import { Slider } from "@material-tailwind/react";

const RankingSlider = () => {
  return (
    <div>
      <label className="form-label">
        Rank how important this attribute is to you:
      </label>
      <Slider color="#3066BE" defaultValue={50} />
    </div>
  );
};

export default RankingSlider;
