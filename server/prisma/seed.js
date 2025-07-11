const { faker } = require("@faker-js/faker");
const fetch = require("node-fetch");
require("dotenv").config();

const BASE_URL = "http://localhost:3000/api";

const CLEANLINESS_VALUES = [
  "VERY_DIRTY",
  "DIRTY",
  "MEDIUM",
  "CLEAN",
  "VERY_CLEAN",
];
const PETS_VALUES = [
  "NO_PETS",
  "CATS_ONLY",
  "DOGS_ONLY",
  "CATS_AND_DOGS",
  "OKAY_WITH_ANY_PET",
];
const GENDER_PREFERENCE_VALUES = [
  "NO_PREFERENCE",
  "MALE",
  "FEMALE",
  "NONBINARY",
];
const ROOM_TYPE_VALUES = [
  "PRIVATE_ROOM_IN_APARTMENT",
  "SHARED_ROOM",
  "PRIVATE_ROOM_IN_HOUSE",
];
const SLEEP_SCHEDULE_VALUES = ["EARLY_RISER", "LATE_SLEEPER", "NO_PREFERENCE"];
const NOISE_TOLERANCE_VALUES = [
  "QUIET",
  "SOMEWHAT_QUIET",
  "SOMEWHAT_NOISY",
  "NOISY",
];
const SOCIALNESS_VALUES = ["LONER", "SOMEWHAT_SOCIAL", "SOCIAL", "VERY_SOCIAL"];

const UNIVERSITIES = [
  "Stanford University",
  "UC Berkeley",
  "UCLA",
  "USC",
  "UCSB",
  "UCSD",
  "UC Davis",
  "Cal Poly SLO",
  "San Jose State",
  "Santa Clara University",
  "University of Washington",
  "MIT",
  "Harvard",
  "Yale",
  "Princeton",
  "Columbia",
  "NYU",
  "Cornell",
  "Carnegie Mellon",
  "Georgia Tech",
  "UT Austin",
  "University of Michigan",
  "Northwestern",
  "Duke",
];

const COMPANIES = [
  "Google",
  "Meta",
  "Apple",
  "Microsoft",
  "Amazon",
  "Netflix",
  "Tesla",
  "Uber",
  "Airbnb",
  "Spotify",
  "Adobe",
  "Salesforce",
  "Oracle",
  "IBM",
  "Intel",
  "NVIDIA",
  "Palantir",
  "Stripe",
  "Square",
  "Dropbox",
  "Slack",
  "Zoom",
  "Snapchat",
  "Twitter",
];

const CITY_STATE_PAIRS = [
  { city: "San Francisco", state: "California" },
  { city: "Palo Alto", state: "California" },
  { city: "Mountain View", state: "California" },
  { city: "Sunnyvale", state: "California" },
  { city: "San Jose", state: "California" },
  { city: "Redwood City", state: "California" },
  { city: "Menlo Park", state: "California" },
  { city: "Cupertino", state: "California" },
  { city: "Santa Clara", state: "California" },
  { city: "Fremont", state: "California" },
  { city: "Oakland", state: "California" },
  { city: "Berkeley", state: "California" },
  { city: "Los Angeles", state: "California" },
  { city: "San Diego", state: "California" },
  { city: "Seattle", state: "Washington" },
  { city: "Bellevue", state: "Washington" },
  { city: "New York", state: "New York" },
  { city: "Austin", state: "Texas" },
  { city: "Boston", state: "Massachusetts" },
  { city: "Miami", state: "Florida" },
  { city: "Chicago", state: "Illinois" },
];

const HOBBIES = [
  "Reading",
  "Hiking",
  "Cooking",
  "Gaming",
  "Photography",
  "Traveling",
  "Yoga",
  "Rock climbing",
  "Cycling",
  "Swimming",
  "Dancing",
  "Painting",
  "Music production",
  "Board games",
  "Gardening",
  "Coding",
  "Fitness",
  "Meditation",
  "Writing",
  "Skiing",
];

const MUSIC_GENRES = [
  "Pop",
  "Rock",
  "Hip-hop",
  "Electronic",
  "Jazz",
  "Classical",
  "Indie",
  "R&B",
  "Country",
  "Alternative",
  "Reggae",
  "Folk",
  "Punk",
  "Metal",
  "Blues",
  "Funk",
];

const POST_CONTENT_TEMPLATES = [
  "Looking for a roommate in {city}! I'm a {internOrNewGrad} at {company}. Budget is ${budgetMin}-${budgetMax}. Love {hobbies} and {music} music!",
  "Hey everyone! Searching for someone to share a place in {city}. I work at {company} and went to {university}. Looking for someone clean and social!",
  "Roommate wanted in {city}! I'm pretty {socialness} and enjoy {hobbies}. Budget around ${budgetMax}. Hit me up if interested!",
  "Looking for a chill roommate in {city}. I'm a {internOrNewGrad} who loves {music} music and {hobbies}. Let's find a great place together!",
  "Seeking a roommate for {city} area. Work at {company}, budget is ${budgetMin}-${budgetMax}. I'm {socialness} and love {hobbies}!",
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

let sessionCookie = "";

function generateUserData() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const university = getRandomElement(UNIVERSITIES);
  const universityDomain = university.toLowerCase().replace(/\s/g, "");

  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${universityDomain}.edu`;
  const gender = getRandomElement(["male", "female", "non-binary"]);
  const internOrNewGrad = getRandomElement(["intern", "new grad"]);
  const budgetMin = faker.number.int({ min: 800, max: 2000 });
  const budgetMax = budgetMin + faker.number.int({ min: 200, max: 800 });

  return {
    name: `${firstName} ${lastName}`,
    email: email,
    password: process.env.MOCK_USER_PASSWORD,
    dob: faker.date.birthdate({ min: 20, max: 30, mode: "age" }),
    gender: gender,
    intern_or_new_grad: internOrNewGrad,
    budget_min: budgetMin,
    budget_max: budgetMax,
    university: university,
    company: getRandomElement(COMPANIES),
  };
}

function generateRoommateProfileData() {
  const cityStatePair = getRandomElement(CITY_STATE_PAIRS);
  const moveInDate = faker.date.future({ years: 1 });
  const selectedHobbies = faker.helpers.arrayElements(HOBBIES, {
    min: 2,
    max: 5,
  });

  return {
    city: cityStatePair.city,
    state: cityStatePair.state,
    cleanliness: getRandomElement(CLEANLINESS_VALUES),
    smokes: faker.datatype.boolean({ probability: 0.2 }),
    pets: getRandomElement(PETS_VALUES),
    genderPreference: getRandomElement(GENDER_PREFERENCE_VALUES),
    roomType: getRandomElement(ROOM_TYPE_VALUES),
    numRoommates: faker.number.int({ min: 1, max: 4 }),
    leaseDuration: getRandomElement([2, 3, 4, 6, 12, 18, 24]),
    moveInDate: moveInDate,
    sleepSchedule: getRandomElement(SLEEP_SCHEDULE_VALUES),
    noiseTolerance: getRandomElement(NOISE_TOLERANCE_VALUES),
    socialness: getRandomElement(SOCIALNESS_VALUES),
    hobbies: selectedHobbies.join(", "),
    favoriteMusic: getRandomElement(MUSIC_GENRES),
    bio: faker.lorem.paragraph({ min: 2, max: 4 }),
    cleanlinessWeight: parseFloat(
      faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    ),
    smokesWeight: parseFloat(
      faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    ),
    petsWeight: parseFloat(
      faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    ),
    genderPreferenceWeight: parseFloat(
      faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    ),
    roomTypeWeight: parseFloat(
      faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    ),
    numRoommatesWeight: parseFloat(
      faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    ),
    sleepScheduleWeight: parseFloat(
      faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    ),
    noiseToleranceWeight: parseFloat(
      faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    ),
    socialnessWeight: parseFloat(
      faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    ),
    hobbiesWeight: parseFloat(
      faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    ),
    favoriteMusicWeight: parseFloat(
      faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    ),
  };
}

function generatePostData(user) {
  const cityStatePair = getRandomElement(CITY_STATE_PAIRS);
  const template = getRandomElement(POST_CONTENT_TEMPLATES);
  const selectedHobbies = faker.helpers
    .arrayElements(HOBBIES, { min: 1, max: 3 })
    .join(" and ");
  const music = getRandomElement(MUSIC_GENRES);

  const content = template
    .replace("{city}", cityStatePair.city)
    .replace("{internOrNewGrad}", user.intern_or_new_grad.toLowerCase())
    .replace("{company}", user.company)
    .replace("{university}", user.university)
    .replace("{budgetMin}", user.budget_min.toString())
    .replace("{budgetMax}", user.budget_max.toString())
    .replace("{hobbies}", selectedHobbies)
    .replace("{music}", music)
    .replace(
      "{socialness}",
      getRandomElement([
        "pretty social",
        "somewhat quiet",
        "very outgoing",
        "laid back",
      ]),
    );

  return {
    city: cityStatePair.city,
    state: cityStatePair.state,
    content: content,
  };
}

async function createUser(userData) {
  try {
    const response = await fetch(`${BASE_URL}/users/create-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorInfo = await response.json();
      throw new Error(errorInfo.error || "Failed to create user");
    }

    const result = await response.json();

    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      sessionCookie = setCookieHeader;
    }

    return result;
  } catch (error) {
    return null;
  }
}

async function loginUser(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionCookie && { Cookie: sessionCookie }),
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorInfo = await response.json();
      throw new Error(errorInfo.error || "Failed to login user");
    }

    const result = await response.json();

    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      sessionCookie = setCookieHeader;
    }

    return result;
  } catch (error) {
    return null;
  }
}

async function createRoommateProfile(profileData) {
  try {
    const response = await fetch(`${BASE_URL}/roommate-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionCookie && { Cookie: sessionCookie }),
      },
      credentials: "include",
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorInfo = await response.json();
      throw new Error(errorInfo.error || "Failed to create roommate profile");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return null;
  }
}

async function createPost(postData) {
  try {
    const response = await fetch(`${BASE_URL}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionCookie && { Cookie: sessionCookie }),
      },
      credentials: "include",
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorInfo = await response.json();
      throw new Error(errorInfo.error || "Failed to create post");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return null;
  }
}

async function logoutUser() {
  try {
    const userResponse = await fetch(`${BASE_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(sessionCookie && { Cookie: sessionCookie }),
      },
      credentials: "include",
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      if (userData && userData.id) {
        await fetch(`${BASE_URL}/users/logout/${userData.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(sessionCookie && { Cookie: sessionCookie }),
          },
          credentials: "include",
        });
      }
    }
    sessionCookie = "";
  } catch (error) {
    sessionCookie = "";
  }
}

async function main() {
  const userCount = 300;
  const createdUsers = [];

  for (let i = 0; i < userCount; i++) {
    const userData = generateUserData();
    const createdUser = await createUser(userData);

    if (createdUser) {
      createdUsers.push({ ...userData, id: createdUser.newUser.id });
      const loginResult = await loginUser(userData.email, userData.password);

      if (loginResult) {
        const profileData = generateRoommateProfileData();
        await createRoommateProfile(profileData);

        const numPosts = faker.number.int({ min: 1, max: 3 });
        for (let j = 0; j < numPosts; j++) {
          const postData = generatePostData(userData);
          await createPost(postData);
        }
        await logoutUser();
      }
    }
  }
}

main().catch((e) => {
  process.exit(1);
});
