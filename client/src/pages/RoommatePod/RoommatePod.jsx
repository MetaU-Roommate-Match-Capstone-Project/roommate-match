import { useState, useEffect } from "react";
import Spinner from "../../components/Spinner/Spinner";
import ProfileModal from "../../components/ProfileModal/ProfileModal";
import RoommateCard from "../../components/RoommateCard/RoommateCard";
import WithAuth from "../../components/WithAuth/WithAuth";
import { useNavigate } from "react-router-dom";
import "./RoomatePod.css";

const RoommatePod = () => {
  const navigate = useNavigate();
  const [roommatePod, setRoommatePod] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const [activeProfile, setActiveProfile] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [isOverButton, setIsOverButton] = useState(false);
  const [leaveGroup, setLeaveGroup] = useState(false);
  const [groupClosed, setGroupClosed] = useState(false);

  const fetchRoommatePod = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/matches/accepted", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roommate pod.");
      }

      const data = await response.json();
      setRoommatePod(data);

      // update groupClosed state based on group status
      if (data.group && data.group.group_status === "CLOSED") {
        setGroupClosed(true);
      } else {
        setGroupClosed(false);
      }

      setError(null);
    } catch (error) {
      setError(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const leaveRoommatePod = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/matches/groups/leave", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to leave roommate pod.");
      }

      await response.json();
      setRoommatePod([]);
      setLeaveGroup(true);
      fetchRoommatePod();
      setError(null);
      // direct to recommendations page
      navigate("/roommate-recommendations");
    } catch (error) {
      setError(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoommatePod = () => {
    leaveRoommatePod();
  };

  const updateGroupStatus = async () => {
    try {
      setLoading(true);
      const status = groupClosed ? "OPEN" : "CLOSED";

      const response = await fetch("/api/matches/groups/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ group_status: status }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update group status for roommate pod.");
      }

      await response.json();
      setGroupClosed(!groupClosed);
      setError(null);
    } catch (error) {
      setError(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroupStatus = () => {
    updateGroupStatus();
  };

  useEffect(() => {
    fetchRoommatePod();
  }, []);

  const handleCardFlip = (memberId) => {
    setFlippedCards((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const openProfileModal = (member) => {
    const profileData = {
      user_id: member.id,
      user: member,
      profile: member.roommate_profile,
    };
    setActiveProfile(profileData);
    setShowTooltip(false);
  };

  const closeProfileModal = () => {
    setActiveProfile(null);
  };

  if (loading) {
    return <Spinner />;
  }

  const pod = roommatePod.members;

  return (
    <div className="roommate-pod-container">
      <h1 className="pod-title">Roommate Pod</h1>

      <div className="roommate-cards-container">
        {error && <div className="error-message">{String(error)}</div>}

        {pod && pod.length === 0 && (
          <div className="empty-pod-message">
            <p>No roommates in your pod yet.</p>
            <p>Check back later to see who's joined.</p>
          </div>
        )}

        {pod &&
          pod.map((member) => (
            <RoommateCard
              key={member.id}
              member={member}
              isFlipped={flippedCards[member.id]}
              onCardFlip={handleCardFlip}
              onViewProfile={openProfileModal}
              onMouseMove={(e) => {
                // get the position relative to the viewport
                // reference for mouse tracking: https://medium.com/@ryan_forrester_/how-to-get-mouse-position-in-javascript-37e4772a3f21
                const x = e.clientX;
                const y = e.clientY - 10; // Offset to position above cursor
                setTooltipPosition({ x, y });

                // set tooltip text based on whether card is flipped
                const tooltipText = flippedCards[member.id]
                  ? "Click to flip back"
                  : "Click to flip card";
                setTooltipText(tooltipText);
                setShowTooltip(true);
              }}
              onMouseLeave={() => {
                setShowTooltip(false);
              }}
              onButtonHover={(isOver) => {
                setIsOverButton(isOver);
              }}
            />
          ))}
      </div>

      {pod && pod.length > 0 && (
        <div className="pod-buttons">
          <button onClick={handleUpdateGroupStatus}>
            {groupClosed ? "Open Pod" : "Close Pod"}
          </button>
          <button onClick={handleLeaveRoommatePod}>Leave Pod</button>
        </div>
      )}

      {/* hides tooltip when hovering over view profile button */}
      {showTooltip && !isOverButton && (
        <div
          className="cursor-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          {tooltipText}
        </div>
      )}

      {activeProfile && (
        <ProfileModal userProfile={activeProfile} onClose={closeProfileModal} />
      )}
    </div>
  );
};

export default WithAuth(RoommatePod);
