import {
  cleanlinessMap,
  petsMap,
  roomTypesMap,
  sleepScheduleMap,
  noiseToleranceMap,
  socialnessMap,
} from "./enums.jsx";

export const getBasicUserInfo = (roommateProfile) => {
  return [
    {
      attribute: "Gender",
      value: roommateProfile.user.gender,
    },
    {
      attribute: "Location",
      value: `${roommateProfile.city}, ${roommateProfile.state}`,
    },
    {
      attribute: "Company",
      value: roommateProfile.user.company,
    },
    {
      attribute: "University",
      value: roommateProfile.user.university,
    },
    {
      attribute: "Status",
      value: roommateProfile.user.intern_or_new_grad,
    },
    {
      attribute: "Budget",
      value: `$${roommateProfile.user.budget_max}`,
    },
    {
      attribute: "Phone Number",
      value: roommateProfile.user.phone_number,
    },
    {
      attribute: "Instagram Handle",
      value: roommateProfile.user.instagram_handle,
    },
  ];
};

export const getUserRoommatePreferencesInfo = (roommateProfile) => {
  return [
    {
      attribute: "Cleanliness",
      value: cleanlinessMap[roommateProfile.cleanliness],
    },
    {
      attribute: "Smokes",
      value: roommateProfile.smokes ? "Yes" : "No",
    },
    {
      attribute: "Pets",
      value: petsMap[roommateProfile.pets],
    },
    {
      attribute: "Room Type",
      value: roomTypesMap[roommateProfile.room_type],
    },
    {
      attribute: "Number of Roommates I am looking for",
      value: roommateProfile.num_roommates,
    },
    {
      attribute: "Move In Date",
      value: new Date(roommateProfile.move_in_date).toLocaleDateString(),
    },
    {
      attribute: "Lease Duration",
      value: `${roommateProfile.lease_duration} months`,
    },
    {
      attribute: "Sleep Schedule",
      value: sleepScheduleMap[roommateProfile.sleep_schedule],
    },
    {
      attribute: "Noise Tolerance",
      value: noiseToleranceMap[roommateProfile.noise_tolerance],
    },
    {
      attribute: "Socialness",
      value: socialnessMap[roommateProfile.socialness],
    },
    {
      attribute: "Hobbies",
      value: roommateProfile.hobbies,
    },
    {
      attribute: "Favorite Music",
      value: roommateProfile.favorite_music,
    },
    {
      attribute: "Bio",
      value: roommateProfile.bio,
    },
  ];
};
