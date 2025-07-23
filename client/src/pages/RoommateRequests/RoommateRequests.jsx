import { useState, useEffect } from "react";
import Spinner from "../../components/Spinner/Spinner";
import ProfileModal from "../../components/ProfileModal/ProfileModal";
import fallbackProfilePic from "../../assets/fallback-profile-picture.png";
import WithAuth from "../../components/WithAuth/WithAuth";
import UpdateMatchButtons from "../../components/UpdateMatchButtons/UpdateMatchButtons";
import { getUrl } from "../../utils/url";

const RoommateRequests = () => {
  const [roommateRequests, setRoommateRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchRoommateRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getUrl()}/api/matches/friend-requests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch friend requests");
      }

      const data = await response.json();
      setRoommateRequests(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoommateRequests();

    const interval = setInterval(() => {
      setRefreshCounter((prev) => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (refreshCounter > 0) {
      fetchRoommateRequests();
    }
  }, [refreshCounter]);

  const handleMemberClick = async (member) => {
    try {
      // fetch user data
      const userResponse = await fetch(`${getUrl()}/api/users/${member.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userResponse.json();

      // fetch roommate profile data
      const profileResponse = await fetch(
        `${getUrl()}/api/roommate-profile/${member.id}`,
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

      // format the data for the ProfileModal
      const formattedMember = {
        user: userData,
        ...profileData,
        user_id: member.id,
      };

      setSelectedMember(formattedMember);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  const handleAcceptRequest = async (request) => {
    if (actionInProgress) {
      return;
    }

    setActionInProgress(true);
    try {
      const response = await fetch(`${getUrl()}/api/matches`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          recommended_id: request.sender.id,
          status: "ACCEPTED",
          similarity_score: request.matches[0]?.similarityScore || 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept friend request");
      }

      await fetchRoommateRequests();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRejectRequest = async (request) => {
    if (actionInProgress) {
      return;
    }

    setActionInProgress(true);
    try {
      if (!request.isGroupRequest) {
        const response = await fetch(`${getUrl()}/api/matches`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            recommended_id: request.sender.id,
            status: "REJECTED_BY_RECIPIENT",
            similarity_score: request.matches[0]?.similarityScore || 0,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to reject friend request");
        }
      } else {
        const memberIds = [
          request.sender.id,
          ...request.members.map((member) => member.id),
        ];

        const response = await fetch(`${getUrl()}/api/matches/groups`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: "REJECTED_BY_RECIPIENT",
            similarity_score: request.matches[0]?.similarityScore || 0,
            member_ids: memberIds,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to reject group request");
        }
      }

      await fetchRoommateRequests();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      {error && <div className="error-message">{error}</div>}

      <div className="profile-header">
        <h1>Roommate Requests</h1>
      </div>

      {roommateRequests.length === 0 && (
        <div className="recommendation-card-container">
          <p>No roommate requests to display</p>
        </div>
      )}

      <div className="recommendation-card-container">
        {roommateRequests.map((request, index) => (
          <div key={index} className="group-card">
            <div className="group-members-container">
              <div className="group-members">
                {request.sender && (
                  <div
                    key={request.sender.id}
                    className="group-member-card"
                    onClick={() => {
                      handleMemberClick(request.sender);
                    }}
                  >
                    <div className="group-member-profile-pic">
                      <img
                        src={
                          import.meta.env.DEV
                            ? `/api/roommate-profile/profile-picture/${request.sender.id}`
                            : `${getUrl()}/api/roommate-profile/profile-picture/${request.sender.id}`
                        }
                        alt={`${request.sender.name}'s profile`}
                        onError={(e) => {
                          e.target.src = fallbackProfilePic;
                        }}
                      />
                    </div>
                    <h5>{request.sender.name}</h5>
                    <span className="text-xs text-[#3066BE]">Sender</span>
                  </div>
                )}

                {/* Display potential group members if it's a group request */}
                {request.isGroupRequest &&
                  request.members.length > 0 &&
                  request.members.map((member) => (
                    <div
                      key={member.id}
                      className="group-member-card cursor-pointer"
                      onClick={() => {
                        handleMemberClick(member);
                      }}
                    >
                      <div className="group-member-profile-pic">
                        <img
                          src={
                            import.meta.env.DEV
                              ? `/api/roommate-profile/profile-picture/${member.id}`
                              : `${getUrl()}/api/roommate-profile/profile-picture/${member.id}`
                          }
                          alt={`${member.name}'s profile`}
                          onError={(e) => {
                            e.target.src = fallbackProfilePic;
                          }}
                        />
                      </div>
                      <h5>{member.name}</h5>
                      <span className="text-xs text-[#3066BE]">
                        Potential Member
                      </span>
                    </div>
                  ))}

                {/* Display existing group members if the sender is already in a group */}
                {request.existingGroupMembers &&
                  request.existingGroupMembers.length > 0 && (
                    <>
                      {request.existingGroupMembers.map((member) => (
                        <div
                          key={member.id}
                          className="group-member-card cursor-pointer"
                          onClick={() => {
                            handleMemberClick(member);
                          }}
                        >
                          <div className="group-member-profile-pic">
                            <img
                              src={
                                import.meta.env.DEV
                                  ? `/api/roommate-profile/profile-picture/${member.id}`
                                  : `${getUrl()}/api/roommate-profile/profile-picture/${member.id}`
                              }
                              alt={`${member.name}'s profile`}
                              onError={(e) => {
                                e.target.src = fallbackProfilePic;
                              }}
                            />
                          </div>
                          <h5>{member.name}</h5>
                          <span className="text-xs text-[#3066BE]">
                            Existing Member
                          </span>
                        </div>
                      ))}
                    </>
                  )}
              </div>
            </div>

            <div className="mt-6">
              <UpdateMatchButtons
                onAccept={() => handleAcceptRequest(request)}
                onReject={() => handleRejectRequest(request)}
                disabled={actionInProgress}
                isGroup={request.isGroupRequest}
                isFriendRequest={true}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <ProfileModal userProfile={selectedMember} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default WithAuth(RoommateRequests);
