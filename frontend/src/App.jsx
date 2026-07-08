import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DarkWebMonitor from './pages/DarkWebMonitor';
import PhishingDetection from './pages/PhishingDetection';
import FakeNewsDetection from './pages/FakeNewsDetection';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Profile from './pages/Profile';
import About from './pages/About';
import Auth from './pages/Auth';
import { UserProvider } from './context/UserContext.jsx';

function App() {
  return (
    <UserProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/darkweb" element={<DarkWebMonitor />} />
            <Route path="/phishing" element={<PhishingDetection />} />
            <Route path="/fake-news" element={<FakeNewsDetection />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
          </Routes>
        </Layout>
      </Router>
    </UserProvider>
  );
}

export default App;

