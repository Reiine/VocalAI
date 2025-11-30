import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
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

        fetched.sort((a, b) => b.timestamp - a.timestamp); // newest first
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
      <p className="stats-loading">
        User not logged in.
      </p>
    );
  }

  if (loading) {
    return (
      <p className="stats-loading">
        Loading your sessions...
      </p>
    );
  }

  return (
    <div className="stats-container">
      <h1 className="stats-title">📊 Your Debate Sessions</h1>

      {sessions.length === 0 ? (
        <p className="stats-loading">No debate sessions found.</p>
      ) : (
        <div className="stats-list">
          {sessions.map((session) => {
            const time = session.timestamp
              ? new Date(session.timestamp.seconds * 1000).toLocaleString()
              : "Unknown Date";

            return (
              <div
                key={session.id}
                className="stats-card"
                onClick={() => navigate(`/stats/${session.id}`)}
              >
                <h2>{session.topic}</h2>
                <p>{time}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Stats;
