import React from "react";
import { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import WithAuth from "../../components/WithAuth/WithAuth";

const Dashboard = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/post", {
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

      const postsFetched = await response.json();
      setPosts(postsFetched);
      setError(null);

    } catch (error) {
      console.error("Error fetching posts: ", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }
    fetchPosts();
  }, [user]);

  return (
    <>
      <div className="post-container">
        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
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
    </>
  );
};

export default WithAuth(Dashboard);
