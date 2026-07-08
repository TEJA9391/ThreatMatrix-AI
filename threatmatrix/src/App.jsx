import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Analysis from './pages/Analysis';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Trending from './pages/Trending';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/"          element={<Analysis />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history"   element={<History />} />
          <Route path="/trending"  element={<Trending />} />
        </Routes>
      </Layout>
    </Router>
  );
}
