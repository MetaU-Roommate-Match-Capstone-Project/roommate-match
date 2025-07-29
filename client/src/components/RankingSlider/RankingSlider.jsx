import { useEffect, useState } from "react";

// array of values from 0 to 1 with step 0.2
const items = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

// reference for ranking slider: https://www.youtube.com/watch?v=zk7W2-1nq6E
const RankingSlider = ({ label, value = 0, onChange }) => {
  const calculateIndex = (value) => {
    const normalizedVal = value / 100;

    if (normalizedVal <= 0) {
      return 0;
    }

    if (normalizedVal >= 1) {
      return items.length - 1;
    }

    return Math.round(normalizedVal / 0.2);
  };

  const [currentIndex, setCurrentIndex] = useState(() => calculateIndex(value));

  useEffect(() => {
    setCurrentIndex(calculateIndex(value));
  }, [value]);

  const sliderValue = currentIndex * 20;

  const handleChange = (e) => {
    const rawVal = parseInt(e.target.value, 10);
    const newIndex = Math.round(rawVal / 20);
    setCurrentIndex(newIndex);

    if (onChange) {
      onChange(items[newIndex]);
    }
  };

  const tickMarks = items.map((item, index) => (
    <div
      key={index}
      className="slider-tick"
      style={{ left: `${index * 20}%` }}
    />
  ));

  return (
    <div className="ranking-slider-container">
      <label className="form-label">{label}</label>

      <div className="slider-container">
        <div className="slider-tick-container">{tickMarks}</div>

        <input
          type="range"
          className="custom-slider"
          min={0}
          max={100}
          step={20}
          value={sliderValue}
          onChange={handleChange}
        />

        <div className="slider-labels">
          <span>Not Important</span>
          <span>Very Important</span>
        </div>
      </div>
    </div>
  );
};

export default RankingSlider;
