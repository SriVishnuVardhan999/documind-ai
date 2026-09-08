import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Upload from "./pages/Upload";
import Documents from "./pages/Documents";
import AskAI from "./pages/AskAI";
import HistoryPage from "./pages/HistoryPage";

import ProtectedRoute from "./components/ProtectedRoute";


function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            HOME PAGE
            First page when website is opened
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =================================================
            SIGNUP
        ================================================= */}

        <Route
          path="/auth/signup"
          element={<Signup />}
        />


        {/* =================================================
            DASHBOARD
            Guest and logged-in users can access
        ================================================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =================================================
            UPLOAD
            Login required
        ================================================= */}

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            DOCUMENTS
            Login required
        ================================================= */}

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            ASK AI
            Login required
        ================================================= */}

        <Route
          path="/ask-ai"
          element={
            <ProtectedRoute>
              <AskAI />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            HISTORY
            Login required
        ================================================= */}

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            SETTINGS
            Login required
        ================================================= */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            UNKNOWN URL
            Return to Home
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;