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
  const [isLoading, setIsLoading] = useState(true);
  const [popup, setPopup] = useState(null);

  // check if user has a roommate profile
  // if not, show the create profile popup that redirects to the profile page
  useEffect(() => {
    if (user) {
      if (!hasRoommateProfile) {
        setPopup("create-profile");
        setIsLoading(false);
      } else {
        setPopup(null);
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
              setPopup(null);
            } else {
              setPopup("recommendation-type");
            }
          } else {
            setPopup("recommendation-type");
          }
        } catch (error) {
          setPopup("recommendation-type");
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
        setPopup(null);
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  // determine which content should be rendered based on the popup state and recommendation type
  const displayCreateProfilePopup = popup === "create-profile";
  const displayRecommendationTypePopup = popup === "recommendation-type";
  const displayIndividualRecommendations =
    popup === null && recommendationType === "individual";
  const displayGroupRecommendations =
    popup === null && recommendationType === "group";

  const displayContent = () => {
    if (displayCreateProfilePopup) {
      return <CreateProfilePopup />;
    }

    if (displayRecommendationTypePopup) {
      return (
        <RecommendationTypePopup onSelect={handleRecommendationTypeSelect} />
      );
    }

    if (displayIndividualRecommendations) {
      return <IndividualRecommendations />;
    }

    if (displayGroupRecommendations) {
      return <GroupRecommendations />;
    }

    return null;
  };

  return (
    <div className="recommendations-page">
      {isLoading ? <Spinner /> : displayContent()}
    </div>
  );
};

export default WithAuth(Recommendations);
