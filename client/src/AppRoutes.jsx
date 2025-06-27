import AppLayout from './AppLayout';
import CreateAccount from './pages/CreateAccount/CreateAccount';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import WithAuth from './components/WithAuth/WithAuth';
import RoommateProfileForm from './pages/RoommateProfileForm/RoommateProfileForm';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';

const ProtectedDashboard = WithAuth(Dashboard);

function AppRoutes() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path='/create-account' element={<CreateAccount/>} />
            <Route path='/login' element={<Login />} />
            <Route path='/dashboard' element={<ProtectedDashboard />} />
            <Route path='/roommate-profile-form' element={<RoommateProfileForm />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  )
}

export default AppRoutes;
