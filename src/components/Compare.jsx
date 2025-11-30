import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../config/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  where,
  query,
  getDocs,
} from "firebase/firestore";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

import "./assets/css/Compare.css";

const Compare = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [current, setCurrent] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const currRef = doc(db, "debateSessions", id);
        const currSnap = await getDoc(currRef);

        if (!currSnap.exists()) {
          setLoading(false);
          return;
        }

        const curr = { id: currSnap.id, ...currSnap.data() };
        setCurrent(curr);

        // Find previous session
        const q = query(
          collection(db, "debateSessions"),
          where("user.email", "==", curr.user.email)
        );

        const snaps = await getDocs(q);

        let sessions = [];
        snaps.forEach((d) => sessions.push({ id: d.id, ...d.data() }));

        sessions.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

        const currIndex = sessions.findIndex((s) => s.id === curr.id);
        if (currIndex !== -1 && currIndex + 1 < sessions.length) {
          setPrevious(sessions[currIndex + 1]);
        }
      } catch (err) {
        console.error("Comparison load error:", err);
      }

      setLoading(false);
    };

    loadSessions();
  }, [id]);

  if (loading)
    return <p className="compare-loading">Loading comparison...</p>;

  if (!current)
    return <p className="compare-loading">Session not found.</p>;

  if (!previous)
    return (
      <div className="compare-container">
        <button onClick={() => navigate(-1)} className="compare-back-btn">
          ← Back
        </button>

        <h1>No Previous Session Found</h1>
        <p>You need at least two sessions to compare progress.</p>
      </div>
    );

  /* --------------------------
      CHART DATA
    -------------------------- */
  const radarData = [
    {
      skill: "Grammar",
      current: current.feedback.grammar,
      previous: previous.feedback.grammar,
    },
    {
      skill: "Confidence",
      current: current.feedback.confidence,
      previous: previous.feedback.confidence,
    },
    {
      skill: "Clarity",
      current: current.feedback.clarity,
      previous: previous.feedback.clarity,
    },
  ];

  const barData = [
    {
      category: "Grammar",
      current: current.feedback.grammar,
      previous: previous.feedback.grammar,
    },
    {
      category: "Confidence",
      current: current.feedback.confidence,
      previous: previous.feedback.confidence,
    },
    {
      category: "Clarity",
      current: current.feedback.clarity,
      previous: previous.feedback.clarity,
    },
  ];

  const lineData = [
    {
      session: "Previous",
      avg: (
        (previous.feedback.grammar +
          previous.feedback.confidence +
          previous.feedback.clarity) /
        3
      ).toFixed(2),
    },
    {
      session: "Current",
      avg: (
        (current.feedback.grammar +
          current.feedback.confidence +
          current.feedback.clarity) /
        3
      ).toFixed(2),
    },
  ];

  return (
    <div className="compare-container">
      <button onClick={() => navigate(-1)} className="compare-back-btn">
        ← Back
      </button>

      <h1 className="compare-title">📊 Comparison Report</h1>
      <p className="compare-subtitle">
        Comparing your recent session with your previous performance.
      </p>

      {/* --------------------------
          RADAR CHART
      -------------------------- */}
      <div className="compare-section">
        <h2>Radar Skill Comparison</h2>
        <RadarChart
          cx={250}
          cy={200}
          outerRadius={140}
          width={500}
          height={400}
          data={radarData}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis angle={30} domain={[0, 10]} />
          <Radar
            name="Current"
            dataKey="current"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.6}
          />
          <Radar
            name="Previous"
            dataKey="previous"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.4}
          />
          <Legend />
        </RadarChart>
      </div>

      {/* --------------------------
          BAR CHART
      -------------------------- */}
      <div className="compare-section">
        <h2>Category-wise Comparison</h2>

        <BarChart width={500} height={300} data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="current" fill="#4f46e5" />
          <Bar dataKey="previous" fill="#ef4444" />
        </BarChart>
      </div>

      {/* --------------------------
          LINE CHART
      -------------------------- */}
      <div className="compare-section">
        <h2>Average Score Trend</h2>

        <LineChart width={500} height={300} data={lineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="session" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Line type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={3} />
        </LineChart>
      </div>

      {/* --------------------------
          Strengths vs Weaknesses
      -------------------------- */}
      <div className="compare-strengths-container">
        <div className="compare-card">
          <h3>💪 Current Strengths</h3>
          {current.feedback.strengths.map((s, i) => (
            <p key={i}>• {s}</p>
          ))}
        </div>

        <div className="compare-card">
          <h3>⚠ Previous Weaknesses</h3>
          {previous.feedback.weaknesses.map((w, i) => (
            <p key={i}>• {w}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Compare;
