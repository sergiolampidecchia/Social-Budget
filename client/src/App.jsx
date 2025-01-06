import { useEffect, useState } from 'react'
import './App.css'
import Login from "./components/Login";
import ProposalForm from './components/ProposalForm.jsx';
import ProposalFormEdit from './components/ProposalFormEdit.jsx';
import API from '../API.js';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import BudgetForm from './components/BudgetForm.jsx';
import AnonymousPage from './components/AnonymousPage.jsx';
import PreferencesPage from './components/PreferencesPage.jsx';
import ProposalList from './components/ProposalList.jsx';
import FeedbackContext from './contexts/FeedbackContext.js';

function App() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [currentPhase, setCurrentPhase] = useState(null);
  const [budget, setBudget] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [proposals, setProposals] = useState([]);
  const [shouldRefresh, setShouldRefresh] = useState(true);

  const setFeedbackFromError = (err) => {
    let message = '';
    if (err.message) message = err.message;
    else message = "Unknown Error";
    setFeedback(message); 
};

  useEffect(() => {
    API.getCurrentSession()
    .then(user => {
      setLoggedIn(true);
      setUser(user);
    })
    .catch(e => {
      if(loggedIn)
        setFeedbackFromError(e);
      setLoggedIn(false);
      setUser(null);
    });
  }, []);

  useEffect(() => {
    API.getPhase()
    .then(phase => {
      setCurrentPhase(phase)
    })
    .then(() => {
      setShouldRefresh(false);
    })
    .catch(e => {
      setFeedbackFromError(e);
    })
  },[user, shouldRefresh]);

  useEffect(() => {
    API.getBudget()
    .then(budget => {
      setBudget(budget)
    })
    .then(() => {
      setShouldRefresh(false);
    })
    .catch(e => {
      setFeedbackFromError(e);
    })
  }, [shouldRefresh]);

  const handleLogin = async (username, password) => {
    const user = await API.login(username, password);
    setUser(user); 
    setLoggedIn(true);
    const phase = await API.getPhase();
    setCurrentPhase(phase);
    setFeedback("Welcome, "+user.name);
    console.log(feedback);
    return user;
  };

  const handleLogout = async () => {
    await API.logout();
    setLoggedIn(false);
    setUser(null);
  }

  return (
    <FeedbackContext.Provider value={{setShouldRefresh}}>
      <div>
      <Router>
        <Routes>
          <Route path='/' element={<Login login={handleLogin} phase={currentPhase}/>}/>
          <Route path='/proposalform' element={<ProposalForm user={user} budget={budget} logout={handleLogout}/>}/>
          <Route path='/proposalform/:id' element={<ProposalFormEdit user={user}  budget={budget} logout={handleLogout}/>}/>
          <Route path='/budgetform' element={<BudgetForm user={user} logout={handleLogout}/>}/>
          <Route path='/proposalist' element={<ProposalList user={user} logout={handleLogout}/>}/>
          <Route path='/anonymouspage' element={<AnonymousPage phase={currentPhase} user={user} logout={handleLogout}/>}/>
          <Route path='/preferencesform' element={<PreferencesPage user={user} logout={handleLogout}/>}></Route>
        </Routes>
      </Router>
    </div>
    </FeedbackContext.Provider>
  )
}

export default App
