import { useEffect, useState } from "react";

// creates array of values from 0 to 1.0 with step 0.02
const items = Array.from({ length: 51 }, (_, i) => i * 0.02);

// reference for ranking slider: https://www.youtube.com/watch?v=zk7W2-1nq6E
const RankingSlider = ({ label, value = 0, onChange }) => {
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const handleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSliderValue(val);

    // convert slider value (0-100) to an index in the items array (0-50)
    const itemIndex = Math.min(Math.floor(val / 2), items.length - 1);
    const selectedValue = items[itemIndex];

    if (onChange) {
      onChange(selectedValue);
    }
  };

  const itemIndex = Math.min(Math.floor(sliderValue / 2), items.length - 1);
  const displayValue = items[itemIndex]?.toFixed(2) || "0.00";

  return (
    <div className="ranking-slider-container">
      <label className="form-label">{label}</label>

      <div className="slider-container">
        <input
          type="range"
          className="custom-slider"
          min={0}
          max={100}
          step={2}
          value={sliderValue}
          onChange={handleChange}
        />

        <div className="slider-labels">
          <span>Not Important</span>
          <span>Very Important</span>
        </div>
      </div>

      <div className="slider-value">Selected value: {displayValue}</div>
    </div>
  );
};

export default RankingSlider;
