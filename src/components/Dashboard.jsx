import React, { useEffect, useState } from "react";
import "./assets/css/Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../config/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Cookies from "js-cookie";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [recentDebates, setRecentDebates] = useState([]);
  const [loading, setLoading] = useState(true);

  const userCookie = user || (Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null);

  const topics = [
    { id: "1", title: "Social Media Impact", desc: "Does social media do more harm than good?", level: "intermediate", participants: "2.1k", category: "technology", color: "blue" },
    { id: "2", title: "Climate Change Solutions", desc: "Should individual actions or government policies be prioritized?", level: "advanced", participants: "1.8k", category: "environment", color: "green" },
    { id: "3", title: "Remote Work Future", desc: "Is remote work better than office work?", level: "beginner", participants: "3.2k", category: "business", color: "purple" },
    { id: "4", title: "AI in Education", desc: "Will AI replace human teachers?", level: "intermediate", participants: "1.5k", category: "education", color: "orange" },
    { id: "5", title: "Universal Basic Income", desc: "Should governments provide universal basic income?", level: "advanced", participants: "900", category: "politics", color: "red" },
    { id: "6", title: "Space Exploration", desc: "Should we prioritize space exploration or Earth’s problems?", level: "intermediate", participants: "1.2k", category: "ethics", color: "cyan" },
  ];

  useEffect(() => {
    const fetchDebates = async () => {
      if (!userCookie) {
        setLoading(false);
        return;
      }

      try {
        const sessionsRef = collection(db, "debateSessions");
        const q = query(sessionsRef, where("user.email", "==", userCookie.email));
        const querySnapshot = await getDocs(q);

        const fetched = [];
        querySnapshot.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));

        // Sort by newest first
        fetched.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        setRecentDebates(fetched);
        console.log(fetched);
        
      } catch (err) {
        console.error("Error fetching debate history:", err);
      }
      
      setLoading(false);
    };

    fetchDebates();
  }, [userCookie]);

  return (
    <div className="dashboard">
      <div className="header">
        <h2>
          Welcome back, <Link to={"/profile"}>{userCookie?.name}</Link>!
        </h2>
        <p>Ready to improve your English through debate?</p>
      </div>

      {/* Stats Section */}
      <div className="stats">
        <div className="stat-card blue">
          <h3>Total Debates</h3>
          <p>{recentDebates.length}</p>
        </div>
        <div className="stat-card green">
          <h3>Average Score</h3>
          <p>
            {recentDebates.length
              ? (
                  recentDebates.reduce((sum, d) => sum + (d.feedback?.average_score || 0), 0) /
                  recentDebates.length
                ).toFixed(1) + "/10"
              : "0/10"}
          </p>
        </div>
        <div className="stat-card purple">
          <h3>This Week</h3>
          <p>
            {recentDebates.filter(
              (d) =>
                new Date(d.timestamp.seconds * 1000) >=
                new Date(new Date().setDate(new Date().getDate() - 7))
            ).length}
          </p>
        </div>
        <div className="stat-card orange">
          <h3>Streak</h3>
          <p>{recentDebates.length ? 1 : 0}</p>
        </div>
      </div>

      {/* Topics Section */}
      <div className="topics-section">
        <h3>Choose Your Debate Topic</h3>
        <div className="topics-grid">
          {topics.map((t) => (
            <Link to={`/debate/${t.title}`} key={t.id} className={`topic-card ${t.color}`}>
              <h4>{t.title}</h4>
              <p>{t.desc}</p>
              <div className="topic-meta">
                <span className={`level ${t.level}`}>{t.level}</span>
                <span>👥 {t.participants}</span>
                <span>{t.category}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="tips-card">
          <h4>Quick Tips</h4>
          <ul>
            <li><b>Stay Focused</b> – Listen carefully to AI responses and build on them</li>
            <li><b>Practice Daily</b> – Consistency is key to improving your English fluency</li>
          </ul>
        </div>

        <div className="recent-card">
          <h4><Link to={"/stats"}>My Stats</Link></h4>
          {loading ? (
            <p className="stats-loading">Loading your sessions...</p>
          ) : recentDebates.length === 0 ? (
            <p className="stats-loading">No debate sessions found.</p>
          ) : (
            recentDebates.map((d) => {
              const date = d.timestamp
                ? new Date(d.timestamp.seconds * 1000).toLocaleString()
                : "Unknown Date";

              return (
                <div
                  key={d.id}
                  className="debate-item"
                  onClick={() => navigate(`/stats/${d.id}`)}
                >
                  <h5>{d.topic}</h5>
                  <p>{date}</p>
                  <div className="debate-meta">
                    <span className={`level ${d.difficulty || "intermediate"}`}>{d.difficulty || "intermediate"}</span>
                    <span>{d.topicCategory || "general"}</span>
                    <span className="score">{d.feedback?.average_score || 0}/10</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
