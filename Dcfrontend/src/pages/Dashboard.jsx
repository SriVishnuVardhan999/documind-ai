import {
  LayoutDashboard,
  Upload,
  FileText,
  MessageSquare,
  Search,
  History,
  Settings,
  LogOut,
  Bell,
  User,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const savedUser = localStorage.getItem("currentUser");

  const user =
    isLoggedIn && savedUser
      ? JSON.parse(savedUser)
      : {
          name: "Guest",
          email: "Click to Login",
        };

  const handleLogout = () => {
    // Remove only login session
    localStorage.removeItem("isLoggedIn");

    // Go to Guest Dashboard
    navigate("/dashboard", { replace: true });

    // Refresh Dashboard
    window.location.reload();
  };

  return (
    <div className="dm-dashboard">

      {/* SIDEBAR */}
      <aside className="dm-sidebar">

        <div className="dm-logo">
          <div className="dm-logo-icon">
            <FileText size={23} />
          </div>

          <div>
            <h2>DocuMind</h2>
            <span>AI DOCUMENTS</span>
          </div>
        </div>

        <p className="dm-menu-title">MAIN MENU</p>

        <nav className="dm-navigation">

          <button className="dm-nav-item dm-active">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button
            className="dm-nav-item"
            onClick={() => navigate("/upload")}
          >
            <Upload size={20} />
            <span>Upload Document</span>
          </button>

          <button
            className="dm-nav-item"
            onClick={() => navigate("/documents")}
          >
            <FileText size={20} />
            <span>My Documents</span>
          </button>

          <button
            className="dm-nav-item"
            onClick={() => navigate("/ask-ai")}
          >
            <MessageSquare size={20} />
            <span>Ask AI</span>
          </button>

          <button
            className="dm-nav-item"
            onClick={() => navigate("/search")}
          >
            <Search size={20} />
            <span>Search</span>
          </button>

          <button
            className="dm-nav-item"
            onClick={() => navigate("/history")}
          >
            <History size={20} />
            <span>History</span>
          </button>

        </nav>

        <div className="dm-sidebar-bottom">

          <button
            className="dm-nav-item"
            onClick={() => navigate("/settings")}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>

          {isLoggedIn && (
            <button
              className="dm-logout"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Logout
            </button>
          )}

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="dm-main">

        {/* TOP HEADER */}
        <header className="dm-header">

          <div>
            <p className="dm-small-text">
              OVERVIEW
            </p>

            <h1>
              Welcome back,{" "}
              <span>
                {user.name}
              </span>
              <span className="dm-wave">👋</span>
            </h1>

            <p className="dm-description">
              Here is what is happening with your documents today.
            </p>
          </div>

          <div className="dm-header-right">

            <button className="dm-notification">
              <Bell size={21} />
              <span></span>
            </button>

            {isLoggedIn ? (
              <div className="dm-user">
                <div className="dm-avatar">
                  <User size={21} />
                </div>

                <div className="dm-user-details">
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                </div>
              </div>
            ) : (
              <div
                className="dm-user"
                onClick={() => navigate("/login")}
                style={{ cursor: "pointer" }}
              >
                <div className="dm-avatar">
                  <User size={21} />
                </div>

                <div className="dm-user-details">
                  <h4>Guest</h4>
                  <p>Click to Login</p>
                </div>
              </div>
            )}

          </div>

        </header>
        {/* STATISTICS */}
        <section className="dm-stats">

          <article className="dm-stat-card">

            <div className="dm-stat-icon dm-blue">
              <FileText size={24} />
            </div>

            <div>
              <p>Total Documents</p>
              <h2>0</h2>
              <span>No documents yet</span>
            </div>

          </article>

          <article className="dm-stat-card">

            <div className="dm-stat-icon dm-purple">
              <MessageSquare size={24} />
            </div>

            <div>
              <p>Questions Asked</p>
              <h2>0</h2>
              <span>Start asking AI</span>
            </div>

          </article>

          <article className="dm-stat-card">

            <div className="dm-stat-icon dm-green">
              <Search size={24} />
            </div>

            <div>
              <p>Searches</p>
              <h2>0</h2>
              <span>Search your content</span>
            </div>

          </article>

        </section>

        {/* QUICK ACTIONS */}
        <section className="dm-action-grid">

          <article className="dm-upload-panel">

            <div className="dm-panel-top">

              <div className="dm-panel-icon">
                <Upload size={25} />
              </div>

              <span className="dm-ready">
                Ready to upload
              </span>

            </div>

            <h2>
              Add a new document
            </h2>

            <p>
              Upload PDF, DOCX, or TXT files and let
              DocuMind AI extract and understand the content.
            </p>

            <button
              className="dm-primary-button"
              onClick={() => navigate("/upload")}
            >
              <Upload size={18} />
              Upload Document
              <ArrowUpRight size={17} />
            </button>

            <div className="dm-file-types">
              Supported: PDF · DOCX · TXT
            </div>

          </article>

          <article className="dm-ai-panel">

            <div className="dm-ai-glow"></div>

            <div className="dm-panel-icon dm-ai-icon">
              <Sparkles size={25} />
            </div>

            <h2>
              Ask DocuMind AI
            </h2>

            <p>
              Get accurate answers from your uploaded
              documents with AI-powered search.
            </p>

            <button
              className="dm-ai-button"
              onClick={() => navigate("/ask-ai")}
            >
              <Sparkles size={18} />
              Ask a Question
            </button>

          </article>

        </section>

        {/* RECENT DOCUMENTS */}
        <section className="dm-recent">

          <div className="dm-section-header">

            <div>
              <h2>Recent Documents</h2>

              <p>
                View and manage your recently uploaded files.
              </p>
            </div>

            <button
              className="dm-view-all"
              onClick={() => navigate("/documents")}
            >
              View all
              <ArrowUpRight size={17} />
            </button>

          </div>

          <div className="dm-empty-state">

            <div className="dm-empty-icon">
              <FileText size={35} />
            </div>

            <h3>
              No documents uploaded
            </h3>

            <p>
              Upload your first document to start
              analyzing and asking questions.
            </p>

            <button
              className="dm-empty-button"
              onClick={() => navigate("/upload")}
            >
              Upload your first document
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
