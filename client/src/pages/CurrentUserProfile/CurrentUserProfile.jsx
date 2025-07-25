import React from "react";
import { useUser } from "../../contexts/UserContext";
import WithAuth from "../../components/WithAuth/WithAuth";
import NewPostModal from "../../components/NewPostModal/NewPostModal.jsx";
import RoommateAttribute from "../../components/RoommateAttribute/RoommateAttribute.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  getBasicUserInfo,
  getUserRoommatePreferencesInfo,
} from "../../utils/profileAttributes.js";
import fallbackProfilePic from "../../assets/fallback-profile-picture.png";
import { getBaseUrl } from "../../utils/url";
import PostPictureDisplay from "../../components/PostPictureDisplay/PostPictureDisplay.jsx";
import Spinner from "../../components/Spinner/Spinner.jsx";

const CurrentUserProfile = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [roommateProfile, setRoommateProfile] = useState(null);
  const [profilePicture, setProfilePicture] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${getBaseUrl()}/api/users/logout/${user.id}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (response.ok) {
        logout();
        navigate("/login");
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const localImageUrl = URL.createObjectURL(file);
    setProfilePicture(localImageUrl);

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch(
        `${getBaseUrl()}/api/roommate-profile/profile-picture/${user.id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        },
      );

      if (!response.ok) {
        setProfilePicture("");
        throw new Error("Failed to upload profile picture");
      }
    } catch (error) {
      setError(error.message);
      setProfilePicture("");
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // fetch user profile data from backend
  const fetchCurrentUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getBaseUrl()}/api/roommate-profile/me`, {
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
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorInfo = await response.json();
        throw new Error(errorInfo.error || "Failed to fetch user profile");
      }

      const currentUserProfile = await response.json();
      setRoommateProfile(currentUserProfile);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // fetch user posts
  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getBaseUrl()}/api/post/me`, {
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
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const updateBioUsingGenAi = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${getBaseUrl()}/api/roommate-profile/bio/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorInfo = await response.json();
        throw new Error(errorInfo.error || "Failed to update bio");
      }

      const result = await response.json();

      // update the roommate profile with the new bio
      setRoommateProfile({
        ...roommateProfile,
        bio: result.bio,
      });

      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const createPost = async (formData) => {
    try {
      setLoading(true);
      const response = await fetch(`${getBaseUrl()}/api/post`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorInfo = await response.json();
        throw new Error(errorInfo.error || "Failed to create post");
      }

      await fetchUserPosts();
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      setLoading(true);
      const response = await fetch(`${getBaseUrl()}/api/post/me/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete post, error: ${response.status}`);
      }

      await response.json();
      setPosts(posts.filter((post) => post.id !== postId));
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }
    fetchCurrentUserProfile();
    fetchUserPosts();
  }, [user]);

  // render spinner when loading
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-positioning">
          <Spinner />
        </div>
      </div>
    );
  }

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
      <div className="loading-container">
        <div className="loading-spinner-positioning">
          <Spinner />
        </div>
      </div>
    );
  }

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (formState) => {
    const formData = new FormData();
    formData.append("city", formState.city);
    formData.append("state", formState.state);
    formData.append("content", formState.content);
    formState.pictures.forEach((file) => {
      formData.append("pictures", file);
    });

    await createPost(formData);
  };

  const basicUserInfo = getBasicUserInfo(roommateProfile);
  const roommatePreferencesInfo =
    getUserRoommatePreferencesInfo(roommateProfile);

  // render user profile if user already logged in + created one in /roommate-profile-form
  return (
    <div>
      <section>
        <div className="profile-header">
          <h1>{roommateProfile.user.name}</h1>
        </div>

        <div className="profile-main">
          <div className="profile-col">
            <img
              className="profile-image"
              src={
                profilePicture
                  ? profilePicture
                  : import.meta.env.DEV
                    ? `/api/roommate-profile/profile-picture/${user.id}`
                    : `${getBaseUrl()}/api/roommate-profile/profile-picture/${user.id}`
              }
              alt="profile-picture"
              onError={(e) => {
                e.target.src = fallbackProfilePic;
              }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary mb-6"
            >
              Change Profile Picture
            </button>
            <div className="profile-details">
              {basicUserInfo.map((preference, index) => (
                <RoommateAttribute
                  key={index}
                  attribute={preference.attribute}
                  value={preference.value}
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
            <button
              className="btn-primary"
              onClick={updateBioUsingGenAi}
              disabled={loading}
            >
              {loading ? <Spinner /> : "Make bio with AI"}
            </button>
          </div>
        </div>
      </section>

      <div className="flex justify-center mb-12">
        <div className="w-full max-w-4xl">
          <hr className="border-t-2 border-[#3066BE] opacity-30" />
        </div>
      </div>

      <section className="mb-12">
        <div>
          <div className="my-posts-header">
            <div className="my-posts-header-spacer"></div>
            <h3 className="title">My Posts</h3>
            <div className="my-posts-button-container">
              <button className="btn-primary" onClick={openModal}>
                + Create a New Post
              </button>
            </div>
          </div>
          <NewPostModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSubmit={handleSubmit}
          ></NewPostModal>
          <div className="post-container">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No posts available.</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="post-card">
                  <button className="x-btn" onClick={() => deletePost(post.id)}>
                    ×
                  </button>
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
