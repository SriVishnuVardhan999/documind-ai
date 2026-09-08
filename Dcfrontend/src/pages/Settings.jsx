import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Bell,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("documindUser");

  const user = savedUser
    ? JSON.parse(savedUser)
    : {
        name: "User",
        email: "user@email.com",
      };

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [documentNotifications, setDocumentNotifications] = useState(true);
  const [aiNotifications, setAiNotifications] = useState(false);

  const [message, setMessage] = useState("");

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleProfileSave = (event) => {
    event.preventDefault();

    const updatedUser = {
      ...user,
      name,
      email,
    };

    localStorage.setItem(
      "documindUser",
      JSON.stringify(updatedUser)
    );

    showMessage("Profile updated successfully.");
  };

  const handlePasswordSave = (event) => {
    event.preventDefault();

    if (!currentPassword || !newPassword) {
      showMessage("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("New password must contain at least 6 characters.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");

    showMessage("Password updated successfully.");
  };

  const handleNotificationSave = () => {
    localStorage.setItem(
      "documindNotifications",
      JSON.stringify({
        emailNotifications,
        documentNotifications,
        aiNotifications,
      })
    );

    showMessage("Notification settings saved.");
  };

  return (
    <div className="settings-page">

      {/* TOP HEADER */}

      <header className="settings-header">

        <div className="settings-header-left">

          <button
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </button>

          <div>

            <p className="settings-label">
              ACCOUNT MANAGEMENT
            </p>

            <h1>Settings</h1>

            <span>
              Manage your profile, security, and preferences.
            </span>

          </div>

        </div>

        <button
          className="dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </button>

      </header>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="settings-message">

          <Check size={18} />

          {message}

        </div>
      )}

      <div className="settings-layout">

        {/* LEFT MENU */}

        <aside className="settings-menu">

          <div className="settings-user-card">

            <div className="settings-avatar">

              <User size={28} />

            </div>

            <div>

              <h3>{name || "User"}</h3>

              <p>{email || "user@email.com"}</p>

            </div>

          </div>

          <button className="settings-menu-item active">

            <User size={19} />

            Profile

          </button>

          <button className="settings-menu-item">

            <Lock size={19} />

            Security

          </button>

          <button className="settings-menu-item">

            <Bell size={19} />

            Notifications

          </button>

        </aside>

        {/* SETTINGS CONTENT */}

        <main className="settings-content">

          {/* PROFILE */}

          <section className="settings-card">

            <div className="card-heading">

              <div className="heading-icon profile-icon">

                <User size={21} />

              </div>

              <div>

                <h2>Profile Information</h2>

                <p>
                  Update your personal account information.
                </p>

              </div>

            </div>

            <form onSubmit={handleProfileSave}>

              <div className="form-grid">

                <div className="form-group">

                  <label>Full Name</label>

                  <div className="input-box">

                    <User size={18} />

                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Enter your full name"
                      required
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>Email Address</label>

                  <div className="input-box">

                    <Mail size={18} />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="Enter your email"
                      required
                    />

                  </div>

                </div>

              </div>

              <button
                type="submit"
                className="save-button"
              >

                <Save size={17} />

                Save Profile

              </button>

            </form>

          </section>

          {/* SECURITY */}

          <section className="settings-card">

            <div className="card-heading">

              <div className="heading-icon security-icon">

                <ShieldCheck size={21} />

              </div>

              <div>

                <h2>Password & Security</h2>

                <p>
                  Keep your DocuMind AI account secure.
                </p>

              </div>

            </div>

            <form onSubmit={handlePasswordSave}>

              <div className="form-grid">

                <div className="form-group">

                  <label>Current Password</label>

                  <div className="input-box">

                    <KeyRound size={18} />

                    <input
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter current password"
                    />

                    <button
                      type="button"
                      className="password-button"
                      onClick={() =>
                        setShowCurrentPassword(
                          !showCurrentPassword
                        )
                      }
                    >

                      {showCurrentPassword
                        ? <EyeOff size={18} />
                        : <Eye size={18} />
                      }

                    </button>

                  </div>

                </div>

                <div className="form-group">

                  <label>New Password</label>

                  <div className="input-box">

                    <Lock size={18} />

                    <input
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter new password"
                    />

                    <button
                      type="button"
                      className="password-button"
                      onClick={() =>
                        setShowNewPassword(
                          !showNewPassword
                        )
                      }
                    >

                      {showNewPassword
                        ? <EyeOff size={18} />
                        : <Eye size={18} />
                      }

                    </button>

                  </div>

                </div>

              </div>

              <p className="password-note">

                Password must contain at least 6 characters.

              </p>

              <button
                type="submit"
                className="save-button"
              >

                <Lock size={17} />

                Update Password

              </button>

            </form>

          </section>

          {/* NOTIFICATIONS */}

          <section className="settings-card">

            <div className="card-heading">

              <div className="heading-icon notification-icon">

                <Bell size={21} />

              </div>

              <div>

                <h2>Notification Preferences</h2>

                <p>
                  Choose which updates you want to receive.
                </p>

              </div>

            </div>

            <div className="notification-list">

              <div className="notification-row">

                <div>

                  <h4>Email Notifications</h4>

                  <p>
                    Receive important account updates by email.
                  </p>

                </div>

                <label className="switch">

                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(event) =>
                      setEmailNotifications(
                        event.target.checked
                      )
                    }
                  />

                  <span className="slider"></span>

                </label>

              </div>

              <div className="notification-row">

                <div>

                  <h4>Document Processing Updates</h4>

                  <p>
                    Get notified when your documents are processed.
                  </p>

                </div>

                <label className="switch">

                  <input
                    type="checkbox"
                    checked={documentNotifications}
                    onChange={(event) =>
                      setDocumentNotifications(
                        event.target.checked
                      )
                    }
                  />

                  <span className="slider"></span>

                </label>

              </div>

              <div className="notification-row">

                <div>

                  <h4>AI Activity Updates</h4>

                  <p>
                    Receive updates about new AI features.
                  </p>

                </div>

                <label className="switch">

                  <input
                    type="checkbox"
                    checked={aiNotifications}
                    onChange={(event) =>
                      setAiNotifications(
                        event.target.checked
                      )
                    }
                  />

                  <span className="slider"></span>

                </label>

              </div>

            </div>

            <button
              className="save-button"
              onClick={handleNotificationSave}
            >

              <Save size={17} />

              Save Preferences

            </button>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Settings;