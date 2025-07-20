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
  "X",
];

const OFFICE_ADDRESSES = {
  Google: {
    "San Francisco, CA": "345 Spear St, San Francisco, CA 94105",
    "Mountain View, CA": "1600 Amphitheatre Parkway, Mountain View, CA 94043",
    "Sunnyvale, CA": "1155 Borregas Ave, Sunnyvale, CA 94089",
    "Palo Alto, CA": "3400 Hillview Ave, Palo Alto, CA 94304",
    "Seattle, WA": "601 N 34th St, Seattle, WA 98103",
    "New York, NY": "111 8th Ave, New York, NY 10011",
    "Austin, TX": "500 W 2nd St, Austin, TX 78701",
    "Boston, MA": "355 Main St, Cambridge, MA 02142",
    "Chicago, IL": "320 N Morgan St, Chicago, IL 60607",
  },
  Meta: {
    "Menlo Park, CA": "1 Hacker Way, Menlo Park, CA 94025",
    "San Francisco, CA": "181 Fremont St, San Francisco, CA 94105",
    "Fremont, CA": "39900 Balentine Dr, Fremont, CA 94538",
    "Seattle, WA": "2200 Westlake Ave, Seattle, WA 98121",
    "New York, NY": "770 Broadway, New York, NY 10003",
    "Austin, TX": "300 W 6th St, Austin, TX 78701",
    "Boston, MA": "1 Hacker Way, Boston, MA 02210",
  },
  Apple: {
    "Cupertino, CA": "1 Apple Park Way, Cupertino, CA 95014",
    "San Francisco, CA": "1 Stockton St, San Francisco, CA 94108",
    "Sunnyvale, CA": "1 Infinite Loop, Sunnyvale, CA 94089",
    "Austin, TX": "12545 Riata Vista Cir, Austin, TX 78727",
    "Seattle, WA": "2201 Westlake Ave, Seattle, WA 98121",
    "New York, NY": "401 W 14th St, New York, NY 10014",
  },
  Microsoft: {
    "Redmond, WA": "1 Microsoft Way, Redmond, WA 98052",
    "Seattle, WA": "320 Westlake Ave N, Seattle, WA 98109",
    "Bellevue, WA": "15590 NE 31st St, Redmond, WA 98052",
    "San Francisco, CA": "555 California St, San Francisco, CA 94104",
    "Mountain View, CA": "1065 La Avenida St, Mountain View, CA 94043",
    "New York, NY": "11 Times Square, New York, NY 10036",
    "Austin, TX": "8834 Capital of Texas Hwy N, Austin, TX 78759",
    "Boston, MA": "1 Memorial Dr, Cambridge, MA 02142",
  },
  Amazon: {
    "Seattle, WA": "410 Terry Ave N, Seattle, WA 98109",
    "Bellevue, WA": "2200 Alaskan Way, Seattle, WA 98121",
    "San Francisco, CA": "101 California St, San Francisco, CA 94111",
    "Palo Alto, CA": "101 Lytton Ave, Palo Alto, CA 94301",
    "Sunnyvale, CA": "1200 Borregas Ave, Sunnyvale, CA 94089",
    "New York, NY": "7 W 34th St, New York, NY 10001",
    "Austin, TX": "1800 Lavaca St, Austin, TX 78701",
    "Boston, MA": "101 Main St, Cambridge, MA 02142",
  },
  Netflix: {
    "Los Gatos, CA": "100 Winchester Cir, Los Gatos, CA 95032",
    "San Francisco, CA": "888 Brannan St, San Francisco, CA 94103",
    "Los Angeles, CA": "5808 W Sunset Blvd, Los Angeles, CA 90028",
    "New York, NY": "888 Broadway, New York, NY 10003",
    "Austin, TX": "1 Barton Springs Rd, Austin, TX 78704",
  },
  Tesla: {
    "Palo Alto, CA": "3500 Deer Creek Rd, Palo Alto, CA 94304",
    "Fremont, CA": "45500 Fremont Blvd, Fremont, CA 94538",
    "San Francisco, CA": "201 3rd St, San Francisco, CA 94103",
    "Austin, TX": "13101 Harold Green Rd, Austin, TX 78724",
    "New York, NY": "860 Washington St, New York, NY 10014",
  },
  Uber: {
    "San Francisco, CA": "1455 Market St, San Francisco, CA 94103",
    "Palo Alto, CA": "405 E 4th Ave, San Mateo, CA 94401",
    "Seattle, WA": "505 Howard St, San Francisco, CA 94105",
    "New York, NY": "3 World Trade Center, New York, NY 10007",
    "Austin, TX": "1201 S Mopac Expy, Austin, TX 78746",
    "Chicago, IL": "200 W Jackson Blvd, Chicago, IL 60606",
  },
  Airbnb: {
    "San Francisco, CA": "888 Brannan St, San Francisco, CA 94103",
    "Seattle, WA": "2200 1st Ave, Seattle, WA 98121",
    "New York, NY": "130 E 57th St, New York, NY 10022",
    "Los Angeles, CA": "1 LMU Dr, Los Angeles, CA 90045",
    "Austin, TX": "800 Brazos St, Austin, TX 78701",
  },
  Spotify: {
    "San Francisco, CA": "564 Market St, San Francisco, CA 94104",
    "New York, NY": "4 World Trade Center, New York, NY 10007",
    "Los Angeles, CA": "2901 28th St, Santa Monica, CA 90405",
    "Boston, MA": "4 Copley Pl, Boston, MA 02116",
  },
  Adobe: {
    "San Jose, CA": "345 Park Ave, San Jose, CA 95110",
    "San Francisco, CA": "601 Townsend St, San Francisco, CA 94103",
    "Seattle, WA": "410 Terry Ave N, Seattle, WA 98109",
    "New York, NY": "601 W 26th St, New York, NY 10001",
    "Austin, TX": "314 E Highland Mall Blvd, Austin, TX 78752",
    "Boston, MA": "1 Broadway, Cambridge, MA 02142",
  },
  Salesforce: {
    "San Francisco, CA": "415 Mission St, San Francisco, CA 94105",
    "Palo Alto, CA": "303 Almaden Blvd, San Jose, CA 95110",
    "Seattle, WA": "929 108th Ave NE, Bellevue, WA 98004",
    "New York, NY": "1095 Avenue of the Americas, New York, NY 10036",
    "Austin, TX": "111 Congress Ave, Austin, TX 78701",
    "Chicago, IL": "111 W Illinois St, Chicago, IL 60654",
  },
  Oracle: {
    "Redwood City, CA": "500 Oracle Pkwy, Redwood City, CA 94065",
    "San Francisco, CA": "1 Front St, San Francisco, CA 94111",
    "Austin, TX": "2300 W Parmer Ln, Austin, TX 78727",
    "Seattle, WA": "800 5th Ave, Seattle, WA 98104",
    "New York, NY": "1 World Financial Center, New York, NY 10281",
  },
  IBM: {
    "San Francisco, CA": "1 Post St, San Francisco, CA 94104",
    "Austin, TX": "11501 Burnet Rd, Austin, TX 78758",
    "Seattle, WA": "2001 6th Ave, Seattle, WA 98121",
    "New York, NY": "590 Madison Ave, New York, NY 10022",
    "Boston, MA": "314 Main St, Cambridge, MA 02142",
  },
  Intel: {
    "Santa Clara, CA": "2200 Mission College Blvd, Santa Clara, CA 95054",
    "San Francisco, CA": "100 1st St, San Francisco, CA 94105",
    "Austin, TX": "1300 S Mopac Expy, Austin, TX 78746",
    "Seattle, WA": "15590 NE 31st St, Redmond, WA 98052",
    "New York, NY": "1633 Broadway, New York, NY 10019",
  },
  NVIDIA: {
    "Santa Clara, CA": "2788 San Tomas Expy, Santa Clara, CA 95051",
    "San Francisco, CA": "303 2nd St, San Francisco, CA 94107",
    "Austin, TX": "10900 Stonelake Blvd, Austin, TX 78759",
    "Seattle, WA": "918 5th Ave, Seattle, WA 98164",
    "New York, NY": "1633 Broadway, New York, NY 10019",
  },
  Palantir: {
    "Palo Alto, CA": "100 Hamilton Ave, Palo Alto, CA 94301",
    "San Francisco, CA": "100 Hamilton Ave, Palo Alto, CA 94301",
    "New York, NY": "200 5th Ave, New York, NY 10010",
    "Seattle, WA": "2200 Alaskan Way, Seattle, WA 98121",
    "Austin, TX": "98 San Jacinto Blvd, Austin, TX 78701",
  },
  Stripe: {
    "San Francisco, CA": "510 Townsend St, San Francisco, CA 94103",
    "Palo Alto, CA": "3180 Porter Dr, Palo Alto, CA 94304",
    "Seattle, WA": "1201 3rd Ave, Seattle, WA 98101",
    "New York, NY": "354 Oyster Point Blvd, South San Francisco, CA 94080",
    "Austin, TX": "500 W 2nd St, Austin, TX 78701",
  },
  Square: {
    "San Francisco, CA": "1455 Market St, San Francisco, CA 94103",
    "Oakland, CA": "1955 Broadway, Oakland, CA 94612",
    "New York, NY": "1 World Trade Center, New York, NY 10007",
    "Austin, TX": "500 W 2nd St, Austin, TX 78701",
  },
  Dropbox: {
    "San Francisco, CA": "1800 Owens St, San Francisco, CA 94158",
    "New York, NY": "333 Brannan St, San Francisco, CA 94107",
    "Austin, TX": "500 W 2nd St, Austin, TX 78701",
    "Seattle, WA": "1201 3rd Ave, Seattle, WA 98101",
  },
  Slack: {
    "San Francisco, CA": "500 Howard St, San Francisco, CA 94105",
    "New York, NY": "32 Old Slip, New York, NY 10005",
    "Austin, TX": "500 W 2nd St, Austin, TX 78701",
    "Seattle, WA": "1201 3rd Ave, Seattle, WA 98101",
  },
  Zoom: {
    "San Jose, CA": "55 Almaden Blvd, San Jose, CA 95113",
    "San Francisco, CA": "55 Almaden Blvd, San Jose, CA 95113",
    "Austin, TX": "500 W 2nd St, Austin, TX 78701",
    "New York, NY": "55 Almaden Blvd, San Jose, CA 95113",
  },
  Snapchat: {
    "Santa Monica, CA": "2772 Donald Douglas Loop N, Santa Monica, CA 90405",
    "Los Angeles, CA": "63 Market St, Venice, CA 90291",
    "San Francisco, CA": "Market St, San Francisco, CA 94103",
    "New York, NY": "229 W 43rd St, New York, NY 10036",
    "Austin, TX": "500 W 2nd St, Austin, TX 78701",
  },
  X: {
    "San Francisco, CA": "1355 Market St, San Francisco, CA 94103",
    "New York, NY": "249 W 17th St, New York, NY 10011",
    "Austin, TX": "500 W 2nd St, Austin, TX 78701",
    "Seattle, WA": "1201 3rd Ave, Seattle, WA 98101",
  },
};

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

  const company = getRandomElement(COMPANIES);
  const companyOffices = OFFICE_ADDRESSES[company];
  const officeLocations = Object.keys(companyOffices);
  const selectedLocation = getRandomElement(officeLocations);
  const officeAddress = companyOffices[selectedLocation];

  // get city and state from the randomly selected location
  const [city, stateAbbr] = selectedLocation.split(", ");

  const countryCode = "1";
  const phoneFirstThree = faker.string.numeric(3);
  const phoneMiddleThree = faker.string.numeric(3);
  const phoneLastFour = faker.string.numeric(4);
  const phoneNumber = `+${countryCode} (${phoneFirstThree})-${phoneMiddleThree}-${phoneLastFour}`;

  const instagramHandle = `@${firstName.toLowerCase()}${lastName.toLowerCase()}`;

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
    company: company,
    office_address: officeAddress,
    phone_number: phoneNumber,
    instagram_handle: instagramHandle,
    city: city,
    state: stateAbbr,
  };
}

function generateRoommateProfileData(city, state) {
  const moveInDate = faker.date.future({ years: 1 });
  const selectedHobbies = faker.helpers.arrayElements(HOBBIES, {
    min: 2,
    max: 5,
  });

  return {
    city: city,
    state: state,
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

function generatePostData(user, city, state) {
  const template = getRandomElement(POST_CONTENT_TEMPLATES);
  const selectedHobbies = faker.helpers
    .arrayElements(HOBBIES, { min: 1, max: 3 })
    .join(" and ");
  const music = getRandomElement(MUSIC_GENRES);

  const content = template
    .replace("{city}", city)
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
    city: city,
    state: state,
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
        const profileData = generateRoommateProfileData(
          userData.city,
          userData.state,
        );
        await createRoommateProfile(profileData);

        const numPosts = faker.number.int({ min: 1, max: 3 });
        for (let j = 0; j < numPosts; j++) {
          const postData = generatePostData(
            userData,
            userData.city,
            userData.state,
          );
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
