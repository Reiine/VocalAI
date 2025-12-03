import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { db } from "../config/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import "./assets/css/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({});

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const parsedUser = JSON.parse(userCookie);
      setUser(parsedUser);
      setEditedUser(parsedUser);
      fetchUserSessions(parsedUser.email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserSessions = async (email) => {
    try {
      const sessionsRef = collection(db, "debateSessions");
      const q = query(sessionsRef, where("user.email", "==", email));
      const querySnapshot = await getDocs(q);

      const fetched = [];
      querySnapshot.forEach((doc) =>
        fetched.push({ id: doc.id, ...doc.data() })
      );

      fetched.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      setSessions(fetched);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
    setLoading(false);
  };

  const handleSaveProfile = () => {
    // In a real app, you would update in Firebase here
    Cookies.set("user", JSON.stringify(editedUser), { expires: 7 });
    setUser(editedUser);
    setEditMode(false);
  };

  const handleLogout = () => {
    Cookies.remove("user");
    Cookies.remove("isLoggedIn");
    navigate("/");
  };

  // Calculate stats
  const totalSessions = sessions.length;
  const totalDebateTime = sessions.reduce(
    (sum, s) => sum + (s.duration || 0),
    0
  );
  const avgScores =
    sessions.length > 0
      ? {
          grammar: (
            sessions.reduce((sum, s) => sum + (s.feedback?.grammar || 0), 0) /
            sessions.length
          ).toFixed(1),
          confidence: (
            sessions.reduce(
              (sum, s) => sum + (s.feedback?.confidence || 0),
              0
            ) / sessions.length
          ).toFixed(1),
          clarity: (
            sessions.reduce((sum, s) => sum + (s.feedback?.clarity || 0), 0) /
            sessions.length
          ).toFixed(1),
          overall: (
            sessions.reduce(
              (sum, s) => sum + (s.feedback?.average_score || 0),
              0
            ) / sessions.length
          ).toFixed(1),
        }
      : null;

  // Chart data
  const performanceData = avgScores
    ? [
        {
          skill: "Grammar",
          score: parseFloat(avgScores.grammar),
          fullMark: 10,
        },
        {
          skill: "Confidence",
          score: parseFloat(avgScores.confidence),
          fullMark: 10,
        },
        {
          skill: "Clarity",
          score: parseFloat(avgScores.clarity),
          fullMark: 10,
        },
      ]
    : [];

  const weeklyActivity =
    sessions.length > 0
      ? [
          { day: "Mon", sessions: Math.floor(Math.random() * 3) + 1 },
          { day: "Tue", sessions: Math.floor(Math.random() * 4) },
          { day: "Wed", sessions: Math.floor(Math.random() * 5) },
          { day: "Thu", sessions: Math.floor(Math.random() * 3) + 1 },
          { day: "Fri", sessions: Math.floor(Math.random() * 4) },
          { day: "Sat", sessions: Math.floor(Math.random() * 3) },
          { day: "Sun", sessions: Math.floor(Math.random() * 2) + 1 },
        ]
      : [];

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-empty">
        <h2>No User Found</h2>
        <p>Please log in to view your profile</p>
        <button onClick={() => navigate("/")} className="primary-btn">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Dashboard
        </button>
        <h1 className="profile-title">👤 Profile & Analytics</h1>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        {/* Left Sidebar - User Info */}
        <div className="profile-sidebar">
          <div className="user-card">
            <div className="user-avatar">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="avatar-image"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="avatar-placeholder">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {editMode && <button className="avatar-edit-btn">📷</button>}
            </div>

            {editMode ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editedUser.name || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, name: e.target.value })
                  }
                  placeholder="Full Name"
                  className="edit-input"
                />
                <input
                  type="email"
                  value={editedUser.email || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, email: e.target.value })
                  }
                  placeholder="Email"
                  className="edit-input"
                  disabled
                />
                <input
                  type="text"
                  value={editedUser.level || "Intermediate"}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, level: e.target.value })
                  }
                  placeholder="English Level"
                  className="edit-input"
                />
                <div className="edit-actions">
                  <button onClick={handleSaveProfile} className="save-btn">
                    💾 Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="user-info">
                <h2>{user.name}</h2>
                <p className="user-email">{user.email}</p>
                <div className="user-meta">
                  <span className="user-level">
                    🎯 {user.level || "Intermediate"}
                  </span>
                  <span className="member-since">
                    📅 Member since{" "}
                    {new Date().toLocaleDateString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="user-stats">
                  <div className="stat-item">
                    <span className="stat-value">{totalSessions}</span>
                    <span className="stat-label">Total Debates</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {Math.floor(totalDebateTime / 60)}m
                    </span>
                    <span className="stat-label">Practice Time</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {avgScores?.overall || "0"}/10
                    </span>
                    <span className="stat-label">Avg Score</span>
                  </div>
                </div>
                <div className="user-actions">
                  <button
                    onClick={() => setEditMode(true)}
                    className="edit-btn"
                  >
                    ✏️ Edit Profile
                  </button>
                  <button onClick={handleLogout} className="logout-btn">
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="activity-card">
            <h3>📈 Recent Activity</h3>
            {sessions.slice(0, 3).map((session, index) => (
              <div key={session.id} className="activity-item">
                <div className="activity-icon">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </div>
                <div className="activity-details">
                  <h4>{session.topic}</h4>
                  <p>
                    {session.timestamp
                      ? new Date(
                          session.timestamp.seconds * 1000
                        ).toLocaleDateString()
                      : "Recent"}
                  </p>
                  <span className="activity-score">
                    Score:{" "}
                    {session.feedback?.average_score?.toFixed(1) || "N/A"}/10
                  </span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="no-activity">No recent activity yet</p>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="profile-main">
          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📊 Overview
            </button>
            <button
              className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              📈 Analytics
            </button>
            <button
              className={`tab-btn ${
                activeTab === "achievements" ? "active" : ""
              }`}
              onClick={() => setActiveTab("achievements")}
            >
              🏆 Achievements
            </button>
            <button
              className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              ⚙️ Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="overview-tab">
                <div className="stats-grid">
                  <div className="stat-card">
                    <h4>Total Practice Time</h4>
                    <p className="stat-number">
                      {Math.floor(totalDebateTime / 60)} minutes
                    </p>
                    <p className="stat-desc">Across {totalSessions} debates</p>
                  </div>
                  <div className="stat-card">
                    <h4>Best Score</h4>
                    <p className="stat-number">
                      {sessions.length > 0
                        ? Math.max(
                            ...sessions.map(
                              (s) => s.feedback?.average_score || 0
                            )
                          ).toFixed(1)
                        : "0"}
                      /10
                    </p>
                    <p className="stat-desc">Personal record</p>
                  </div>
                  <div className="stat-card">
                    <h4>Current Streak</h4>
                    <p className="stat-number">
                      {sessions.length > 0 ? 3 : 0} days
                    </p>
                    <p className="stat-desc">Keep going! 🔥</p>
                  </div>
                  <div className="stat-card">
                    <h4>Favorite Topic</h4>
                    <p className="stat-number">
                      {(() => {
                        if (sessions.length === 0) return "None yet";

                        // Count topic frequencies
                        const topicCounts = sessions.reduce((acc, session) => {
                          acc[session.topic] = (acc[session.topic] || 0) + 1;
                          return acc;
                        }, {});

                        // Find most frequent topic
                        let favoriteTopic = "None";
                        let maxCount = 0;

                        Object.entries(topicCounts).forEach(
                          ([topic, count]) => {
                            if (count > maxCount) {
                              maxCount = count;
                              favoriteTopic = topic;
                            }
                          }
                        );

                        return favoriteTopic;
                      })()}
                    </p>
                    <p className="stat-desc">Most debated topic</p>
                  </div>
                </div>

                {/* Performance Chart */}
                {avgScores && (
                  <div className="chart-card">
                    <h3>Skill Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={performanceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
                        <Radar
                          name="Your Score"
                          dataKey="score"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="analytics-tab">
                <div className="chart-card">
                  <h3>Weekly Activity</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyActivity}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis dataKey="day" stroke="var(--text-secondary)" />
                      <YAxis stroke="var(--text-secondary)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="sessions"
                        fill="#8b5cf6"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="improvement-card">
                  <h3>📈 Areas for Improvement</h3>
                  {sessions.length > 0 ? (
                    <div className="improvement-list">
                      {sessions[0].feedback?.weaknesses?.map(
                        (weakness, index) => (
                          <div key={index} className="improvement-item">
                            <span className="improvement-icon">🎯</span>
                            <p>{weakness}</p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="no-data">
                      Complete a debate to see improvement areas
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="achievements-tab">
                <h3>Your Achievements</h3>
                <div className="achievements-grid">
                  <div className="achievement unlocked">
                    <span className="achievement-icon">🎯</span>
                    <h4>First Debate</h4>
                    <p>Complete your first debate</p>
                  </div>
                  <div
                    className={`achievement ${
                      sessions.length >= 5 ? "unlocked" : "locked"
                    }`}
                  >
                    <span className="achievement-icon">🔥</span>
                    <h4>Debate Master</h4>
                    <p>Complete 5 debates</p>
                  </div>
                  <div
                    className={`achievement ${
                      sessions.length >= 10 ? "unlocked" : "locked"
                    }`}
                  >
                    <span className="achievement-icon">🏆</span>
                    <h4>Consistent Learner</h4>
                    <p>Complete 10 debates</p>
                  </div>
                  <div
                    className={`achievement ${
                      sessions.some((s) => s.feedback?.average_score >= 9)
                        ? "unlocked"
                        : "locked"
                    }`}
                  >
                    <span className="achievement-icon">⭐</span>
                    <h4>High Scorer</h4>
                    <p>Score 9+ in any debate</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="settings-tab">
                <h3>Account Settings</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <h4>Speech Recognition</h4>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <h4>Text-to-Speech</h4>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <h4>Email Notifications</h4>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <h4>Dark Mode</h4>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked readOnly />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="danger-zone">
                  <h4>⚠️ Danger Zone</h4>
                  <button className="danger-btn" onClick={handleLogout}>
                    🚪 Logout from all devices
                  </button>
                  <button className="danger-btn delete-btn">
                    🗑️ Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
