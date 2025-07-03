import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { getUrl } from "../../utils/url";

const WithAuth = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
      if (!user) {
        fetch(`${getUrl()}/api/users/me`, { credentials: "include" })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Not authenticated");
            }
          })
          .then((data) => {
            if (data.id) {
              setUser(data);
            } else {
              navigate("/login");
            }
          })
          .catch(() => {
            navigate("/login");
          });
      }
    }, [user, setUser, navigate]);

    if (!user) {
      return <p>Loading...</p>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default WithAuth;
