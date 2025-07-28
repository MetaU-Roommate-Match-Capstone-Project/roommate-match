import { useState, useEffect } from "react";
import WithAuth from "../../components/WithAuth/WithAuth";
import { useUser } from "../../contexts/UserContext";
import Spinner from "../../components/Spinner/Spinner";
import RecommendationTypePopup from "../../components/RecommendationTypePopup/RecommendationTypePopup";
import CreateProfilePopup from "../../components/CreateProfilePopup/CreateProfilePopup";
import IndividualRecommendations from "../../components/IndividualRecommendations/IndividualRecommendations";
import GroupRecommendations from "../../components/GroupRecommendations/GroupRecommendations";
import { getBaseUrl } from "../../utils/url";

const Recommendations = () => {
  const {
    user,
    recommendationType,
    setRecommendationType,
    hasRoommateProfile,
  } = useUser();
  const [showRecommendationTypePopup, setShowRecommendationTypePopup] =
    useState(false);
  const [showCreateProfilePopup, setShowCreateProfilePopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // check if user has a roommate profile
  // if not, show the create profile popup that redirects to the profile page
  useEffect(() => {
    if (user) {
      if (!hasRoommateProfile) {
        setShowCreateProfilePopup(true);
        setIsLoading(false);
      } else {
        setShowCreateProfilePopup(false);
      }
    }
  }, [user, hasRoommateProfile]);

  useEffect(() => {
    // check if the user has a recommendation type preference
    const checkRecommendationType = async () => {
      if (user && hasRoommateProfile) {
        setIsLoading(true);
        try {
          const response = await fetch(`${getBaseUrl()}/api/users/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (response.ok) {
            const userData = await response.json();
            if (userData.recommendation_type) {
              setRecommendationType(userData.recommendation_type);
              setShowRecommendationTypePopup(false);
            } else {
              setShowRecommendationTypePopup(true);
            }
          } else {
            setShowRecommendationTypePopup(true);
          }
        } catch (error) {
          setShowRecommendationTypePopup(true);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkRecommendationType();
  }, [user, hasRoommateProfile, setRecommendationType]);

  const handleRecommendationTypeSelect = async (type) => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/api/users/recommendation-type`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recommendationType: type }),
          credentials: "include",
        },
      );

      if (response.ok) {
        setRecommendationType(type);
        setShowRecommendationTypePopup(false);
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <div className="recommendations-page">
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {showCreateProfilePopup && <CreateProfilePopup />}
          {!showCreateProfilePopup && showRecommendationTypePopup && (
            <RecommendationTypePopup
              onSelect={handleRecommendationTypeSelect}
            />
          )}
          {!showCreateProfilePopup &&
            !showRecommendationTypePopup &&
            recommendationType === "individual" && (
              <IndividualRecommendations />
          )}
          {!showCreateProfilePopup &&
            !showRecommendationTypePopup &&
            recommendationType === "group" && (
            <GroupRecommendations />
          )}
        </>
      )}
    </div>
  );
};

export default WithAuth(Recommendations);
