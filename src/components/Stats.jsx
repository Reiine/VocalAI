import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../config/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./assets/css/Stats.css";

const Stats = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const userCookie = Cookies.get("user");
  const user = userCookie ? JSON.parse(userCookie) : null;

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const sessionsRef = collection(db, "debateSessions");
        const q = query(sessionsRef, where("user.email", "==", user.email));
        const querySnapshot = await getDocs(q);

        const fetched = [];
        querySnapshot.forEach((doc) =>
          fetched.push({ id: doc.id, ...doc.data() })
        );

        fetched.sort((a, b) => b.timestamp - a.timestamp);
        setSessions(fetched);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }

      setLoading(false);
    };

    fetchSessions();
  }, []);

  if (!user) {
    return (
      <div className="empty-state">
        <h3>User Not Logged In</h3>
        <p>Please log in to view your debate sessions</p>
        <Link to="/" className="primary-btn">
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="stats-loading">Loading your sessions...</p>;
  }

  // Calculate summary stats
  const totalSessions = sessions.length;
  const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const avgScore = sessions.length > 0 
    ? (sessions.reduce((sum, session) => sum + (session.feedback?.average_score || 0), 0) / sessions.length).toFixed(1)
    : 0;

  return (
    <div className="stats-container">
      <Link to="/" className="stats-back-btn">
        ← Back to Dashboard
      </Link>
      
      <h1 className="stats-title">Your Debate Sessions</h1>
      
      {sessions.length > 0 && (
        <div className="stats-summary">
          <div className="summary-item">
            <h3>Total Sessions</h3>
            <p>{totalSessions}</p>
          </div>
          <div className="summary-item">
            <h3>Avg. Score</h3>
            <p>{avgScore}/10</p>
          </div>
          <div className="summary-item">
            <h3>Total Time</h3>
            <p>{Math.floor(totalDuration / 60)}m</p>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="empty-state">
          <h3>No Debate Sessions Yet</h3>
          <p>Start your first debate to see your statistics and progress here</p>
          <Link to="/dashboard" className="primary-btn">
            Start a Debate →
          </Link>
        </div>
      ) : (
        <div className="stats-list">
          {sessions.map((session, index) => {
            const time = session.timestamp
              ? new Date(session.timestamp.seconds * 1000).toLocaleString()
              : "Unknown Date";

            return (
              <div
                key={session.id}
                className={`stats-card ${index === 0 ? 'recent' : ''}`}
                onClick={() => navigate(`/stats/${session.id}`)}
              >
                <h2>{session.topic}</h2>
                <p>{time}</p>
                {session.feedback?.average_score && (
                  <span className="score-badge">
                    Score: {session.feedback.average_score.toFixed(1)}/10
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Stats;