import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected Personal Pages
import LearningDNA from './pages/LearningDNA';
import Sessions from './pages/Sessions';
import StartLearning from './pages/StartLearning';
import ActiveSession from './pages/ActiveSession';
import SessionComplete from './pages/SessionComplete';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#050709] text-[#F3F4F6] flex flex-col font-sans">
          {/* Global Sticky Navbar */}
          <Navbar />

          {/* Main Route Content */}
          <main className="flex-1 flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route
                path="/learning-dna"
                element={
                  <ProtectedRoute>
                    <LearningDNA />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sessions"
                element={
                  <ProtectedRoute>
                    <Sessions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn"
                element={
                  <ProtectedRoute>
                    <StartLearning />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/session/:sessionId"
                element={
                  <ProtectedRoute>
                    <ActiveSession />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/session/:sessionId/complete"
                element={
                  <ProtectedRoute>
                    <SessionComplete />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
