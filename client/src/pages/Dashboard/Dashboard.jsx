import React from "react";
import { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import WithAuth from "../../components/WithAuth/WithAuth";
import ProfileModal from "../../components/ProfileModal/ProfileModal";
import fallbackProfilePic from "../../assets/fallback-profile-picture.png";
import PostPictureDisplay from "../../components/PostPictureDisplay/PostPictureDisplay";

const Dashboard = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const {fetchPosts, nextCursor, hasNextPage, loading} = useFetchPosts(setPosts);

  const loadMorePosts = () => {
    if (nextCursor && hasNextPage && !loading) {
      fetchPosts(nextCursor, true);
    }
  };

  const fetchUserProfile = async (id) => {
    try {
      const response = await fetch(`api/roommate-profile/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorInfo = await response.json();
        throw new Error(errorInfo.error || "Failed to fetch user profile");
      }

      const profileFetched = await response.json();
      setUserProfile(profileFetched);
      setShowProfileModal(true);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(
    () => {
      if (!user) {
        return;
      }
      fetchPosts();
    },
    [user],
    posts,
  );

  return (
    <>
      <div className="post-container">
        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <img
                  className="post-profile-picture"
                  src={`/api/roommate-profile/profile-picture/${post.user.id}`}
                  alt="profile-picture"
                  onError={(e) => {
                    e.target.src = fallbackProfilePic;
                  }}
                />
                <button
                  className="post-username"
                  onClick={() => fetchUserProfile(post.user.id)}
                >
                  {post.user.name}
                </button>
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

      {hasNextPage && (
        <button
          className="btn-primary"
          onClick={loadMorePosts}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}

      {showProfileModal && (
        <ProfileModal
          userProfile={userProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
};

export default WithAuth(Dashboard);

// custom hook to fetch posts
function useFetchPosts(setPosts) {
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async (cursor = null, append = false) => {
    try {
      setLoading(true);
      const url = cursor ? `/api/post?cursor=${cursor}` : "/api/post";

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorInfo = await response.json();
        throw new Error(errorInfo.error || "Failed to fetch posts");
      }

      const {
        posts: postsFetched,
        nextCursor: newCursor,
        hasNextPage: hasMore,
      } = await response.json();

      if (append) {
        setPosts((prevPosts) => [...prevPosts, ...postsFetched]);
      } else {
        setPosts(postsFetched);
      }

      setNextCursor(newCursor);
      setHasNextPage(hasMore);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  return { fetchPosts, nextCursor, hasNextPage, loading };
}
