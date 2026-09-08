import {
  LayoutDashboard,
  Upload,
  FileText,
  MessageSquare,
  History,
  Settings,
  LogOut,
  Bell,
  User,
  Sparkles,
  ArrowUpRight,
  Eye,
  Loader2,
  Activity,
  RefreshCw,
  CloudUpload,
  Brain,
  FileCheck2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useEffect, useRef, useState } from "react";

import API from "../services/api";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  // =====================================================
  // LOGIN / USER
  // =====================================================

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true",
  );

  const [user, setUser] = useState({
    name: "Guest",
    email: "Click to Login",
  });

  // =====================================================
  // DASHBOARD STATE
  // =====================================================

  const [documents, setDocuments] = useState([]);

  const [documentCount, setDocumentCount] = useState(0);

  const [questionCount, setQuestionCount] = useState(0);

  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [previewingId, setPreviewingId] = useState(null);

  const [error, setError] = useState("");

  const [animatedDocuments, setAnimatedDocuments] = useState(0);

  const [animatedQuestions, setAnimatedQuestions] = useState(0);

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";

    setIsLoggedIn(loggedIn);

    const savedUser = localStorage.getItem("currentUser");

    if (loggedIn && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);

        setUser({
          name: parsedUser.name || "User",
          email: parsedUser.email || "",
        });
      } catch {
        setUser({
          name: "User",
          email: "",
        });
      }
    } else {
      setUser({
        name: "Guest",
        email: "Click to Login",
      });
    }
  }, []);

  // =====================================================
  // GET DASHBOARD DATA
  // =====================================================

  const getDashboard = async () => {
    /*
      IMPORTANT:

      Guest users must NEVER receive
      another user's documents.

      Therefore we do not call the backend
      when the user is logged out.
    */

    if (!isLoggedIn) {
      setDocuments([]);

      setDocumentCount(0);

      setQuestionCount(0);

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setError("");

      const response = await API.get("/dashboard/");

      const data = response.data || {};

      console.log("Dashboard:", data);

      const recentDocuments = Array.isArray(data.recent_documents)
        ? data.recent_documents
        : [];

      const totalDocuments = data.statistics?.total_documents || 0;

      const totalQuestions = data.statistics?.total_questions || 0;

      setDocuments(recentDocuments);

      setDocumentCount(totalDocuments);

      setQuestionCount(totalQuestions);
    } catch (error) {
      console.error("Dashboard error:", error);

      setDocuments([]);

      setDocumentCount(0);

      setQuestionCount(0);

      setError(
        error.response?.data?.detail || "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {
    getDashboard();
  }, [isLoggedIn]);

  // =====================================================
  // ANIMATE DOCUMENT COUNT
  // =====================================================

  useEffect(() => {
    if (loading) {
      return;
    }

    let current = 0;

    const target = isLoggedIn ? documentCount : 0;

    setAnimatedDocuments(0);

    if (target === 0) {
      setAnimatedDocuments(0);

      return;
    }

    const increment = Math.max(1, Math.ceil(target / 25));

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;

        clearInterval(timer);
      }

      setAnimatedDocuments(current);
    }, 35);

    return () => clearInterval(timer);
  }, [documentCount, loading, isLoggedIn]);

  // =====================================================
  // ANIMATE QUESTION COUNT
  // =====================================================

  useEffect(() => {
    if (loading) {
      return;
    }

    let current = 0;

    const target = isLoggedIn ? questionCount : 0;

    setAnimatedQuestions(0);

    if (target === 0) {
      setAnimatedQuestions(0);

      return;
    }

    const increment = Math.max(1, Math.ceil(target / 30));

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;

        clearInterval(timer);
      }

      setAnimatedQuestions(current);
    }, 35);

    return () => clearInterval(timer);
  }, [questionCount, loading, isLoggedIn]);

  // =====================================================
  // LOGIN REQUIRED
  // =====================================================

  const requireLogin = () => {
    if (!isLoggedIn) {
      navigate("/login");

      return false;
    }

    return true;
  };

  // =====================================================
  // FILE PICKER
  // =====================================================

  const handleUploadClick = () => {
    if (!requireLogin()) {
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // =====================================================
  // UPLOAD DOCUMENT
  // =====================================================

  const handleFileUpload = async (event) => {
    if (!isLoggedIn) {
      event.target.value = "";

      navigate("/login");

      return;
    }

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // -------------------------------------------------
    // ALLOWED FILE TYPES
    // -------------------------------------------------

    const allowedExtensions = ["pdf", "doc", "docx", "txt"];

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      alert("Please upload PDF, DOC, DOCX or TXT files.");

      event.target.value = "";

      return;
    }

    // -------------------------------------------------
    // MAX FILE SIZE = 20 MB
    // -------------------------------------------------

    const maxSize = 20 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("File size must be less than 20 MB.");

      event.target.value = "";

      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {
      setUploading(true);

      setUploadProgress(10);

      await API.post("/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },

        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100,
            );

            setUploadProgress(Math.min(progress, 95));
          }
        },
      });

      setUploadProgress(100);

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh dashboard

      await getDashboard();

      alert("Document uploaded successfully.");
    } catch (error) {
      console.error("Upload error:", error);

      alert(error.response?.data?.detail || "Document upload failed.");
    } finally {
      setUploading(false);

      setUploadProgress(0);

      event.target.value = "";
    }
  };

  // =====================================================
  // VIEW DOCUMENT
  // =====================================================

  const previewDocument = async (documentId) => {
    if (!requireLogin()) {
      return;
    }

    try {
      setPreviewingId(documentId);

      const response = await API.get(`/documents/${documentId}/view`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error("Preview error:", error);

      alert(error.response?.data?.detail || "Unable to open document.");
    } finally {
      setPreviewingId(null);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    // Remove all login information

    localStorage.removeItem("token");

    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("currentUser");

    // Clear current React state immediately

    setIsLoggedIn(false);

    setUser({
      name: "Guest",
      email: "Click to Login",
    });

    setDocuments([]);

    setDocumentCount(0);

    setQuestionCount(0);

    setAnimatedDocuments(0);

    setAnimatedQuestions(0);

    // Go to Guest dashboard

    navigate("/dashboard", {
      replace: true,
    });

    /*
      Reload guarantees that every component
      reads the new localStorage state.
    */

    window.location.reload();
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Recently";
    }

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  // =====================================================
  // FORMAT FILE SIZE
  // =====================================================

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "—";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="dm-dashboard">
      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dm-sidebar">
        {/* LOGO */}

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

        {/* NAVIGATION */}

        <nav className="dm-navigation">
          {/* DASHBOARD */}

          <button
            className="dm-nav-item dm-active"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard size={20} />

            <span>Dashboard</span>
          </button>

          {/* UPLOAD */}

          <button className="dm-nav-item" onClick={handleUploadClick}>
            <Upload size={20} />

            <span>Upload Document</span>
          </button>

          {/* DOCUMENTS */}

          <button
            className="dm-nav-item"
            onClick={() => {
              if (requireLogin()) {
                navigate("/documents");
              }
            }}
          >
            <FileText size={20} />

            <span>My Documents</span>
          </button>

          {/* ASK AI */}

          <button
            className="dm-nav-item"
            onClick={() => {
              if (requireLogin()) {
                navigate("/ask-ai");
              }
            }}
          >
            <MessageSquare size={20} />

            <span>Ask AI</span>
          </button>

          {/* HISTORY */}

          <button
            className="dm-nav-item"
            onClick={() => {
              if (requireLogin()) {
                navigate("/history");
              }
            }}
          >
            <History size={20} />

            <span>History</span>
          </button>
        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="dm-sidebar-bottom">
          {/* SETTINGS */}

          <button
            className="dm-nav-item"
            onClick={() => {
              if (requireLogin()) {
                navigate("/settings");
              }
            }}
          >
            <Settings size={20} />

            <span>Settings</span>
          </button>

          {/* LOGOUT */}

          {isLoggedIn && (
            <button className="dm-logout" onClick={handleLogout}>
              <LogOut size={20} />
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="dm-main">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="dm-header">
          <div>
            <p className="dm-small-text">
              {isLoggedIn ? "WORKSPACE OVERVIEW" : "WORKSPACE"}
            </p>

            <h1>
              {isLoggedIn ? (
                <>
                  Welcome back, <span>{user.name}</span>
                  <span className="dm-wave">👋</span>
                </>
              ) : (
                <>
                  Welcome to <span>DocuMind</span>
                  <span className="dm-wave">👋</span>
                </>
              )}
            </h1>

            <p className="dm-description">
              {isLoggedIn
                ? "Manage your documents and explore them with AI."
                : "Your intelligent document workspace."}
            </p>
          </div>

          <div className="dm-header-right">
            {/* NOTIFICATION */}

            <button className="dm-notification" title="Notifications">
              <Bell size={21} />

              {isLoggedIn && <span className="dm-notification-dot"></span>}
            </button>

            {/* USER */}

            <div
              className="dm-user"
              onClick={() => {
                if (!isLoggedIn) {
                  navigate("/login");
                }
              }}
              style={{
                cursor: isLoggedIn ? "default" : "pointer",
              }}
            >
              <div className="dm-avatar">
                <User size={21} />
              </div>

              <div className="dm-user-details">
                <h4>{isLoggedIn ? user.name : "Guest"}</h4>

                <p>{isLoggedIn ? user.email : "Click to Login"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && isLoggedIn && (
          <div className="dm-error">
            <span>{error}</span>

            <button onClick={getDashboard}>
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            LIVE STATUS
        ================================================= */}

        <div className="dm-live-bar">
          <div className="dm-live-left">
            <span className="dm-live-dot"></span>

            <span>Workspace active</span>
          </div>

          <div className="dm-live-right">
            <Activity size={15} />

            <span>AI Ready</span>
          </div>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="dm-stats">
          {/* TOTAL DOCUMENTS */}

          <article className="dm-stat-card">
            <div className="dm-stat-icon dm-blue">
              <FileText size={24} />
            </div>

            <div className="dm-stat-content">
              <p>Total Documents</p>

              <h2>{loading && isLoggedIn ? "..." : animatedDocuments}</h2>

              <span>
                {isLoggedIn
                  ? documentCount === 0
                    ? "Ready for your first upload"
                    : "Documents in workspace"
                  : "No documents yet"}
              </span>
            </div>
          </article>

          {/* AI QUESTIONS */}

          <article className="dm-stat-card">
            <div className="dm-stat-icon dm-purple">
              <MessageSquare size={24} />
            </div>

            <div className="dm-stat-content">
              <p>AI Questions</p>

              <h2>{loading && isLoggedIn ? "..." : animatedQuestions}</h2>

              <span>
                {isLoggedIn
                  ? questionCount === 0
                    ? "Start asking questions"
                    : "Questions answered"
                  : "Login to ask AI"}
              </span>
            </div>
          </article>

          {/* AI WORKSPACE */}

          <article
            className="
              dm-stat-card
              dm-stat-highlight
            "
          >
            <div className="dm-stat-icon dm-green">
              <Brain size={24} />
            </div>

            <div className="dm-stat-content">
              <p>AI Workspace</p>

              <h2>Ready</h2>

              <span>Document intelligence active</span>
            </div>
          </article>
        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="dm-action-grid">
          {/* UPLOAD PANEL */}

          <article className="dm-upload-panel">
            <div className="dm-panel-top">
              <div className="dm-panel-icon">
                <CloudUpload size={25} />
              </div>

              <span className="dm-ready">
                <span className="dm-status-dot"></span>
                Ready to upload
              </span>
            </div>

            <h2>Add a new document</h2>

            <p>
              Upload PDF, DOCX, or TXT files and let DocuMind AI extract and
              understand your content.
            </p>

            {uploading ? (
              <div className="dm-upload-progress">
                <div className="dm-progress-header">
                  <span>Uploading document</span>

                  <strong>{uploadProgress}%</strong>
                </div>

                <div className="dm-progress-track">
                  <div
                    className="dm-progress-fill"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>

                <span>Processing your file...</span>
              </div>
            ) : (
              <button className="dm-primary-button" onClick={handleUploadClick}>
                <Upload size={18} />
                Upload Document
                <ArrowUpRight size={17} />
              </button>
            )}

            <div className="dm-file-types">
              Supported: PDF · DOCX · TXT · Max 20 MB
            </div>
          </article>

          {/* ASK AI PANEL */}

          <article className="dm-ai-panel">
            <div
              className="
                dm-ai-orb
                orb-one
              "
            />

            <div
              className="
                dm-ai-orb
                orb-two
              "
            />

            <div
              className="
                dm-panel-icon
                dm-ai-icon
              "
            >
              <Sparkles size={25} />
            </div>

            <span className="dm-ai-live">
              <span></span>
              AI ONLINE
            </span>

            <h2>Ask DocuMind AI</h2>

            <p>
              Ask questions about your documents and get intelligent answers
              instantly.
            </p>

            <button
              className="dm-ai-button"
              onClick={() => {
                if (requireLogin()) {
                  navigate("/ask-ai");
                }
              }}
            >
              <Sparkles size={18} />
              Ask a Question
              <ArrowUpRight size={17} />
            </button>
          </article>
        </section>

        {/* =================================================
            RECENT DOCUMENTS
        ================================================= */}

        <section className="dm-recent">
          <div className="dm-section-header">
            <div>
              <div className="dm-section-title">
                <FileCheck2 size={19} />

                <h2>Recent Documents</h2>
              </div>

              <p>
                {isLoggedIn
                  ? "Your latest documents and their processing status."
                  : "Your recent documents will appear here."}
              </p>
            </div>

            {/* VIEW ALL */}

            <button
              className="dm-view-all"
              onClick={() => {
                if (requireLogin()) {
                  navigate("/documents");
                }
              }}
            >
              View all
              <ArrowUpRight size={17} />
            </button>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && isLoggedIn ? (
            <div className="dm-document-list">
              {[1, 2, 3].map((item) => (
                <div
                  className="
                      dm-document-card
                      dm-skeleton-card
                    "
                  key={item}
                >
                  <div
                    className="
                        dm-skeleton
                        dm-skeleton-icon
                      "
                  />

                  <div
                    className="
                        dm-skeleton-content
                      "
                  >
                    <div
                      className="
                          dm-skeleton
                          dm-skeleton-title
                        "
                    />

                    <div
                      className="
                          dm-skeleton
                          dm-skeleton-text
                        "
                    />
                  </div>

                  <div
                    className="
                        dm-skeleton
                        dm-skeleton-button
                      "
                  />
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="dm-empty-state">
              <div className="dm-empty-icon">
                <FileText size={34} />
              </div>

              <h3>No documents uploaded</h3>

              <p>
                {isLoggedIn
                  ? "Upload your first document to start extracting information and asking AI questions."
                  : "Login to upload and manage your documents."}
              </p>

              <button
                className="dm-empty-button"
                onClick={() => {
                  if (isLoggedIn) {
                    handleUploadClick();
                  } else {
                    navigate("/login");
                  }
                }}
              >
                <Upload size={17} />

                {isLoggedIn ? "Upload Document" : "Login to Continue"}
              </button>
            </div>
          ) : (
            /* =================================================
               DOCUMENT LIST
            ================================================= */

            <div className="dm-document-list">
              {documents.slice(0, 3).map((doc, index) => (
                <div
                  className="dm-document-card"
                  key={doc.id}
                  style={{
                    animationDelay: `${index * 0.08}s`,
                  }}
                >
                  {/* DOCUMENT ICON */}

                  <div className="dm-document-icon">
                    <FileText size={25} />
                  </div>

                  {/* DOCUMENT INFORMATION */}

                  <div className="dm-document-info">
                    <h3 title={doc.file_name}>{doc.file_name}</h3>

                    <p>
                      {doc.file_type || "PDF Document"}

                      {" • "}

                      {formatFileSize(doc.file_size)}

                      {" • "}

                      {formatDate(doc.uploaded_at)}
                    </p>
                  </div>

                  {/* ONLY VIEW BUTTON */}

                  <div className="dm-document-actions">
                    <button
                      className="dm-document-view"
                      onClick={() => previewDocument(doc.id)}
                      disabled={previewingId === doc.id}
                      title="View document"
                    >
                      {previewingId === doc.id ? (
                        <Loader2 size={16} className="dm-spin" />
                      ) : (
                        <Eye size={16} />
                      )}

                      {previewingId === doc.id ? "Opening" : "View"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =================================================
            HIDDEN FILE INPUT
        ================================================= */}

        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx,.txt"
          style={{
            display: "none",
          }}
          onChange={handleFileUpload}
        />
      </main>
    </div>
  );
}

export default Dashboard;
