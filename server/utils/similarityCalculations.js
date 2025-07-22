// Utilities used to calculate the similarity of individual roommate attributes
const ENUM_MAP = {
  cleanliness: { VERY_DIRTY: 0, DIRTY: 1, MEDIUM: 2, CLEAN: 3, VERY_CLEAN: 4 },
  pets: {
    NO_PETS: 0,
    CATS_ONLY: 1,
    DOGS_ONLY: 2,
    CATS_AND_DOGS: 3,
    OKAY_WITH_ANY_PET: 4,
  },
  genderPreference: { NO_PREFERENCE: 0, MALE: 1, FEMALE: 2, NONBINARY: 3 },
  roomType: {
    PRIVATE_ROOM_IN_APARTMENT: 0,
    SHARED_ROOM: 1,
    PRIVATE_ROOM_IN_HOUSE: 2,
  },
  sleepSchedule: { NO_PREFERENCE: 0, EARLY_RISER: 1, LATE_SLEEPER: 2 },
  noiseTolerance: { QUIET: 0, SOMEWHAT_QUIET: 1, SOMEWHAT_NOISY: 2, NOISY: 3 },
  socialness: { LONER: 0, SOMEWHAT_SOCIAL: 1, SOCIAL: 2, VERY_SOCIAL: 3 },
};

function distanceBetweenEnumValues(attribute, value1, value2) {
  return Math.abs(ENUM_MAP[attribute][value1] - ENUM_MAP[attribute][value2]);
}

function distanceBetweenBooleanValues(value1, value2) {
  return value1 === value2 ? 0 : 1;
}

function distanceBetweenNumericalValues(value1, value2) {
  return Math.abs(value1 - value2);
}

// build frequency map of words in a string
function convertStringToVector(str) {
  // convert string to lowercase and split it handling commas and spaces
  return str
    .toLowerCase()
    .split(/[,\s]+/)
    .reduce((acc, char) => {
      acc[char] = (acc[char] || 0) + 1;
      return acc;
    }, {});
}

// cosine similarity between two vectors to calculate distance between two strings
// reference: https://www.youtube.com/watch?v=e9U0QAFbfLI
function distanceBetweenStringValues(str1, str2) {
  if (str1 === str2) {
    return 0;
  }

  const vector1 = convertStringToVector(str1);
  const vector2 = convertStringToVector(str2);

  const dotProduct = Object.keys(vector1).reduce((sum, key) => {
    return sum + vector1[key] * (vector2[key] || 0);
  }, 0);

  const magnitude1 = Math.sqrt(
    Object.keys(vector1).reduce((sum, val) => {
      return sum + vector1[val] * vector1[val];
    }, 0),
  );

  const magnitude2 = Math.sqrt(
    Object.keys(vector2).reduce((sum, val) => {
      return sum + vector2[val] * vector2[val];
    }, 0),
  );

  return 1 - dotProduct / (magnitude1 * magnitude2);
}

// calculate distance between 2 coordinates using Haversine formula
// reference: https://www.youtube.com/watch?v=t6NkBRQ2Fz0
function distanceBetweenCoordinates(lat1, lon1, lat2, lon2) {
  const R = 6371; // earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = {
  distanceBetweenEnumValues,
  distanceBetweenBooleanValues,
  distanceBetweenNumericalValues,
  distanceBetweenStringValues,
  distanceBetweenCoordinates,
};
