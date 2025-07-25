import React from "react";
import { useState, useEffect } from "react";
import WithAuth from "../../components/WithAuth/WithAuth";
import { useUser } from "../../contexts/UserContext";
import Spinner from "../../components/Spinner/Spinner";
import RecommendationTypePopup from "../../components/RecommendationTypePopup/RecommendationTypePopup";
import IndividualRecommendations from "../../components/IndividualRecommendations/IndividualRecommendations";
import GroupRecommendations from "../../components/GroupRecommendations/GroupRecommendations";
import { getBaseUrl } from "../../utils/url";

const Recommendations = () => {
  const { user, recommendationType, setRecommendationType } = useUser();
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // call the recommendation card component and have buttons below it to either Send friend request or reject the recommendation
  useEffect(() => {
    // check if the user has a recommendation type preference
    const checkRecommendationType = async () => {
      if (user) {
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
              setShowPopup(false);
            } else {
              setShowPopup(true);
            }
          } else {
            setShowPopup(true);
          }
        } catch (error) {
          setShowPopup(true);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkRecommendationType();
  }, [user, setRecommendationType]);

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
        setShowPopup(false);
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
          {showPopup && (
            <RecommendationTypePopup onSelect={handleRecommendationTypeSelect} />
          )}
          {!showPopup && recommendationType === "individual" && (
            <IndividualRecommendations />
          )}
          {!showPopup && recommendationType === "group" && <GroupRecommendations />}
        </>
      )}
    </div>
  );
};

export default WithAuth(Recommendations);
