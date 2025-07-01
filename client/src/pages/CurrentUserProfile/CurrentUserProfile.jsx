import React from "react";
import { useUser } from "../../contexts/UserContext";
import WithAuth from "../../components/WithAuth/WithAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  cleanlinessMap,
  petsMap,
  roomTypesMap,
  sleepScheduleMap,
  noiseToleranceMap,
  socialnessMap,
} from "../../utils/enums.jsx";

const CurrentUserProfile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [roommateProfile, setRoommateProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      const response = await fetch(`/api/users/logout/${user.id}`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // fetch user profile data from backend
  const fetchCurrentUserProfile = async () => {
    try {
      setError("");
      const response = await fetch("/api/roommate-profile/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // if user has not created a profile yet, redirect to /roommate-profile-form after 10 seconds
      if (response.status === 404) {
        setError(
          "No profile created yet, please create one in the roommate profile tab to view your profile!",
        );
        setTimeout(() => {
          navigate("/roommate-profile-form");
        }, 10000);
        return;
      }

      if (!response.ok) {
        const errorInfo = await response.json();
        throw new Error(errorInfo.error || "Failed to fetch user profile");
      }

      const currentUserProfile = await response.json();
      setRoommateProfile(currentUserProfile);
    } catch (error) {
      console.error("Error fetching currently signed in user profile: ", error);
      setError(error.message);
    }
  };

  // fetch user posts
  const fetchUserPosts = async () => {
    try {
      const response = await fetch("/api/post/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorInfo = await response.json();
        throw new Error(errorInfo.error || "Failed to fetch user posts");
      }
      const currentUserPosts = await response.json();
      setPosts(currentUserPosts);
    } catch (error) {
      console.error("Error fetching user posts: ", error);
    }
  };

  const deletePost = async (postId) => {
    fetch(`/api/post/me/${postId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to delete post, error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setPosts(posts.filter((post) => post.id !== postId));
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
      });
  };

  useEffect(
    () => {
      if (!user) {
        return;
      }
      fetchCurrentUserProfile();
      fetchUserPosts();
    },
    [user],
    posts,
  );

  // render error message if user has not created a profile yet
  if (error) {
    return (
      <>
        <div className="profile-container">
          <div className="profile-card">
            <h2>Your Profile</h2>
            <div className="error-message">{error}</div>
          </div>
        </div>
        <button className="btn-primary" onClick={handleLogout}>
          Logout
        </button>
      </>
    );
  }

  // loading message while user profile is being fetched
  if (!roommateProfile) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>Loading your profile...</h2>
        </div>
      </div>
    );
  }

  let userCleanliness = cleanlinessMap[roommateProfile.cleanliness];
  let userPets = petsMap[roommateProfile.pets];
  let userRoomType = roomTypesMap[roommateProfile.room_type];
  let numRoommates = roommateProfile.num_roommates;
  let leaseDuration = roommateProfile.lease_duration;
  let moveInDate = new Date(roommateProfile.move_in_date).toLocaleDateString();
  let userSleepSchedule = sleepScheduleMap[roommateProfile.sleep_schedule];
  let userNoiseTolerance = noiseToleranceMap[roommateProfile.noise_tolerance];
  let userSocialness = socialnessMap[roommateProfile.socialness];
  let favoriteMusic = roommateProfile.favorite_music;
  let status = roommateProfile.user.intern_or_new_grad;
  let budget = roommateProfile.user.budget_max;

  // render user profile if user already logged in + created one in /roommate-profile-form
  return (
    <div>
      <section>
        <div className="profile-container">
          <div className="profile-card">
            <h2>{roommateProfile.user.name}</h2>
            <div className="profile-details">
              <p>
                <strong>Location: </strong> {roommateProfile.city},{" "}
                {roommateProfile.state}
              </p>
              <p>
                <strong>Company: </strong> {roommateProfile.user.company}
              </p>
              <p>
                <strong>University: </strong> {roommateProfile.user.university}
              </p>
              <p>
                <strong>Status: </strong> {status}
              </p>
              <p>
                <strong>Budget: </strong> ${budget}.00
              </p>
              <p>
                <strong>Cleanliness: </strong> {userCleanliness}
              </p>
              <p>
                <strong>Smokes: </strong>
                {roommateProfile.smoke ? "Yes" : "No"}
              </p>
              <p>
                <strong>Pets: </strong> {userPets}
              </p>
              <p>
                <strong>Room Type: </strong> {userRoomType}
              </p>
              <p>
                <strong>Number of Roommates I am looking for: </strong>{" "}
                {numRoommates}
              </p>
              <p>
                <strong>Move In Date: </strong> {moveInDate}
              </p>
              <p>
                <strong>Lease Duration: </strong>
                {leaseDuration}
              </p>
              <p>
                <strong>Sleep Schedule: </strong> {userSleepSchedule}
              </p>
              <p>
                <strong>Noise Tolerance: </strong> {userNoiseTolerance}
              </p>
              <p>
                <strong>Socialness: </strong> {userSocialness}
              </p>
              <p>
                <strong>Hobbies: </strong>
                {roommateProfile.hobbies}
              </p>
              <p>
                <strong>Favorite Music: </strong>
                {favoriteMusic}
              </p>
              <p>
                <strong>Bio: </strong>
                {roommateProfile.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-center mb-12">
        <div className="w-full max-w-4xl">
          <hr className="border-t-2 border-[#3066BE] opacity-30" />
        </div>
      </div>

      <section className="mb-12">
        <div className="profile-card">
          <h2>My Posts</h2>
          <div className="post-container">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No posts available.</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="post-card">
                  <button
                    className="delete-btn"
                    onClick={() => deletePost(post.id)}
                  >
                    ×
                  </button>
                  <div className="post-header">
                    <p className="post-username">{post.user.name}</p>
                  </div>
                  <p className="post-location">
                    📍{post.city}, {post.state}
                  </p>
                  <p className="post-content">{post.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <div className="flex justify-center mb-8">
        <div className="w-full max-w-4xl">
          <hr className="border-t-2 border-[#3066BE] opacity-30" />
        </div>
      </div>

      <section className="text-center pb-8">
        <button
          className="btn-primary text-lg px-8 py-4"
          onClick={handleLogout}
        >
          Logout
        </button>
      </section>
    </div>
  );
};

export default WithAuth(CurrentUserProfile);
