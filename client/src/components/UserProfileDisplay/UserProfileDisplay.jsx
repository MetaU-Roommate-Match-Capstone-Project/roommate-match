import React from "react";
import { useState, useEffect } from "react";
import RoommateAttribute from "../RoommateAttribute/RoommateAttribute";
import {
  getBasicUserInfo,
  getUserRoommatePreferencesInfo,
} from "../../utils/profileAttributes";
import fallbackProfilePic from "../../assets/fallback-profile-picture.png";
import PostPictureDisplay from "../PostPictureDisplay/PostPictureDisplay";
import Spinner from "../Spinner/Spinner";
import { getBaseUrl } from "../../utils/url";

const UserProfileDisplay = ({
  userProfile,
  similarityScore = null,
  isModal = false,
  onClose = null,
  showPosts = true,
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // format user profile data
  const formattedProfile = {
    user: userProfile.user || {},
    ...(userProfile.profile || userProfile),
  };

  const basicUserInfo = getBasicUserInfo(formattedProfile);
  const roommatePreferencesInfo =
    getUserRoommatePreferencesInfo(formattedProfile);

  const userId = userProfile.user_id;

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getBaseUrl()}/api/post/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user posts");
      }

      const userPosts = await response.json();
      setPosts(userPosts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showPosts && userId) {
      fetchUserPosts();
    }
  }, [userId, showPosts]);

  const profileContent = (
    <>
      <div className="profile-header">
        <div className="score-header">
          {similarityScore !== null && (
            <p className="similarity-score">
              Match Score: {Math.round(similarityScore * 100)}%
            </p>
          )}
        </div>
        <h1>{formattedProfile.user.name}</h1>
      </div>

      <div className="profile-main">
        <div className="profile-col">
          <img
            className="profile-image"
            src={
              import.meta.env.DEV
                ? `/api/roommate-profile/profile-picture/${userId}`
                : `${getBaseUrl()}/api/roommate-profile/profile-picture/${userId}`
            }
            alt="profile-picture"
            onError={(e) => {
              e.target.src = fallbackProfilePic;
            }}
          />
          <div className="profile-details">
            {basicUserInfo.map((info, index) => (
              <RoommateAttribute
                key={index}
                attribute={info.attribute}
                value={info.value}
              />
            ))}
          </div>
        </div>

        <div className="profile-col">
          <h3 className="title">Roommate Preferences</h3>
          <div className="profile-details">
            {roommatePreferencesInfo.map((preference, index) => (
              <RoommateAttribute
                key={index}
                attribute={preference.attribute}
                value={preference.value}
              />
            ))}
          </div>
        </div>
      </div>

      {showPosts && (
        <>
          <div className="flex justify-center mb-12">
            <div className="w-full max-w-4xl">
              <hr className="border-t-2 border-[#3066BE] opacity-30" />
            </div>
          </div>

          <section className="mb-12">
            <div>
              <h3 className="title">Posts</h3>
              <div className="post-container">
                {loading ? (
                  <div className="text-center py-6">
                    <Spinner />
                  </div>
                ) : error ? (
                  <div className="text-center py-6">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="no-data-available">User has not created any posts.</div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="post-card">
                      <div className="post-header">
                        <p className="post-username">{post.user.name}</p>
                      </div>
                      <p className="post-location">
                        &#x1F4CD;{post.city}, {post.state}
                      </p>
                      <p className="post-content">{post.content}</p>
                      <PostPictureDisplay pictures={post.pictures} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );

  // wrap model container when profile is displayed in a modal
  if (isModal) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <span className="x-btn" onClick={onClose}>
            &times;
          </span>
          <div className="modal">{profileContent}</div>
        </div>
      </div>
    );
  }

  // returns profile content directly on page
  return (
    <div className="modal-content" style={{ position: "relative" }}>
      <div className="modal">{profileContent}</div>
    </div>
  );
};

export default UserProfileDisplay;
