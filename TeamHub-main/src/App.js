import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TeamDetails from './pages/TeamDetails';
import Login from './pages/Login';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Signup from './pages/Signup'; 
import JoinTeam from "./pages/joinTeam";
import CreateTeam from './pages/create_team'; 
import ProfilePage from './pages/profileUpdate';
import MyTeams from './pages/MyTeams';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import JoinEvent from './pages/JoinEvent';
import Payment from './pages/Payment';
import TeamChat from './components/TeamChat'; 
import EventDetails from './pages/EventDetails';

function LandingPage() {
  return (
    <div className="home" style={{ textAlign: 'center', paddingTop: '3rem' }}>
      <h1>Welcome to TeamHub</h1>
      <img src="/teamhub_banner.png" alt="TeamHub Banner" className="home-banner" />
      <Link to="/signup" className="signup-link">Sign Up</Link>
    </div>
  );
}


function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/team/:id" element={<TeamDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/join-team" element={<JoinTeam />} />
                <Route path="/create-team" element={<CreateTeam />} />
                <Route path="/updateprofile" element={<ProfilePage />} />
                <Route path="/my-teams" element={<MyTeams />} />
                <Route path="/events" element={<Events />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/join-event" element={<JoinEvent />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/join-event/:eventId" element={<JoinEvent />} />
                <Route path="/team-chat/:teamId" element={<TeamChat />} /> {/* Add TeamChat route */}
                <Route path="/events/:eventId" element={<EventDetails />} />
                <Route path="/user/:userId" element={<ProfilePage />} />

              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
