import fallbackProfilePic from "../../assets/fallback-profile-picture.png";
import { getUrl } from "../../utils/url";
import "./RoommateCard.css";

const RoommateCard = ({
  member,
  isFlipped,
  onCardFlip,
  onViewProfile,
  onMouseMove,
  onMouseLeave,
  onButtonHover,
}) => {
  return (
    <div
      className={`roommate-card ${isFlipped ? "flipped" : ""}`}
      onClick={() => onCardFlip(member.id)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="roommate-card-inner">
        <div className="roommate-card-front">
          <div className="roommate-card-image">
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
                <strong>Location:</strong> {member.roommate_profile.city},{" "}
                {member.roommate_profile.state}
              </p>
            )}
          </div>
          <button
            className="view-profile-btn"
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile(member);
            }}
            onMouseEnter={(e) => {
              e.stopPropagation();
              onButtonHover(true);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              onButtonHover(false);
            }}
          >
            View Full Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoommateCard;
