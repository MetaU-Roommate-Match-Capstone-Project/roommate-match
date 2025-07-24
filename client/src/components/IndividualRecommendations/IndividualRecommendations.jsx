import React from "react";
import { useState, useEffect, useMemo } from "react";
import UserProfileDisplay from "../../components/UserProfileDisplay/UserProfileDisplay";
import Spinner from "../../components/Spinner/Spinner";
import UpdateMatchButtons from "../../components/UpdateMatchButtons/UpdateMatchButtons";
import { getBaseUrl } from "../../utils/url";

const IndividualRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/matches`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      throw new Error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const updateMatchStatus = async (recommendedId, status, similarityScore) => {
    if (actionInProgress || currentIndex >= recommendations.length) {
      return;
    }

    setActionInProgress(true);
    try {
      const response = await fetch(`${getBaseUrl()}/api/matches`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          recommended_id: recommendedId,
          status: status,
          similarity_score: similarityScore,
        }),
      });

      if (response.ok) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      } else {
        const errorData = await response.json().catch(() => ({}));
      }
    } catch (error) {
      throw new Error("Error updating match status:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSendFriendRequest = async () => {
    const currentRecommendation = recommendations[currentIndex];
    await updateMatchStatus(
      currentRecommendation.user_id,
      "FRIEND_REQUEST_SENT",
      currentRecommendation.similarity,
    );
  };

  const handleRejectRecommendation = async () => {
    const currentRecommendation = recommendations[currentIndex];
    await updateMatchStatus(
      currentRecommendation.user_id,
      "REJECTED_RECOMMENDATION",
      currentRecommendation.similarity,
    );
  };

  if (loading) {
    return <Spinner />;
  }

  if (recommendations.length === 0) {
    return (
      <div className="no-recommendations">
        No individual roommate recommendations available at this time.
      </div>
    );
  }

  if (currentIndex >= recommendations.length) {
    return (
      <div className="no-more-recommendations">
        You've gone through all available recommendations!
      </div>
    );
  }

  const currentRecommendation = recommendations[currentIndex];

  // format the recommendation data for the profile display
  const userProfile = {
    user: currentRecommendation.user,
    ...currentRecommendation.profile,
    user_id: currentRecommendation.user_id,
  };

  return (
    <>
      <UserProfileDisplay
        userProfile={userProfile}
        similarityScore={currentRecommendation.similarity}
      />

      <UpdateMatchButtons
        onAccept={handleSendFriendRequest}
        onReject={handleRejectRecommendation}
        disabled={actionInProgress}
        isGroup={false}
      />

      <div className="recommendation-progress">
        <p>
          {currentIndex + 1} of {recommendations.length}
        </p>
      </div>
    </>
  );
};

export default IndividualRecommendations;
