import { useState, useEffect, useRef } from "react";
import Spinner from "../../components/Spinner/Spinner";
import fallbackProfilePic from "../../assets/fallback-profile-picture.png";
import ProfileModal from "../../components/ProfileModal/ProfileModal";
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
      <div className="leave-pod-button">
        <button onClick={handleLeaveRoommatePod}>Leave Pod</button>
      </div>

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
            <div
              key={member.id}
              className={`roommate-card ${flippedCards[member.id] ? "flipped" : ""}`}
              onClick={() => handleCardFlip(member.id)}
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
            >
              <div className="roommate-card-inner">
                <div className="roommate-card-front">
                  <div className="roommate-card-image">
                    <img
                      src={`/api/roommate-profile/profile-picture/${member.id}`}
                      alt={`${member.name}'s profile`}
                      onError={(e) => {
                        e.target.src = fallbackProfilePic;
                      }}
                    />
                  </div>
                  <h2>{member.name}</h2>
                </div>

                <div className="roommate-card-back">
                  <h3>{member.name}</h3>
                  <div className="roommate-info">
                    <p>
                      <strong>Email:</strong> {member.email}
                    </p>
                    {member.phone_number && (
                      <p>
                        <strong>Phone:</strong> {member.phone_number}
                      </p>
                    )}
                    {member.instagram_handle && (
                      <p>
                        <strong>Instagram:</strong> {member.instagram_handle}
                      </p>
                    )}
                    {member.company && (
                      <p>
                        <strong>Company:</strong> {member.company}
                      </p>
                    )}
                    {member.university && (
                      <p>
                        <strong>University:</strong> {member.university}
                      </p>
                    )}
                    {member.office_address && (
                      <p>
                        <strong>Office:</strong> {member.office_address}
                      </p>
                    )}
                    {member.roommate_profile.city && (
                      <p>
                        <strong>Location:</strong>{" "}
                        {member.roommate_profile.city},{" "}
                        {member.roommate_profile.state}
                      </p>
                    )}
                  </div>
                  <button
                    className="view-profile-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openProfileModal(member);
                    }}
                    onMouseEnter={() => setIsOverButton(true)}
                    onMouseLeave={() => setIsOverButton(false)}
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* hides tooltip when hovering over view profile button*/}
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
