import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { getBaseUrl } from "../../utils/url";
import Spinner from "../Spinner/Spinner";

const WithAuth = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
      if (!user) {
        fetch(`${getBaseUrl()}/api/users/me`, { credentials: "include" })
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
      return <Spinner />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default WithAuth;
