import AppLayout from "./AppLayout";
import CreateAccount from "./pages/CreateAccount/CreateAccount";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import WithAuth from "./components/WithAuth/WithAuth";
import CurrentUserProfile from "./pages/CurrentUserProfile/CurrentUserProfile";
import Recommendations from "./pages/Recommendations/Recommendations";
import RoommateRequests from "./pages/RoommateRequests/RoommateRequests";
import RoommatePod from "./pages/RoommatePod/RoommatePod";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";

const ProtectedDashboard = WithAuth(Dashboard);

function AppRoutes() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedDashboard />} />
            <Route
              path="/current-user-profile"
              element={<CurrentUserProfile />}
            />
            <Route
              path="/roommate-recommendations"
              element={<Recommendations />}
            />
            <Route path="/roommate-requests" element={<RoommateRequests />} />
            <Route path="/roommate-pod" element={<RoommatePod />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default AppRoutes;
