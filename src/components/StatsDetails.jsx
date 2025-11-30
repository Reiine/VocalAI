import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "./assets/css/StatsDetails.css";

const StatsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const ref = doc(db, "debateSessions", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setSession(snap.data());
        }
      } catch (err) {
        console.error("Error loading session details:", err);
      }
      setLoading(false);
    };

    fetchSession();
  }, [id]);

  if (loading)
    return <p className="stats-loading">Loading session details...</p>;
  if (!session) return <p className="stats-loading">Session not found.</p>;

  const { topic, duration, userReplies, feedback, timestamp } = session;

  const humanTime = timestamp
    ? new Date(timestamp.seconds * 1000).toLocaleString()
    : "Unknown";
  const averageScore = feedback
    ? ((feedback.grammar + feedback.confidence + feedback.clarity) / 3).toFixed(
        1
      )
    : 0;

  return (
    <div className="stats-details-container">
      {/* Header */}
      <button className="stats-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 className="stats-details-title">{topic}</h1>
      <p className="stats-details-timestamp">{humanTime}</p>

      {/* Session Summary */}
      <div className="stats-summary">
        <div className="stats-summary-card">
          <p className="stats-summary-label">Duration</p>
          <h2 className="stats-summary-value">{duration} sec</h2>
        </div>

        <div className="stats-summary-card">
          <p className="stats-summary-label">Average Score</p>
          <h2 className="stats-summary-value">{averageScore}</h2>
        </div>

        <div className="stats-summary-card">
          <p className="stats-summary-label">AI Evaluation</p>
          <h2 className="stats-summary-value">Completed</h2>
        </div>
      </div>

      {/* Ratings */}
      <h2 className="stats-section-title">📈 Performance Ratings</h2>
      <RatingBar label="Grammar" value={feedback.grammar} />
      <RatingBar label="Confidence" value={feedback.confidence} />
      <RatingBar label="Clarity" value={feedback.clarity} />

      {/* Average Score */}
      <div className="stats-detailed-feedback">
        <h3 className="stats-section-title">🏆 Average Score</h3>
        <div className="rating-bar">
          <div className="rating-bar-labels">
            <span>Average</span>
            <span>{feedback.average_score}</span>
          </div>
          <div className="rating-bar-bg">
            <div
              className="rating-bar-fill"
              style={{ width: `${averageScore * 10}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="stats-strengths-weaknesses">
        <div className="stats-card">
          <h3>💪 Strengths</h3>
          {feedback.strengths.map((data, index) => {
            return <p>{data}</p>;
          })}
        </div>

        <div className="stats-card">
          <h3>⚠ Weaknesses</h3>
          {feedback.weaknesses.map((data, index) => {
            return <p>{data}</p>;
          })}
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="stats-detailed-feedback">
        <h3 className="stats-section-title">📝 Detailed Feedback</h3>
        <p className="text-gray-700 whitespace-pre-line">
          {feedback.detailed_feedback}
        </p>
      </div>
      <button
        className="compare-btn"
        onClick={() => navigate(`/compare/${id}`)}
      >
        📊 Compare With Previous Session
      </button>
    </div>
  );
};

export default StatsDetails;

/* ----------------------------
   PROGRESS BAR COMPONENT
----------------------------- */

const RatingBar = ({ label, value }) => {
  return (
    <div className="rating-bar">
      <div className="rating-bar-labels">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="rating-bar-bg">
        <div
          className="rating-bar-fill"
          style={{ width: `${value * 10}%` }}
        ></div>
      </div>
    </div>
  );
};
