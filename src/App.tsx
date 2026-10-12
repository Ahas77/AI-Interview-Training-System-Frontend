import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PageProvider } from "./context/PageContext";

import "./App.css";
import SigninPage from "./app/auth/signin";
import RegisterPage from "./app/auth/register";
import Dashboard from "./app/dashboard/dashboard";
import InterviewCheckoutPage from "./app/interview/checkout";
import HRSessionPage from "./app/interview/HRSessionPage";
import Profile from "./components/profile/profile";
import { ToastContainer } from "react-toastify";
import { ChatProvider } from "./components/dashboardLayout/ChatContext";
import { JSX, useEffect } from "react";
import { useDevtoolsDetection } from './hooks/useDevtoolsDetection';
import { getAuthToken, getStoredValue } from "./app/lib/authStorage";
import ProgressOverviewPage from "./app/progress/ProgressOverviewPage";
import SessionDetailPage from "./app/progress/SessionDetailPage";
import CoachingPage from "./app/progress/CoachingPage";
import AdminEvaluationPage from "./app/progress/AdminEvaluationPage";
import WarmupPage from "./app/progress/WarmupPage";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const token = getAuthToken();
  if (token) {
    return <Navigate to="/interview-checkout" replace />;
  }
  return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const token = getAuthToken();
  const role = getStoredValue("role");
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  if (role !== "admin") {
    return <Navigate to="/progress" replace />;
  }
  return children;
};

const App = () => {
  useDevtoolsDetection();
  return (
    <PageProvider>
      <ChatProvider>
        <Router>
          <ScrollToTop />
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            <Route path="/" element={<Navigate to="/interview-checkout" replace />} />
            <Route
              path="/signin"
              element={
                <PublicRoute>
                  <SigninPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/interview-checkout"
              element={
                <ProtectedRoute>
                  <InterviewCheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/session/:sessionId"
              element={
                <ProtectedRoute>
                  <HRSessionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressOverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress/session/:sessionId"
              element={
                <ProtectedRoute>
                  <SessionDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress/warmup"
              element={
                <ProtectedRoute>
                  <WarmupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coaching"
              element={
                <ProtectedRoute>
                  <CoachingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/evaluation"
              element={
                <AdminRoute>
                  <AdminEvaluationPage />
                </AdminRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </Router>
      </ChatProvider>
    </PageProvider>
  );
};

export default App;
