import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WithAuth from "../WithAuth/WithAuth";
import { useUser } from "../../contexts/UserContext";
import { getBaseUrl } from "../../utils/url";
import RankingSlider from "../RankingSlider/RankingSlider";
import Spinner from "../Spinner/Spinner";

const RoommateProfileForm = () => {
  const {
    user,
    hasRoommateProfile,
    setHasRoommateProfile,
    checkIfUserHasRoommateProfile,
  } = useUser();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    id: user.id,
    city: "",
    state: "",
    cleanliness: "",
    cleanlinessWeight: 0,
    smokes: null,
    smokesWeight: 0,
    pets: "",
    petsWeight: 0,
    genderPreference: "",
    genderPreferenceWeight: 0,
    roomType: "",
    roomTypeWeight: 0,
    numRoommates: "",
    numRoommatesWeight: 0,
    leaseDuration: "",
    moveInMonth: "",
    moveInDay: "",
    moveInYear: "",
    sleepSchedule: "",
    sleepScheduleWeight: 0,
    noiseTolerance: "",
    noiseToleranceWeight: 0,
    socialness: "",
    socialnessWeight: 0,
    hobbies: "",
    hobbiesWeight: 0,
    favoriteMusic: "",
    favoriteMusicWeight: 0,
    bio: "",
  });

  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // redirect to recommendations page if user already has a roommate profile
  useEffect(() => {
    const checkProfile = async () => {
      await checkIfUserHasRoommateProfile();
      if (hasRoommateProfile) {
        navigate("/roommate-recommendations");
      }
    };

    if (user) {
      checkProfile();
    }
  }, [user, hasRoommateProfile, checkIfUserHasRoommateProfile, navigate]);

  const createRoommateProfile = async (userData) => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/roommate-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save roommate profile preferences",
        );
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateFormField = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    // input validation error messages
    if (!formState.cleanliness) {
      setSubmitError("Please select a cleanliness preference");
      setIsSubmitting(false);
      return;
    }

    // check that smokes has a value
    if (formState.smokes === null) {
      setSubmitError("Please select a smoking preference");
      setIsSubmitting(false);
      return;
    }

    if (!formState.pets) {
      setSubmitError("Please select a pet preference");
      setIsSubmitting(false);
      return;
    }

    if (!formState.genderPreference) {
      setSubmitError("Please select a gender preference");
      setIsSubmitting(false);
      return;
    }

    if (!formState.roomType) {
      setSubmitError("Please select a room type preference");
      setIsSubmitting(false);
      return;
    }

    if (!parseInt(formState.numRoommates)) {
      setSubmitError("Please enter a number of roommates");
      setIsSubmitting(false);
      return;
    }

    if (!parseInt(formState.leaseDuration)) {
      setSubmitError("Please enter a lease duration");
      setIsSubmitting(false);
      return;
    }

    if (!formState.sleepSchedule) {
      setSubmitError("Please select a sleep schedule preference");
      setIsSubmitting(false);
      return;
    }

    if (!formState.noiseTolerance) {
      setSubmitError("Please select a noise tolerance preference");
      setIsSubmitting(false);
      return;
    }

    if (!formState.socialness) {
      setSubmitError("Please select a socialness preference");
      setIsSubmitting(false);
      return;
    }

    try {
      const moveInDate = new Date(
        parseInt(formState.moveInYear),
        parseInt(formState.moveInMonth) - 1,
        parseInt(formState.moveInDay),
      );

      // check that move in date is in the future (not before date user fills out form)
      let today = new Date();
      if (moveInDate < today) {
        setSubmitError("Please select a valid move in date");
        setIsSubmitting(false);
        return;
      }

      const moveIn = moveInDate.toISOString();

      const userData = {
        id: formState.id,
        city: formState.city,
        state: formState.state,
        cleanliness: formState.cleanliness,
        smokes: formState.smokes,
        pets: formState.pets,
        genderPreference: formState.genderPreference,
        roomType: formState.roomType,
        numRoommates: parseInt(formState.numRoommates),
        leaseDuration: parseInt(formState.leaseDuration),
        moveInDate: moveIn,
        sleepSchedule: formState.sleepSchedule,
        noiseTolerance: formState.noiseTolerance,
        socialness: formState.socialness,
        hobbies: formState.hobbies,
        favoriteMusic: formState.favoriteMusic,
        bio: formState.bio,
        cleanlinessWeight: formState.cleanlinessWeight,
        smokesWeight: formState.smokesWeight,
        petsWeight: formState.petsWeight,
        genderPreferenceWeight: formState.genderPreferenceWeight,
        roomTypeWeight: formState.roomTypeWeight,
        numRoommatesWeight: formState.numRoommatesWeight,
        sleepScheduleWeight: formState.sleepScheduleWeight,
        noiseToleranceWeight: formState.noiseToleranceWeight,
        socialnessWeight: formState.socialnessWeight,
        hobbiesWeight: formState.hobbiesWeight,
        favoriteMusicWeight: formState.favoriteMusicWeight,
      };

      await createRoommateProfile(userData);

      setHasRoommateProfile(true);
      navigate("/roommate-recommendations");
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="form-container">
        <div className="form-card">
          <h2>Build your roommate profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="city">
                City where you are looking to lease:
              </label>
              <input
                className="form-input"
                type="city"
                id="city"
                value={formState.city}
                onChange={(e) => updateFormField("city", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="state">
                State
              </label>
              <input
                className="form-input"
                type="state"
                maxLength="2"
                id="state"
                value={formState.state}
                onChange={(e) =>
                  updateFormField("state", e.target.value.toUpperCase())
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cleanliness</label>
              <div className="button-group">
                <button
                  type="button"
                  className={`btn-option ${formState.cleanliness === "VERY_DIRTY" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("cleanliness", "VERY_DIRTY")}
                >
                  Very Dirty
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.cleanliness === "DIRTY" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("cleanliness", "DIRTY")}
                >
                  Dirty
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.cleanliness === "MEDIUM" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("cleanliness", "MEDIUM")}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.cleanliness === "CLEAN" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("cleanliness", "CLEAN")}
                >
                  Clean
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.cleanliness === "VERY_CLEAN" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("cleanliness", "VERY_CLEAN")}
                >
                  Very Clean
                </button>
              </div>
            </div>

            <div className="form-group">
              <RankingSlider
                label="Rank how important cleanliness is to you:"
                value={formState.cleanlinessWeight * 100}
                onChange={(value) =>
                  updateFormField("cleanlinessWeight", value)
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Smokes</label>
              <div className="button-group">
                <button
                  type="button"
                  className={`btn-option ${formState.smokes === true ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("smokes", true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.smokes === false ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("smokes", false)}
                >
                  No
                </button>
              </div>
            </div>

            <div className="form-group">
              <RankingSlider
                label="Rank how important smoking preference is to you:"
                value={formState.smokesWeight * 100}
                onChange={(value) => updateFormField("smokesWeight", value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                What pets are you comfortable with, if any?
              </label>
              <div className="button-group">
                <button
                  type="button"
                  className={`btn-option ${formState.pets === "NO_PETS" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("pets", "NO_PETS")}
                >
                  No Pets
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.pets === "CATS_ONLY" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("pets", "CATS_ONLY")}
                >
                  Cats Only
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.pets === "DOGS_ONLY" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("pets", "DOGS_ONLY")}
                >
                  Dogs Only
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.pets === "CATS_AND_DOGS" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("pets", "CATS_AND_DOGS")}
                >
                  Cats and Dogs
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.pets === "OKAY_WITH_ANY_PET" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("pets", "OKAY_WITH_ANY_PET")}
                >
                  Okay with any pet
                </button>
              </div>
            </div>

            <div className="form-group">
              <RankingSlider
                label="Rank how important pet preference is to you:"
                value={formState.petsWeight * 100}
                onChange={(value) => updateFormField("petsWeight", value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                What is your gender preference for a roommate?
              </label>
              <div className="button-group">
                <button
                  type="button"
                  className={`btn-option ${formState.genderPreference === "NO_PREFERENCE" ? "btn-option-selected" : ""}`}
                  onClick={() =>
                    updateFormField("genderPreference", "NO_PREFERENCE")
                  }
                >
                  No Preference
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.genderPreference === "MALE" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("genderPreference", "MALE")}
                >
                  Male
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.genderPreference === "FEMALE" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("genderPreference", "FEMALE")}
                >
                  Female
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.genderPreference === "NONBINARY" ? "btn-option-selected" : ""}`}
                  onClick={() =>
                    updateFormField("genderPreference", "NONBINARY")
                  }
                >
                  Non-binary
                </button>
              </div>
            </div>

            <div className="form-group">
              <RankingSlider
                label="Rank how important gender preference is to you:"
                value={formState.genderPreferenceWeight * 100}
                onChange={(value) =>
                  updateFormField("genderPreferenceWeight", value)
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                What type of lease are you looking for?
              </label>
              <div className="button-group">
                <button
                  type="button"
                  className={`btn-option ${formState.roomType === "PRIVATE_ROOM_IN_APARTMENT" ? "btn-option-selected" : ""}`}
                  onClick={() =>
                    updateFormField("roomType", "PRIVATE_ROOM_IN_APARTMENT")
                  }
                >
                  Private room in an apartment
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.roomType === "SHARED_ROOM" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("roomType", "SHARED_ROOM")}
                >
                  Shared room
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.roomType === "PRIVATE_ROOM_IN_HOUSE" ? "btn-option-selected" : ""}`}
                  onClick={() =>
                    updateFormField("roomType", "PRIVATE_ROOM_IN_HOUSE")
                  }
                >
                  Private room in a house
                </button>
              </div>
            </div>

            <div className="form-group">
              <RankingSlider
                label="Rank how important room type is to you:"
                value={formState.roomTypeWeight * 100}
                onChange={(value) => updateFormField("roomTypeWeight", value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="numRoommates">
                How many roommates are you looking for?
              </label>
              <input
                className="form-input"
                type="text"
                id="numRoommates"
                value={formState.numRoommates}
                onChange={(e) =>
                  updateFormField("numRoommates", e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <RankingSlider
                label="Rank how important the number of roommates is to you:"
                value={formState.numRoommatesWeight * 100}
                onChange={(value) =>
                  updateFormField("numRoommatesWeight", value)
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Move in Date</label>
              <div className="date-container">
                <input
                  type="text"
                  placeholder="MM"
                  maxLength="2"
                  value={formState.moveInMonth}
                  onChange={(e) =>
                    updateFormField("moveInMonth", e.target.value)
                  }
                  className="form-input-small"
                  required
                />
                <span className="date-separator">/</span>
                <input
                  type="text"
                  placeholder="DD"
                  maxLength="2"
                  value={formState.moveInDay}
                  onChange={(e) => updateFormField("moveInDay", e.target.value)}
                  className="form-input-small"
                  required
                />
                <span className="date-separator">/</span>
                <input
                  type="text"
                  placeholder="YYYY"
                  maxLength="4"
                  value={formState.moveInYear}
                  onChange={(e) =>
                    updateFormField("moveInYear", e.target.value)
                  }
                  className="form-input-medium"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="leaseDuration">
                How many months will you want to lease for?
              </label>
              <input
                className="form-input"
                type="text"
                id="leaseDuration"
                value={formState.leaseDuration}
                onChange={(e) =>
                  updateFormField("leaseDuration", e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                What is your sleep schedule like?
              </label>
              <div className="button-group">
                <button
                  type="button"
                  className={`btn-option ${formState.sleepSchedule === "NO_PREFERENCE" ? "btn-option-selected" : ""}`}
                  onClick={() =>
                    updateFormField("sleepSchedule", "NO_PREFERENCE")
                  }
                >
                  No Preference
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.sleepSchedule === "EARLY_RISER" ? "btn-option-selected" : ""}`}
                  onClick={() =>
                    updateFormField("sleepSchedule", "EARLY_RISER")
                  }
                >
                  Early riser
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.sleepSchedule === "LATE_SLEEPER" ? "btn-option-selected" : ""}`}
                  onClick={() =>
                    updateFormField("sleepSchedule", "LATE_SLEEPER")
                  }
                >
                  Late sleeper
                </button>
              </div>
            </div>

            <div className="form-group">
              <RankingSlider
                label="Rank how important sleep schedule is to you:"
                value={formState.sleepScheduleWeight * 100}
                onChange={(value) =>
                  updateFormField("sleepScheduleWeight", value)
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                What is your noise tolerance?
              </label>
              <div className="button-group">
                <button
                  type="button"
                  className={`btn-option ${formState.noiseTolerance === "QUIET" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("noiseTolerance", "QUIET")}
                >
                  Quiet
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.noiseTolerance === "SOMEWHAT_QUIET" ? "btn-option-selected" : ""}`}
                  onClick={() =>
                    updateFormField("noiseTolerance", "SOMEWHAT_QUIET")
                  }
                >
                  Somewhat Quiet
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.noiseTolerance === "SOMEWHAT_NOISY" ? "btn-option-selected" : ""}`}
                  onClick={() =>
                    updateFormField("noiseTolerance", "SOMEWHAT_NOISY")
                  }
                >
                  Somewhat Noisy
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.noiseTolerance === "NOISY" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("noiseTolerance", "NOISY")}
                >
                  Noisy
                </button>
              </div>
            </div>

            <div className="form-group">
              <RankingSlider
                label="Rank how important noise tolerance is to you:"
                value={formState.noiseToleranceWeight * 100}
                onChange={(value) =>
                  updateFormField("noiseToleranceWeight", value)
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">How social are you?</label>
              <div className="button-group">
                <button
                  type="button"
                  className={`btn-option ${formState.socialness === "LONER" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("socialness", "LONER")}
                >
                  Loner
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.socialness === "SOMEWHAT_SOCIAL" ? "btn-option-selected" : ""}`}
                  onClick={() =>
                    updateFormField("socialness", "SOMEWHAT_SOCIAL")
                  }
                >
                  Somewhat Social
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.socialness === "SOCIAL" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("socialness", "SOCIAL")}
                >
                  Social
                </button>
                <button
                  type="button"
                  className={`btn-option ${formState.socialness === "VERY_SOCIAL" ? "btn-option-selected" : ""}`}
                  onClick={() => updateFormField("socialness", "VERY_SOCIAL")}
                >
                  Very Social
                </button>
              </div>
            </div>

            <div className="form-group">
              <RankingSlider
                label="Rank how important socialness is to you:"
                value={formState.socialnessWeight * 100}
                onChange={(value) => updateFormField("socialnessWeight", value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="hobbies">
                What are some of your hobbies?
              </label>
              <input
                className="form-input"
                type="text"
                id="hobbies"
                value={formState.hobbies}
                onChange={(e) => updateFormField("hobbies", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <RankingSlider
                label="Rank how important shared hobbies are to you:"
                value={formState.hobbiesWeight * 100}
                onChange={(value) => updateFormField("hobbiesWeight", value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="favoriteMusic">
                What is your favorite music genre?
              </label>
              <input
                className="form-input"
                type="text"
                id="favoriteMusic"
                value={formState.favoriteMusic}
                onChange={(e) =>
                  updateFormField("favoriteMusic", e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <RankingSlider
                label="Rank how important music taste is to you:"
                value={formState.favoriteMusicWeight * 100}
                onChange={(value) =>
                  updateFormField("favoriteMusicWeight", value)
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bio">
                Write a short bio about yourself:
              </label>
              <input
                className="form-input"
                type="text"
                id="bio"
                value={formState.bio}
                onChange={(e) => updateFormField("bio", e.target.value)}
                required
              />
            </div>

            {submitError && <div className="error-message">{submitError}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : "Match me!"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default WithAuth(RoommateProfileForm);
