import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hasRoommateProfile, setHasRoommateProfile] = useState(false);

  const checkIfUserHasRoommateProfile = async () => {
    if (!user) {
      return;
    }

    try {
      const response = await fetch(`/api/roommate-profile/me`, {
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
