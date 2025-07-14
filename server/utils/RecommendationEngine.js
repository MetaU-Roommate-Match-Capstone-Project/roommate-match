const {
  distanceBetweenEnumValues,
  distanceBetweenBooleanValues,
  distanceBetweenNumericalValues,
  distanceBetweenStringValues,
  distanceBetweenCoordinates,
} = require("./similarityCalculations.js");

const POSITIVE_STATUSES = new Set(["ACCEPTED", "FRIEND_REQUEST_SENT"]);
const NEGATIVE_STATUSES = new Set([
  "REJECTED_BY_RECIPIENT",
  "REJECTED_RECOMMENDATION",
]);

class RecommendationEngine {
  constructor(currentProfile, currentUser, others, otherUsers) {
    this.currentProfile = currentProfile;
    this.currentUser = currentUser;
    this.others = others;
    this.otherUsers = otherUsers;
  }

  getWeights() {
    // set predetermined high weights for age, move in date, university, and office location
    const p = this.currentProfile;
    return {
      cleanliness: parseFloat(p.cleanliness_weight) || 0,
      smokes: parseFloat(p.smokes_weight) || 0,
      pets: parseFloat(p.pets_weight) || 0,
      genderPreference: parseFloat(p.gender_preference_weight) || 0,
      roomType: parseFloat(p.room_type_weight) || 0,
      numRoommates: parseFloat(p.num_roommates_weight) || 0,
      sleepSchedule: parseFloat(p.sleep_schedule_weight) || 0,
      noiseTolerance: parseFloat(p.noise_tolerance_weight) || 0,
      socialness: parseFloat(p.socialness_weight) || 0,
      hobbies: parseFloat(p.hobbies_weight) || 0,
      favoriteMusic: parseFloat(p.favorite_music_weight) || 0,
      age: 0.95,
      moveInDate: 0.99,
      university: 0.75,
      officeLocation: 0.95,
    };
  }

  computeSimilarity(otherProfile, otherUser) {
    const weights = this.getWeights();
    const a = this.currentProfile;
    const b = otherProfile;
    const userA = this.currentUser;
    const userB = otherUser;

    // calculate age from dob
    const calculateAge = (dob) => {
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age;
    };

    const userAAge = calculateAge(userA.dob);
    const userBAge = calculateAge(userB.dob);

    // calculate move-in date similarity (closer dates = higher similarity)
    const calculateDateDifferenceInDays = (date1, date2) => {
      const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
      const firstDate = new Date(date1);
      const secondDate = new Date(date2);
      return Math.abs((firstDate - secondDate) / oneDay);
    };

    const moveInDateDifference = calculateDateDifferenceInDays(
      a.move_in_date,
      b.move_in_date,
    );

    const similarity = {
      cleanliness:
        1 /
        (1 +
          distanceBetweenEnumValues(
            "cleanliness",
            a.cleanliness,
            b.cleanliness,
          )),
      smokes: 1 / (1 + distanceBetweenBooleanValues(a.smokes, b.smokes)),
      pets: 1 / (1 + distanceBetweenEnumValues("pets", a.pets, b.pets)),
      genderPreference:
        1 /
        (1 +
          distanceBetweenEnumValues(
            "genderPreference",
            a.gender_preference,
            b.gender_preference,
          )),
      roomType:
        1 /
        (1 + distanceBetweenEnumValues("roomType", a.room_type, b.room_type)),
      sleepSchedule:
        1 /
        (1 +
          distanceBetweenEnumValues(
            "sleepSchedule",
            a.sleep_schedule,
            b.sleep_schedule,
          )),
      noiseTolerance:
        1 /
        (1 +
          distanceBetweenEnumValues(
            "noiseTolerance",
            a.noise_tolerance,
            b.noise_tolerance,
          )),
      socialness:
        1 /
        (1 +
          distanceBetweenEnumValues("socialness", a.socialness, b.socialness)),
      hobbies: 1 - distanceBetweenStringValues(a.hobbies, b.hobbies),
      favoriteMusic:
        1 - distanceBetweenStringValues(a.favorite_music, b.favorite_music),
      age: 1 / (1 + distanceBetweenNumericalValues(userAAge, userBAge)),
      moveInDate: 1 / (1 + moveInDateDifference / 30),
      university:
        1 /
        (1 + distanceBetweenStringValues(userA.university, userB.university)),
      officeLocation:
        userA.office_latitude && userB.office_latitude
          ? 1 /
            (1 +
              distanceBetweenCoordinates(
                userA.office_latitude,
                userA.office_longitude,
                userB.office_latitude,
                userB.office_longitude,
              ))
          : 0.5,
    };

    let weightedSum = 0;
    let totalWeight = 0;
    for (const key in similarity) {
      const weight = weights[key] || 0;
      weightedSum += similarity[key] * weight;
      totalWeight += weight;
    }

    return weightedSum / totalWeight;
  }

  changeWeightsOnFeedback(similarity, matchStatus) {
    const delta = 0.05;
    const weights = this.getWeights();

    for (const key in similarity) {
      const sim = similarity[key];
      if (POSITIVE_STATUSES.has(matchStatus)) {
        if (sim > 0.7) {
          weights[key] = Math.min(weights[key] + delta, 1);
        }
      } else if (NEGATIVE_STATUSES.has(matchStatus)) {
        if (sim > 0.7) {
          weights[key] = Math.max(weights[key] - delta, 0.05);
        }
      }
    }

    return weights;
  }

  getTopKRecommendations(k) {
    return this.others
      .map((otherProfile) => {
        const otherUser = this.otherUsers.find(
          (user) => user.id === otherProfile.user_id,
        );
        const similarity = this.computeSimilarity(otherProfile, otherUser);
        return {
          user_id: otherProfile.user_id,
          similarity,
          profile: otherProfile,
          user: otherUser,
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }
}

module.exports = RecommendationEngine;
