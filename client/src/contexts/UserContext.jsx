import { createContext, useState, useContext, useEffect } from "react";
import { getBaseUrl } from "../utils/url.js";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hasRoommateProfile, setHasRoommateProfile] = useState(false);
  const [recommendationType, setRecommendationType] = useState(null);

  const checkIfUserHasRoommateProfile = async () => {
    if (!user) {
      return;
    }

    try {
      const response = await fetch(`${getBaseUrl()}/api/roommate-profile/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setHasRoommateProfile(!!data);
      } else {
        setHasRoommateProfile(false);
      }
    } catch (error) {
      setHasRoommateProfile(false);
    }
  };

  // logout function to track user authentication state across tabs
  const logout = () => {
    localStorage.setItem("logout-event", Date.now().toString());
    setUser(null);
    setHasRoommateProfile(false);
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "logout-event") {
        setUser(null);
        setHasRoommateProfile(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    checkIfUserHasRoommateProfile();
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        hasRoommateProfile,
        setHasRoommateProfile,
        checkIfUserHasRoommateProfile,
        recommendationType,
        setRecommendationType,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
