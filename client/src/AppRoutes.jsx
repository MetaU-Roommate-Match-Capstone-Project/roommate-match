import './App.css'
import AppLayout from './AppLayout';
import CreateAccount from './pages/CreateAccount/CreateAccount';
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function AppRoutes() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path='/create-account' element={<CreateAccount/>} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default AppRoutes;
