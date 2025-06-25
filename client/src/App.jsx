import './App.css'
import CreateAccount from './pages/CreateAccount/CreateAccount';
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/create-account' element={<CreateAccount/>}></Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
