import React from "react";
import { useState, useEffect, useMemo } from "react";
import ProfileModal from "../../components/ProfileModal/ProfileModal";
import fallbackProfilePic from "../../assets/fallback-profile-picture.png";
import Spinner from "../../components/Spinner/Spinner";
import UpdateMatchButtons from "../../components/UpdateMatchButtons/UpdateMatchButtons";
import { getBaseUrl } from "../../utils/url";

const GroupRecommendations = () => {
  const [groupOptions, setGroupOptions] = useState([]);
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchGroupRecommendations = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/matches/groups`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setGroupOptions(data);
      }
    } catch (error) {
      throw new Error("Error fetching group recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupRecommendations();
  }, []);

  // calculate total group count and current flat index using useMemo
  const { totalGroupCount, currentFlatIndex } = useMemo(() => {
    if (groupOptions.length === 0) {
      return { totalGroupCount: 0, currentFlatIndex: 0 };
    }

    let total = 0;
    let current = 0;

    for (let i = 0; i < groupOptions.length; i++) {
      if (i < currentOptionIndex) {
        current += groupOptions[i].groups.length;
      } else if (i === currentOptionIndex) {
        current += currentGroupIndex;
      }
      total += groupOptions[i].groups.length;
    }

    return { totalGroupCount: total, currentFlatIndex: current };
  }, [groupOptions, currentOptionIndex, currentGroupIndex]);

  const updateGroupMatchStatus = async (group, status) => {
    if (actionInProgress || currentOptionIndex >= groupOptions.length) {
      return;
    }

    setActionInProgress(true);

    const averageGroupSimilarityScore =
      group.members.reduce(
        (sum, member) => sum + member.averageGroupSimilarity,
        0,
      ) / group.members.length;

    try {
      const response = await fetch(`${getBaseUrl()}/api/matches/groups`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          group_id: group.group_id,
          status: status,
          similarity_score: averageGroupSimilarityScore,
          member_ids: group.members.map(
            (member) => member.userId || member.user_id,
          ),
        }),
      });

      if (response.ok) {
        moveToNextGroup();
      }
    } catch (error) {
      throw new Error("Error updating group match status:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSendGroupRequest = async () => {
    const currentOption = groupOptions[currentOptionIndex];
    const currentGroup = currentOption.groups[currentGroupIndex];

    await updateGroupMatchStatus(currentGroup, "FRIEND_REQUEST_SENT");
  };

  const handleRejectGroup = async () => {
    const currentOption = groupOptions[currentOptionIndex];
    const currentGroup = currentOption.groups[currentGroupIndex];

    await updateGroupMatchStatus(currentGroup, "REJECTED_RECOMMENDATION");
  };

  const moveToNextGroup = () => {
    const currentOption = groupOptions[currentOptionIndex];

    // check if there are more groups in the current option
    if (currentGroupIndex < currentOption.groups.length - 1) {
      setCurrentGroupIndex((prevIndex) => prevIndex + 1);
    }
    // move to the next option if there are no more groups in the current option
    else if (currentOptionIndex < groupOptions.length - 1) {
      setCurrentOptionIndex((prevIndex) => prevIndex + 1);
      setCurrentGroupIndex(0);
    } else {
      setCurrentOptionIndex(groupOptions.length);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (groupOptions.length === 0) {
    return (
      <div className="no-data-available">
        No group recommendations available at this time.
      </div>
    );
  }

  if (currentOptionIndex >= groupOptions.length) {
    return (
      <div className="no-data-available">
        You've gone through all available group recommendations!
      </div>
    );
  }

  const currentOption = groupOptions[currentOptionIndex];
  const currentGroup = currentOption.groups[currentGroupIndex];
  const averageGroupSimilarity =
    currentGroup.members.reduce(
      (sum, member) => sum + member.averageGroupSimilarity,
      0,
    ) / currentGroup.members.length;

  const membersWithProfiles = currentGroup.members.map((member) => {
    return {
      ...member,
      originalUser: member.user || {},
      originalProfile: member.profile || {},
    };
  });

  const handleMemberClick = (member) => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch(
          `${getBaseUrl()}/api/users/${member.userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();

        const profileResponse = await fetch(
          `${getBaseUrl()}/api/roommate-profile/${member.userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const profileData = await profileResponse.json();

        // restructure data to match what UserProfileDisplay expects
        const formattedMember = {
          user: userData,
          ...profileData,
          user_id: member.userId,
        };

        setSelectedMember(formattedMember);
      } catch (error) {
        throw new Error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  return (
    <div className="recommendations-container">
      <div className="recommendation-card-container">
        <div className="group-card">
          <div className="score-header">
            <p className="similarity-score">
              Similarity Score: {Math.round(averageGroupSimilarity * 100)}%
            </p>
          </div>

          <div className="group-members-container">
            <h4>Recommended Group</h4>
            <div className="group-members flex flex-col gap-3">
              {membersWithProfiles.map((member) => (
                <div
                  key={member.userId}
                  className="group-member-card cursor-pointer"
                  onClick={() => handleMemberClick(member)}
                >
                  <div className="group-member-profile-pic">
                    <img
                      src={
                        import.meta.env.DEV
                          ? `/api/roommate-profile/profile-picture/${member.userId}`
                          : `${getBaseUrl()}/api/roommate-profile/profile-picture/${member.userId}`
                      }
                      alt={`${member.name}'s profile`}
                      onError={(e) => {
                        e.target.src = fallbackProfilePic;
                      }}
                    />
                  </div>
                  <h5>{member.name}</h5>
                </div>
              ))}
            </div>

            {selectedMember && (
              <ProfileModal
                userProfile={selectedMember}
                onClose={handleCloseModal}
              />
            )}
          </div>
        </div>

        <UpdateMatchButtons
          onAccept={handleSendGroupRequest}
          onReject={handleRejectGroup}
          disabled={actionInProgress}
          isGroup={true}
        />

        <div className="recommendation-progress">
          <p>
            {currentFlatIndex + 1} of {totalGroupCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupRecommendations;
