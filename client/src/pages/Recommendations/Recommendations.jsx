import React from "react";
import { useState, useEffect } from "react";
import WithAuth from "../../components/WithAuth/WithAuth";
import { useUser } from "../../contexts/UserContext";
import Spinner from "../../components/Spinner/Spinner";
import RecommendationTypePopup from "../../components/RecommendationTypePopup/RecommendationTypePopup";
import IndividualRecommendations from "../../components/IndividualRecommendations/IndividualRecommendations";
import GroupRecommendations from "../../components/GroupRecommendations/GroupRecommendations";
import { getUrl } from "../../utils/url";

const Recommendations = () => {
  const { user, recommendationType, setRecommendationType } = useUser();
  const [showPopup, setShowPopup] = useState(false);

  // call the recommendation card component and have buttons below it to either Send friend request or reject the recommendation
  useEffect(() => {
    // check if the user has a recommendation type preference
    const checkRecommendationType = async () => {
      if (user && recommendationType === null) {
        try {
          const response = await fetch(`${getUrl()}/api/users/me`, {
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
            } else {
              setShowPopup(true);
            }
          } else {
            setShowPopup(true);
          }
        } catch (error) {
          setShowPopup(true);
        }
      }
    };

    checkRecommendationType();
  }, [user, recommendationType, setRecommendationType]);

  const handleRecommendationTypeSelect = async (type) => {
    try {
      const response = await fetch(`${getUrl()}/api/users/recommendation-type`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recommendationType: type }),
        credentials: "include",
      });

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
      {showPopup && (
        <RecommendationTypePopup onSelect={handleRecommendationTypeSelect} />
      )}
      {!showPopup && recommendationType === "individual" && (
        <IndividualRecommendations />
      )}
      {!showPopup && recommendationType === "group" && <GroupRecommendations />}
      {!showPopup && !recommendationType && <Spinner />}
    </div>
  );
};

export default WithAuth(Recommendations);
