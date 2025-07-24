const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function getGenAiBio(profileData) {
  try {
    const {
      user,
      city,
      state,
      cleanliness,
      smokes,
      pets,
      gender_preference,
      room_type,
      num_roommates,
      lease_duration,
      move_in_date,
      sleep_schedule,
      noise_tolerance,
      socialness,
      hobbies,
      favorite_music,
    } = profileData;

    const moveInDate = new Date(move_in_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prompt = `
    Write a friendly, engaging, and personalized roommate bio (in first person) for someone with the following characteristics:

    Name: ${user.name}
    Gender: ${user.gender}
    City/State: ${city}, ${state}
    University: ${user.university}
    Company: ${user.company}
    Intern or New Grad: ${user.intern_or_new_grad}
    Budget Range: $${user.budget_min} - $${user?.budget_max}

    Roommate Preferences:
    - Cleanliness level: ${cleanliness.replace(/_/g, " ").toLowerCase()}
    - Smoking: ${smokes ? "smoker" : "non-smoker"}
    - Pets preference: ${pets.replace(/_/g, " ").toLowerCase()}
    - Gender preference: ${gender_preference.replace(/_/g, " ").toLowerCase()}
    - Room type: ${room_type.replace(/_/g, " ").toLowerCase()}
    - Number of roommates preferred: ${num_roommates}
    - Lease duration: ${lease_duration} months
    - Move-in date: ${moveInDate}
    - Sleep schedule: ${sleep_schedule.replace(/_/g, " ").toLowerCase()}
    - Noise tolerance: ${noise_tolerance.replace(/_/g, " ").toLowerCase()}
    - Socialness: ${socialness.replace(/_/g, " ").toLowerCase()}

    Personal Interests:
    - Hobbies: ${hobbies}
    - Favorite music: ${favorite_music}

    Write a short bio that's less than 30 words. Keep it friendly, conversational, and highlight their personality based on the above information.
    Make it sound natural, authentic, and personable, as if they wrote it themselves.
    Don't explicitly list all the preferences, but include the important ones.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    // default bio if there's an error
    return "I'm looking for roommates in the area. Feel free to reach out if you're interested!";
  }
}

module.exports = { getGenAiBio };
